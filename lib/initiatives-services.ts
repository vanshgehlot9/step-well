import { db } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  Initiative,
  InitiativeFull,
  InitiativeImage,
  InitiativeLink,
  InitiativeTeamMember,
  InitiativeVideo,
} from "./initiatives-types";

const COL_INITIATIVES = "initiatives";
const COL_IMAGES = "initiative_images";
const COL_VIDEOS = "initiative_videos";
const COL_LINKS = "initiative_links";
const COL_TEAM = "initiative_team";

export const MAX_INITIATIVE_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
export const ALLOWED_VIDEO_MIME = new Set(["video/mp4"]);

export function slugifyInitiativeTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function validateInitiativeFile(
  file: File,
  kind: "image" | "video"
): string | null {
  if (file.size > MAX_INITIATIVE_FILE_BYTES) {
    return `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(2)} MB. Maximum allowed size is 10 MB.`;
  }
  const mime = (file.type || "").toLowerCase();
  if (kind === "image" && !ALLOWED_IMAGE_MIME.has(mime)) {
    return `"${file.name}" is not supported. Allowed image formats: JPG, PNG, WEBP.`;
  }
  if (kind === "video" && !ALLOWED_VIDEO_MIME.has(mime)) {
    return `"${file.name}" is not supported. Maximum video size: 10 MB (MP4 format only).`;
  }
  return null;
}

export async function uploadInitiativeMedia(params: {
  file: File;
  kind: "image" | "video";
  uploadedBy?: string;
  onProgress?: (percent: number) => void;
}): Promise<{
  secure_url: string;
  public_id: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}> {
  const { file, kind, uploadedBy, onProgress } = params;
  const validationError = validateInitiativeFile(file, kind);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("section", "initiatives");
  formData.append(
    "mediaKind",
    kind === "image" ? "initiative-image" : "initiative-video"
  );

  const result = await new Promise<{
    secure_url: string;
    public_id: string;
    bytes?: number;
    width?: number;
    height?: number;
    duration?: number;
  }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/cloudinary/upload");

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve(data);
        } else {
          reject(new Error(data.error || "Cloudinary upload failed."));
        }
      } catch {
        reject(new Error("Invalid response from Cloudinary upload endpoint."));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(formData);
  });

  // Also register in central media library for cross-CMS visibility (best effort)
  try {
    const now = new Date().toISOString();
    await addDoc(collection(db, "media"), {
      fileName: file.name,
      publicId: result.public_id,
      storagePath: result.public_id,
      downloadUrl: result.secure_url,
      mediaType: kind,
      fileType: file.type,
      fileSize: result.bytes ?? file.size,
      ...(result.width ? { width: result.width } : {}),
      ...(result.height ? { height: result.height } : {}),
      ...(result.duration ? { duration: Math.round(result.duration) } : {}),
      section: "restorations",
      altText: file.name.replace(/\.[^.]+$/, ""),
      caption: "",
      uploadedBy: uploadedBy || "admin",
      createdAt: now,
      updatedAt: now,
    });
  } catch {
    // Non-blocking if media library sync fails
  }

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    bytes: result.bytes ?? file.size,
    width: result.width,
    height: result.height,
    duration: result.duration,
  };
}

/** Check if a Cloudinary asset is still referenced by any published initiative before deletion. */
export async function isCloudinaryAssetUsedByPublishedInitiative(
  publicId: string,
  url: string,
  excludeInitiativeId?: string
): Promise<boolean> {
  if (!publicId && !url) return false;
  try {
    const pubInits = await getDocs(
      query(collection(db, COL_INITIATIVES), where("publication_status", "==", "published"))
    );
    for (const d of pubInits.docs) {
      if (d.id === excludeInitiativeId) continue;
      const data = d.data() as Initiative;
      if (url && (data.cover_image === url || data.seo_og_image === url)) return true;
    }

    const [imgSnap, vidSnap, teamSnap] = await Promise.all([
      getDocs(query(collection(db, COL_IMAGES), where("is_published", "==", true))),
      getDocs(query(collection(db, COL_VIDEOS), where("is_published", "==", true))),
      getDocs(query(collection(db, COL_TEAM), where("is_published", "==", true))),
    ]);

    for (const d of imgSnap.docs) {
      const img = d.data() as InitiativeImage;
      if (img.initiative_id === excludeInitiativeId) continue;
      if ((publicId && img.cloudinary_public_id === publicId) || (url && img.image_url === url)) {
        return true;
      }
    }
    for (const d of vidSnap.docs) {
      const vid = d.data() as InitiativeVideo;
      if (vid.initiative_id === excludeInitiativeId) continue;
      if ((publicId && vid.cloudinary_public_id === publicId) || (url && vid.video_url === url)) {
        return true;
      }
    }
    for (const d of teamSnap.docs) {
      const member = d.data() as InitiativeTeamMember;
      if (member.initiative_id === excludeInitiativeId) continue;
      if (
        (publicId && member.cloudinary_public_id === publicId) ||
        (url && member.image_url === url)
      ) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export async function safeDeleteCloudinaryMedia(params: {
  publicId?: string;
  url?: string;
  resourceType?: "image" | "video";
  excludeInitiativeId?: string;
}): Promise<{ deleted: boolean; blockedReason?: string }> {
  const { publicId = "", url = "", resourceType = "image", excludeInitiativeId } = params;
  if (!publicId && !url) return { deleted: false };

  // Skip local public assets
  if (url.startsWith("/") && !publicId) {
    return { deleted: false };
  }

  const inUse = await isCloudinaryAssetUsedByPublishedInitiative(
    publicId,
    url,
    excludeInitiativeId
  );
  if (inUse) {
    return {
      deleted: false,
      blockedReason: "Media is still referenced by another published initiative.",
    };
  }

  try {
    const res = await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId, url, resourceType }),
    });
    return { deleted: res.ok };
  } catch {
    return { deleted: false };
  }
}

async function triggerRevalidation(slug?: string, previousSlug?: string) {
  try {
    await fetch("/api/revalidate-initiatives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, previousSlug }),
    });
  } catch {
    // Non-blocking
  }
}

async function fetchChildrenForInitiative(
  initiativeId: string,
  publishedOnly: boolean
): Promise<{
  images: InitiativeImage[];
  videos: InitiativeVideo[];
  links: InitiativeLink[];
  team: InitiativeTeamMember[];
}> {
  const buildQ = (colName: string) =>
    publishedOnly
      ? query(
          collection(db, colName),
          where("initiative_id", "==", initiativeId),
          where("is_published", "==", true)
        )
      : query(collection(db, colName), where("initiative_id", "==", initiativeId));

  const [imgSnap, vidSnap, linkSnap, teamSnap] = await Promise.all([
    getDocs(buildQ(COL_IMAGES)),
    getDocs(buildQ(COL_VIDEOS)),
    getDocs(buildQ(COL_LINKS)),
    getDocs(buildQ(COL_TEAM)),
  ]);

  const images = imgSnap.docs
    .map((d) => ({ id: d.id, ...d.data() } as InitiativeImage))
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const videos = vidSnap.docs
    .map((d) => ({ id: d.id, ...d.data() } as InitiativeVideo))
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const links = linkSnap.docs.map((d) => ({ id: d.id, ...d.data() } as InitiativeLink));

  const team = teamSnap.docs
    .map((d) => ({ id: d.id, ...d.data() } as InitiativeTeamMember))
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  return { images, videos, links, team };
}

/** Public read: fetches strictly published initiatives with published child media, links & team. */
export async function getPublishedInitiativesFull(): Promise<InitiativeFull[]> {
  try {
    const initSnap = await getDocs(
      query(collection(db, COL_INITIATIVES), where("publication_status", "==", "published"))
    );

    const initiatives = initSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Initiative))
      .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));

    if (initiatives.length === 0) return [];

    const [imgSnap, vidSnap, linkSnap, teamSnap] = await Promise.all([
      getDocs(query(collection(db, COL_IMAGES), where("is_published", "==", true))),
      getDocs(query(collection(db, COL_VIDEOS), where("is_published", "==", true))),
      getDocs(query(collection(db, COL_LINKS), where("is_published", "==", true))),
      getDocs(query(collection(db, COL_TEAM), where("is_published", "==", true))),
    ]);

    const imagesByInit = new Map<string, InitiativeImage[]>();
    imgSnap.docs.forEach((d) => {
      const item = { id: d.id, ...d.data() } as InitiativeImage;
      const arr = imagesByInit.get(item.initiative_id) || [];
      arr.push(item);
      imagesByInit.set(item.initiative_id, arr);
    });

    const videosByInit = new Map<string, InitiativeVideo[]>();
    vidSnap.docs.forEach((d) => {
      const item = { id: d.id, ...d.data() } as InitiativeVideo;
      const arr = videosByInit.get(item.initiative_id) || [];
      arr.push(item);
      videosByInit.set(item.initiative_id, arr);
    });

    const linksByInit = new Map<string, InitiativeLink[]>();
    linkSnap.docs.forEach((d) => {
      const item = { id: d.id, ...d.data() } as InitiativeLink;
      const arr = linksByInit.get(item.initiative_id) || [];
      arr.push(item);
      linksByInit.set(item.initiative_id, arr);
    });

    const teamByInit = new Map<string, InitiativeTeamMember[]>();
    teamSnap.docs.forEach((d) => {
      const item = { id: d.id, ...d.data() } as InitiativeTeamMember;
      const arr = teamByInit.get(item.initiative_id) || [];
      arr.push(item);
      teamByInit.set(item.initiative_id, arr);
    });

    return initiatives.map((init) => ({
      ...init,
      images: (imagesByInit.get(init.id) || []).sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
      ),
      videos: (videosByInit.get(init.id) || []).sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
      ),
      links: linksByInit.get(init.id) || [],
      team: (teamByInit.get(init.id) || []).sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
      ),
    }));
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "permission-denied") {
      console.warn("Initiatives read blocked until updated firestore.rules are published.");
      return [];
    }
    throw err;
  }
}

/** Public read: fetch a single published initiative by slug. */
export async function getPublishedInitiativeBySlug(slug: string): Promise<InitiativeFull | null> {
  try {
    const snap = await getDocs(
      query(
        collection(db, COL_INITIATIVES),
        where("slug", "==", slug),
        where("publication_status", "==", "published")
      )
    );
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    const init = { id: docSnap.id, ...docSnap.data() } as Initiative;
    const children = await fetchChildrenForInitiative(init.id, true);
    return { ...init, ...children };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "permission-denied") {
      console.warn("Initiative detail read blocked until updated firestore.rules are published.");
      return null;
    }
    throw err;
  }
}

/** Admin read: fetch a single initiative (draft or published) by slug for preview. */
export async function getInitiativeBySlugAdmin(slug: string): Promise<InitiativeFull | null> {
  const snap = await getDocs(query(collection(db, COL_INITIATIVES), where("slug", "==", slug)));
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  const init = { id: docSnap.id, ...docSnap.data() } as Initiative;
  const children = await fetchChildrenForInitiative(init.id, false);
  return { ...init, ...children };
}

/** Admin read: fetch all initiatives with media counts. */
export async function getAllInitiativesAdmin(): Promise<InitiativeFull[]> {
  const [initSnap, imgSnap, vidSnap, linkSnap, teamSnap] = await Promise.all([
    getDocs(collection(db, COL_INITIATIVES)),
    getDocs(collection(db, COL_IMAGES)),
    getDocs(collection(db, COL_VIDEOS)),
    getDocs(collection(db, COL_LINKS)),
    getDocs(collection(db, COL_TEAM)),
  ]);

  const initiatives = initSnap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Initiative))
    .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));

  const mapBy = <T extends { initiative_id: string }>(docs: T[]) => {
    const m = new Map<string, T[]>();
    docs.forEach((item) => {
      const arr = m.get(item.initiative_id) || [];
      arr.push(item);
      m.set(item.initiative_id, arr);
    });
    return m;
  };

  const imgMap = mapBy(imgSnap.docs.map((d) => ({ id: d.id, ...d.data() } as InitiativeImage)));
  const vidMap = mapBy(vidSnap.docs.map((d) => ({ id: d.id, ...d.data() } as InitiativeVideo)));
  const linkMap = mapBy(linkSnap.docs.map((d) => ({ id: d.id, ...d.data() } as InitiativeLink)));
  const teamMap = mapBy(
    teamSnap.docs.map((d) => ({ id: d.id, ...d.data() } as InitiativeTeamMember))
  );

  return initiatives.map((init) => ({
    ...init,
    images: (imgMap.get(init.id) || []).sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    ),
    videos: (vidMap.get(init.id) || []).sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    ),
    links: linkMap.get(init.id) || [],
    team: (teamMap.get(init.id) || []).sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    ),
  }));
}

export async function getInitiativeFullAdmin(id: string): Promise<InitiativeFull | null> {
  const snap = await getDoc(doc(db, COL_INITIATIVES, id));
  if (!snap.exists()) return null;
  const init = { id: snap.id, ...snap.data() } as Initiative;
  const children = await fetchChildrenForInitiative(id, false);
  return { ...init, ...children };
}

export interface SaveInitiativePayload {
  id?: string | null;
  initiative: Omit<Initiative, "id" | "created_at" | "updated_at" | "published_at"> & {
    created_at?: string;
    published_at?: string | null;
  };
  images: Array<Omit<InitiativeImage, "id" | "initiative_id" | "is_published" | "created_at"> & { created_at?: string }>;
  videos: Array<Omit<InitiativeVideo, "id" | "initiative_id" | "is_published" | "created_at"> & { created_at?: string }>;
  links: Array<Omit<InitiativeLink, "id" | "initiative_id" | "is_published" | "created_at"> & { created_at?: string }>;
  team: Array<Omit<InitiativeTeamMember, "id" | "initiative_id" | "is_published">>;
  publishNow: boolean;
}

/** Save or update an initiative and synchronize its images, videos, links, and team in Firestore. */
export async function saveInitiativeFull(payload: SaveInitiativePayload): Promise<InitiativeFull> {
  const now = new Date().toISOString();
  const baseSlug =
    slugifyInitiativeTitle(payload.initiative.slug || payload.initiative.title) ||
    `initiative-${Date.now()}`;

  // Ensure slug uniqueness against other initiatives
  const existingSlugSnap = await getDocs(
    query(collection(db, COL_INITIATIVES), where("slug", "==", baseSlug))
  );
  const conflicting = existingSlugSnap.docs.find((d) => d.id !== payload.id);
  const finalSlug = conflicting ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

  let previousSlug: string | undefined;
  let initiativeId = payload.id || "";
  const isPublished = payload.publishNow;

  const primaryImage =
    payload.images.find((i) => i.is_primary)?.image_url ||
    payload.images[0]?.image_url ||
    "";
  const coverImage = payload.initiative.cover_image || primaryImage;

  const initiativeDocData: Omit<Initiative, "id"> = {
    title: payload.initiative.title.trim(),
    slug: finalSlug,
    subtitle: payload.initiative.subtitle.trim(),
    short_description: payload.initiative.short_description.trim(),
    full_description: payload.initiative.full_description,
    category: payload.initiative.category || "Heritage Restoration",
    location: payload.initiative.location.trim(),
    status: payload.initiative.status || "Ongoing",
    cover_image: coverImage,
    is_featured: Boolean(payload.initiative.is_featured),
    display_order: Number(payload.initiative.display_order || 1),
    publication_status: isPublished ? "published" : "draft",
    seo_title: payload.initiative.seo_title || payload.initiative.title.trim(),
    seo_description:
      payload.initiative.seo_description || payload.initiative.short_description.trim(),
    seo_og_image: payload.initiative.seo_og_image || coverImage,
    seo_canonical_url: payload.initiative.seo_canonical_url || "",
    seo_no_index: Boolean(payload.initiative.seo_no_index),
    created_at: payload.initiative.created_at || now,
    updated_at: now,
    published_at: isPublished ? payload.initiative.published_at || now : null,
  };

  if (initiativeId) {
    const existingSnap = await getDoc(doc(db, COL_INITIATIVES, initiativeId));
    if (existingSnap.exists()) {
      previousSlug = (existingSnap.data() as Initiative).slug;
    }
    await updateDoc(doc(db, COL_INITIATIVES, initiativeId), initiativeDocData);
  } else {
    const createdRef = await addDoc(collection(db, COL_INITIATIVES), initiativeDocData);
    initiativeId = createdRef.id;
  }

  // Delete previous child docs for this initiative and write fresh ordered set
  const childCols = [COL_IMAGES, COL_VIDEOS, COL_LINKS, COL_TEAM];
  const oldSnaps = await Promise.all(
    childCols.map((c) =>
      getDocs(query(collection(db, c), where("initiative_id", "==", initiativeId)))
    )
  );

  const deleteBatch = writeBatch(db);
  oldSnaps.forEach((snap) => snap.docs.forEach((d) => deleteBatch.delete(d.ref)));
  await deleteBatch.commit();

  const savedImages: InitiativeImage[] = [];
  for (let idx = 0; idx < payload.images.length; idx++) {
    const img = payload.images[idx];
    const data: Omit<InitiativeImage, "id"> = {
      initiative_id: initiativeId,
      image_url: img.image_url,
      cloudinary_public_id: img.cloudinary_public_id || "",
      alt_text: img.alt_text || "",
      caption: img.caption || "",
      display_order: idx + 1,
      is_primary: Boolean(img.is_primary),
      is_published: isPublished,
      created_at: img.created_at || now,
    };
    const r = await addDoc(collection(db, COL_IMAGES), data);
    savedImages.push({ id: r.id, ...data });
  }

  const savedVideos: InitiativeVideo[] = [];
  for (let idx = 0; idx < payload.videos.length; idx++) {
    const vid = payload.videos[idx];
    if (!vid.video_url) continue;
    const data: Omit<InitiativeVideo, "id"> = {
      initiative_id: initiativeId,
      video_url: vid.video_url,
      cloudinary_public_id: vid.cloudinary_public_id || "",
      video_type: vid.video_type || "upload",
      title: vid.title || "",
      description: vid.description || "",
      file_size: Number(vid.file_size || 0),
      duration_label: vid.duration_label || "",
      display_order: idx + 1,
      is_published: isPublished,
      created_at: vid.created_at || now,
    };
    const r = await addDoc(collection(db, COL_VIDEOS), data);
    savedVideos.push({ id: r.id, ...data });
  }

  const savedLinks: InitiativeLink[] = [];
  for (const link of payload.links) {
    if (!link.url?.trim()) continue;
    const data: Omit<InitiativeLink, "id"> = {
      initiative_id: initiativeId,
      platform: link.platform || "other",
      label: link.label || link.platform,
      url: link.url.trim(),
      is_published: isPublished,
      created_at: link.created_at || now,
    };
    const r = await addDoc(collection(db, COL_LINKS), data);
    savedLinks.push({ id: r.id, ...data });
  }

  const savedTeam: InitiativeTeamMember[] = [];
  for (let idx = 0; idx < payload.team.length; idx++) {
    const member = payload.team[idx];
    if (!member.name?.trim()) continue;
    const data: Omit<InitiativeTeamMember, "id"> = {
      initiative_id: initiativeId,
      name: member.name.trim(),
      role: member.role || "",
      description: member.description || "",
      image_url: member.image_url || "",
      cloudinary_public_id: member.cloudinary_public_id || "",
      display_order: idx + 1,
      is_published: isPublished,
    };
    const r = await addDoc(collection(db, COL_TEAM), data);
    savedTeam.push({ id: r.id, ...data });
  }

  await triggerRevalidation(finalSlug, previousSlug);

  return {
    id: initiativeId,
    ...initiativeDocData,
    images: savedImages,
    videos: savedVideos,
    links: savedLinks,
    team: savedTeam,
  };
}

export async function toggleInitiativePublish(id: string, publish: boolean): Promise<void> {
  const now = new Date().toISOString();
  const refDoc = doc(db, COL_INITIATIVES, id);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) return;
  const existing = snap.data() as Initiative;

  await updateDoc(refDoc, {
    publication_status: publish ? "published" : "draft",
    published_at: publish ? existing.published_at || now : null,
    updated_at: now,
  });

  const childCols = [COL_IMAGES, COL_VIDEOS, COL_LINKS, COL_TEAM];
  const childSnaps = await Promise.all(
    childCols.map((c) => getDocs(query(collection(db, c), where("initiative_id", "==", id))))
  );

  const batch = writeBatch(db);
  childSnaps.forEach((s) =>
    s.docs.forEach((d) => batch.update(d.ref, { is_published: publish }))
  );
  await batch.commit();

  await triggerRevalidation(existing.slug);
}

export async function setInitiativeFeatured(id: string, featured: boolean): Promise<void> {
  const refDoc = doc(db, COL_INITIATIVES, id);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) return;
  const existing = snap.data() as Initiative;

  await updateDoc(refDoc, {
    is_featured: featured,
    updated_at: new Date().toISOString(),
  });

  await triggerRevalidation(existing.slug);
}

export async function updateInitiativeDisplayOrder(
  id: string,
  displayOrder: number
): Promise<void> {
  const refDoc = doc(db, COL_INITIATIVES, id);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) return;
  const existing = snap.data() as Initiative;

  await updateDoc(refDoc, {
    display_order: displayOrder,
    updated_at: new Date().toISOString(),
  });

  await triggerRevalidation(existing.slug);
}

export async function deleteInitiativeFull(id: string): Promise<void> {
  const full = await getInitiativeFullAdmin(id);
  if (!full) return;

  // Delete child documents
  const childCols = [COL_IMAGES, COL_VIDEOS, COL_LINKS, COL_TEAM];
  const childSnaps = await Promise.all(
    childCols.map((c) => getDocs(query(collection(db, c), where("initiative_id", "==", id))))
  );
  const batch = writeBatch(db);
  childSnaps.forEach((s) => s.docs.forEach((d) => batch.delete(d.ref)));
  batch.delete(doc(db, COL_INITIATIVES, id));
  await batch.commit();

  // Safely clean up Cloudinary assets not referenced by other published initiatives
  for (const img of full.images) {
    if (img.cloudinary_public_id) {
      await safeDeleteCloudinaryMedia({
        publicId: img.cloudinary_public_id,
        url: img.image_url,
        resourceType: "image",
        excludeInitiativeId: id,
      });
    }
  }
  for (const vid of full.videos) {
    if (vid.cloudinary_public_id) {
      await safeDeleteCloudinaryMedia({
        publicId: vid.cloudinary_public_id,
        url: vid.video_url,
        resourceType: "video",
        excludeInitiativeId: id,
      });
    }
  }
  for (const member of full.team) {
    if (member.cloudinary_public_id) {
      await safeDeleteCloudinaryMedia({
        publicId: member.cloudinary_public_id,
        url: member.image_url,
        resourceType: "image",
        excludeInitiativeId: id,
      });
    }
  }

  await triggerRevalidation(full.slug);
}
