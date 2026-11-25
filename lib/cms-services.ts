import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import {
  CMSDraftDoc,
  CMSPublishedDoc,
  CMSSectionKey,
  ContentRevision,
} from "./cms-types";
import { CMS_DEFAULTS_MAP, INITIAL_PROJECTS_SEED } from "./cms-defaults";
import { Project, UserProfile, AdminPermissionSet, Role } from "./types";

const REVISIONS_COLLECTION = "contentRevisions";
const PROJECT_DRAFTS_COLLECTION = "projectDrafts";

export interface CMSSectionLoadResult<T> {
  draft: T;
  published: T | null;
  publishedStatus: "published" | "unpublished" | "none";
  draftVersion: number;
  publishedVersion: number;
  updatedAt?: string;
  updatedBy?: string;
  publishedAt?: string;
  publishedBy?: string;
  hasUnpublishedChanges: boolean;
}

/** Load draft + published state for an admin CMS editor. Falls back to migrated defaults if not seeded yet. */
export async function loadCMSSectionAdmin<T>(section: CMSSectionKey): Promise<CMSSectionLoadResult<T>> {
  const defaultData = CMS_DEFAULTS_MAP[section] as T;
  const draftRef = doc(db, section, "draft");
  const pubRef = doc(db, section, "published");

  const [draftSnap, pubSnap] = await Promise.all([getDoc(draftRef), getDoc(pubRef)]);

  const draftDoc = draftSnap.exists() ? (draftSnap.data() as CMSDraftDoc<T>) : null;
  const pubDoc = pubSnap.exists() ? (pubSnap.data() as CMSPublishedDoc<T>) : null;

  const draftData = draftDoc ? { ...defaultData, ...draftDoc.data } : defaultData;
  const publishedData = pubDoc ? { ...defaultData, ...pubDoc.data } : null;

  const publishedStatus: "published" | "unpublished" | "none" = pubDoc
    ? pubDoc.status
    : "none";

  const hasUnpublishedChanges =
    !pubDoc ||
    pubDoc.status !== "published" ||
    JSON.stringify(draftData) !== JSON.stringify(publishedData);

  return {
    draft: draftData,
    published: publishedData,
    publishedStatus,
    draftVersion: draftDoc?.version ?? 0,
    publishedVersion: pubDoc?.version ?? 0,
    updatedAt: draftDoc?.updatedAt,
    updatedBy: draftDoc?.updatedBy,
    publishedAt: pubDoc?.publishedAt,
    publishedBy: pubDoc?.publishedBy,
    hasUnpublishedChanges,
  };
}

/** Save draft for a CMS section without changing published content. */
export async function saveCMSDraft<T>(
  section: CMSSectionKey,
  data: T,
  userEmail: string
): Promise<CMSDraftDoc<T>> {
  const draftRef = doc(db, section, "draft");
  const snap = await getDoc(draftRef);
  const currentVersion = snap.exists() ? (snap.data().version || 0) : 0;

  const payload: CMSDraftDoc<T> = {
    section,
    data,
    updatedAt: new Date().toISOString(),
    updatedBy: userEmail,
    version: currentVersion + 1,
    ...(snap.exists() && snap.data().publishedVersion !== undefined
      ? { publishedVersion: snap.data().publishedVersion }
      : {}),
  };

  await setDoc(draftRef, payload);
  return payload;
}

/** Publish current draft data to `<section>/published` and record a revision snapshot. */
export async function publishCMSSection<T>(
  section: CMSSectionKey,
  data: T,
  userEmail: string,
  note?: string
): Promise<CMSPublishedDoc<T>> {
  const draftRef = doc(db, section, "draft");
  const pubRef = doc(db, section, "published");
  const [draftSnap, pubSnap] = await Promise.all([getDoc(draftRef), getDoc(pubRef)]);

  const nextPubVersion = (pubSnap.exists() ? pubSnap.data().version || 0 : 0) + 1;
  const nextDraftVersion = (draftSnap.exists() ? draftSnap.data().version || 0 : 0) + 1;
  const now = new Date().toISOString();

  const draftPayload: CMSDraftDoc<T> = {
    section,
    data,
    updatedAt: now,
    updatedBy: userEmail,
    version: nextDraftVersion,
    publishedVersion: nextPubVersion,
  };

  const pubPayload: CMSPublishedDoc<T> = {
    section,
    status: "published",
    data,
    publishedAt: now,
    publishedBy: userEmail,
    version: nextPubVersion,
  };

  await Promise.all([
    setDoc(draftRef, draftPayload),
    setDoc(pubRef, pubPayload),
    addDoc(collection(db, REVISIONS_COLLECTION), {
      section,
      version: nextPubVersion,
      action: "publish",
      data,
      createdAt: now,
      createdBy: userEmail,
      note: note || `Published v${nextPubVersion}`,
    }),
  ]);

  return pubPayload;
}

/** Unpublish a CMS section so it is no longer served publicly. */
export async function unpublishCMSSection(
  section: CMSSectionKey,
  userEmail: string
): Promise<void> {
  const pubRef = doc(db, section, "published");
  const pubSnap = await getDoc(pubRef);
  const now = new Date().toISOString();

  if (pubSnap.exists()) {
    const prev = pubSnap.data();
    await updateDoc(pubRef, {
      status: "unpublished",
      publishedAt: now,
      publishedBy: userEmail,
    });
    await addDoc(collection(db, REVISIONS_COLLECTION), {
      section,
      version: prev.version || 0,
      action: "unpublish",
      data: prev.data,
      createdAt: now,
      createdBy: userEmail,
      note: "Unpublished section",
    });
  } else {
    const defaultData = CMS_DEFAULTS_MAP[section];
    await setDoc(pubRef, {
      section,
      status: "unpublished",
      data: defaultData,
      publishedAt: now,
      publishedBy: userEmail,
      version: 0,
    });
  }
}

/** Fetch revision history for a CMS section (or project:<id>). */
export async function getCMSRevisions<T = unknown>(section: string): Promise<ContentRevision<T>[]> {
  try {
    const q = query(
      collection(db, REVISIONS_COLLECTION),
      where("section", "==", section),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContentRevision<T>));
  } catch {
    // Fallback if composite index hasn't been deployed yet
    const q = query(collection(db, REVISIONS_COLLECTION), where("section", "==", section));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as ContentRevision<T>))
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }
}

/** Restore a previous revision into the section's draft and record a restore revision. */
export async function restoreCMSRevision<T>(
  section: CMSSectionKey,
  revision: ContentRevision<T>,
  userEmail: string
): Promise<T> {
  await saveCMSDraft(section, revision.data, userEmail);
  await addDoc(collection(db, REVISIONS_COLLECTION), {
    section,
    version: revision.version,
    action: "restore",
    data: revision.data,
    createdAt: new Date().toISOString(),
    createdBy: userEmail,
    note: `Restored draft from v${revision.version}`,
  });
  return revision.data;
}

/**
 * Fetch published CMS data for public pages.
 * - If `<section>/published` exists and `status === "published"`, returns `{ data, unpublished: false }`.
 * - If `<section>/published` exists and `status === "unpublished"`, returns `{ data: null, unpublished: true }`.
 * - If `<section>/published` doesn't exist yet (before first admin publish) or is denied by rules when unpublished:
 *   - If `permission-denied` (explicitly unpublished under security rules), returns `{ data: null, unpublished: true }`.
 *   - If document simply doesn't exist yet, gracefully falls back to migrated default content so the live site never breaks!
 */
export async function getPublishedCMSSection<T>(
  section: CMSSectionKey
): Promise<{ data: T | null; unpublished: boolean }> {
  const defaultData = CMS_DEFAULTS_MAP[section] as T;
  try {
    const pubSnap = await getDoc(doc(db, section, "published"));
    if (!pubSnap.exists()) {
      return { data: defaultData, unpublished: false };
    }
    const pubDoc = pubSnap.data() as CMSPublishedDoc<T>;
    if (pubDoc.status !== "published") {
      return { data: null, unpublished: true };
    }
    return { data: { ...defaultData, ...pubDoc.data }, unpublished: false };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "permission-denied") {
      return { data: null, unpublished: true };
    }
    console.warn(`Failed reading published CMS section ${section}, using fallback:`, err);
    return { data: defaultData, unpublished: false };
  }
}

/** Fetch draft CMS data (used only in authenticated admin preview mode). */
export async function getDraftCMSSectionForPreview<T>(section: CMSSectionKey): Promise<T> {
  const defaultData = CMS_DEFAULTS_MAP[section] as T;
  try {
    const draftSnap = await getDoc(doc(db, section, "draft"));
    if (draftSnap.exists()) {
      const draftDoc = draftSnap.data() as CMSDraftDoc<T>;
      return { ...defaultData, ...draftDoc.data };
    }
    const pubSnap = await getDoc(doc(db, section, "published"));
    if (pubSnap.exists()) {
      const pubDoc = pubSnap.data() as CMSPublishedDoc<T>;
      return { ...defaultData, ...pubDoc.data };
    }
    return defaultData;
  } catch {
    return defaultData;
  }
}

/** Idempotently migrate existing hardcoded sections and initial restorations to Firestore when missing. */
export async function seedMissingCMSContent(userEmail: string): Promise<{ seededSections: string[]; seededProjects: number }> {
  const seededSections: string[] = [];
  const allSections = Object.keys(CMS_DEFAULTS_MAP) as CMSSectionKey[];

  for (const section of allSections) {
    const draftRef = doc(db, section, "draft");
    const pubRef = doc(db, section, "published");
    const [dSnap, pSnap] = await Promise.all([getDoc(draftRef), getDoc(pubRef)]);
    if (!dSnap.exists() && !pSnap.exists()) {
      await publishCMSSection(section, CMS_DEFAULTS_MAP[section], userEmail, "Initial migration from existing site");
      seededSections.push(section);
    }
  }

  const seededProjects = await seedInitialProjectsIfEmpty();
  return { seededSections, seededProjects };
}

// --- SHARED PROJECTS / FEATURED RESTORATIONS CMS ---

/** Seed initial restoration projects (Toorji Ka Jhalra, Mahamandir Bawri, Trivedi Sukhdev Ji Ka Jhalra) only if `projects` is empty. */
export async function seedInitialProjectsIfEmpty(): Promise<number> {
  const snapshot = await getDocs(collection(db, "projects"));
  if (!snapshot.empty) return 0;

  let count = 0;
  for (const project of INITIAL_PROJECTS_SEED) {
    await addDoc(collection(db, "projects"), project);
    count++;
  }
  return count;
}

export async function getAllProjectsOrdered(): Promise<Project[]> {
  const snapshot = await getDocs(collection(db, "projects"));
  const projects = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
  return projects.sort((a, b) => {
    const orderA = a.displayOrder ?? 999;
    const orderB = b.displayOrder ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
}

export async function getPublishedProjects(featuredOnly = false): Promise<Project[]> {
  try {
    const q = query(collection(db, "projects"), where("published", "==", true));
    const snapshot = await getDocs(q);
    const list = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as Project))
      .filter((p) => (featuredOnly ? p.featured === true : true))
      .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

    if (list.length === 0 && featuredOnly && snapshot.empty) {
      return INITIAL_PROJECTS_SEED.map((p, idx) => ({ id: `initial-${idx + 1}`, ...p }));
    }
    return list;
  } catch (err) {
    console.warn("Failed fetching published projects:", err);
    return featuredOnly
      ? INITIAL_PROJECTS_SEED.map((p, idx) => ({ id: `initial-${idx + 1}`, ...p }))
      : [];
  }
}

export async function getProjectDraftOverlay(projectId: string): Promise<Partial<Project> | null> {
  const snap = await getDoc(doc(db, PROJECT_DRAFTS_COLLECTION, projectId));
  return snap.exists() ? (snap.data().data as Partial<Project>) : null;
}

export async function saveProjectDraftOverlay(
  projectId: string,
  data: Partial<Project>,
  userEmail: string
): Promise<void> {
  await setDoc(doc(db, PROJECT_DRAFTS_COLLECTION, projectId), {
    projectId,
    data,
    updatedAt: new Date().toISOString(),
    updatedBy: userEmail,
  });
}

export async function publishProjectCMS(
  projectId: string | null,
  data: Omit<Project, "id" | "createdAt"> & { createdAt?: string },
  userEmail: string,
  publishNow: boolean
): Promise<string> {
  const now = new Date().toISOString();
  const slug =
    data.slug ||
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const cleanPayload: Omit<Project, "id"> = {
    name: data.name,
    slug,
    location: data.location,
    category: data.category || "Stepwell Restoration",
    status: data.status || "active",
    statusLabel: data.statusLabel || (data.status === "completed" ? "Revived" : data.status === "active" ? "Active" : "Planning"),
    progress: Number(data.progress ?? 0),
    description: data.description,
    story: data.story || data.description,
    featuredImage: data.featuredImage || data.images?.[0] || "",
    images: data.images?.length ? data.images : data.featuredImage ? [data.featuredImage] : [],
    additionalMedia: data.additionalMedia || [],
    featured: Boolean(data.featured),
    published: publishNow,
    displayOrder: Number(data.displayOrder ?? 99),
    createdAt: data.createdAt || now,
    updatedAt: now,
  };

  let targetId = projectId;
  if (targetId) {
    await updateDoc(doc(db, "projects", targetId), cleanPayload);
  } else {
    const refDoc = await addDoc(collection(db, "projects"), cleanPayload);
    targetId = refDoc.id;
  }

  // Clear pending draft overlay once published/saved directly
  try {
    await deleteDoc(doc(db, PROJECT_DRAFTS_COLLECTION, targetId));
  } catch {
    // ignore if none existed
  }

  await addDoc(collection(db, REVISIONS_COLLECTION), {
    section: `project:${targetId}`,
    version: Date.now(),
    action: publishNow ? "publish" : "unpublish",
    data: cleanPayload,
    createdAt: now,
    createdBy: userEmail,
    note: publishNow ? `Published ${cleanPayload.name}` : `Saved unpublished ${cleanPayload.name}`,
  });

  return targetId;
}

export async function reorderProjectsCMS(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, idx) =>
      updateDoc(doc(db, "projects", id), {
        displayOrder: idx + 1,
        updatedAt: new Date().toISOString(),
      })
    )
  );
}

// --- ADMIN USERS & PERMISSIONS ---

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as UserProfile))
    .sort((a, b) => (a.email || "").localeCompare(b.email || ""));
}

export async function updateUserPermissions(
  userId: string,
  updates: { role?: Role; permissions?: AdminPermissionSet }
): Promise<void> {
  await updateDoc(doc(db, "users", userId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}
