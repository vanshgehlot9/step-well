import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  getDoc,
} from "firebase/firestore";
import { CMSSectionKey, MediaAsset, MediaSection } from "./cms-types";

const MEDIA_COLLECTION = "media";

const CMS_SECTION_COLLECTIONS: CMSSectionKey[] = [
  "siteSettings",
  "homepage",
  "aboutFoundation",
  "impactStatistics",
  "featuredRestorations",
  "recognitionMedia",
  "sponsors",
  "marketplaceContent",
  "team",
  "involvementContent",
  "footer",
];

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type?: "image" | "video" | string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  duration?: number;
}

/** Read image width/height or video width/height/duration in the browser before upload. */
export async function extractMediaDimensions(
  file: File
): Promise<{ width?: number; height?: number; duration?: number }> {
  if (typeof window === "undefined") return {};

  const objectUrl = URL.createObjectURL(file);
  try {
    if (file.type.startsWith("image/")) {
      return await new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => resolve({});
        img.src = objectUrl;
      });
    }

    if (file.type.startsWith("video/")) {
      return await new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          resolve({
            width: video.videoWidth || undefined,
            height: video.videoHeight || undefined,
            duration: Number.isFinite(video.duration)
              ? Math.round(video.duration)
              : undefined,
          });
        };
        video.onerror = () => resolve({});
        video.src = objectUrl;
      });
    }

    return {};
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Upload an image or video via the server-side Cloudinary API route with progress tracking. */
export async function uploadFileToCloudinary(
  file: File,
  section: MediaSection,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("section", section);

  return await new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/cloudinary/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve(data as CloudinaryUploadResult);
        } else {
          reject(new Error(data.error || "Failed to upload media to Cloudinary"));
        }
      } catch {
        reject(new Error("Invalid response from Cloudinary upload endpoint"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error while uploading to Cloudinary"));
    xhr.send(formData);
  });
}

async function deleteFromCloudinary(params: {
  url?: string;
  publicId?: string;
  resourceType?: "image" | "video";
}): Promise<void> {
  try {
    await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch (err) {
    console.warn("Best-effort Cloudinary delete failed:", err);
  }
}

/** Upload a media file to Cloudinary and register its metadata in Firestore `media`. */
export async function uploadMediaAsset(params: {
  file: File;
  section: MediaSection;
  altText?: string;
  caption?: string;
  uploadedBy: string;
  onProgress?: (percent: number) => void;
}): Promise<MediaAsset> {
  const { file, section, altText, caption, uploadedBy, onProgress } = params;
  const fallbackType: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";

  const [dimensions, uploaded] = await Promise.all([
    extractMediaDimensions(file),
    uploadFileToCloudinary(file, section, onProgress),
  ]);

  const mediaType: "image" | "video" =
    uploaded.resource_type === "video" || fallbackType === "video" ? "video" : "image";

  const now = new Date().toISOString();
  const width = uploaded.width ?? dimensions.width;
  const height = uploaded.height ?? dimensions.height;
  const duration = uploaded.duration ?? dimensions.duration;

  const metadata: Omit<MediaAsset, "id"> = {
    fileName: file.name,
    publicId: uploaded.public_id,
    storagePath: uploaded.public_id,
    downloadUrl: uploaded.secure_url,
    mediaType,
    fileType: file.type || (uploaded.format ? `${mediaType}/${uploaded.format}` : "application/octet-stream"),
    fileSize: uploaded.bytes ?? file.size,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(duration !== undefined ? { duration: Math.round(duration) } : {}),
    section,
    altText: altText || file.name.replace(/\.[^.]+$/, ""),
    caption: caption || "",
    uploadedBy,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, MEDIA_COLLECTION), metadata);
  return { id: docRef.id, ...metadata };
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  try {
    const q = query(collection(db, MEDIA_COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MediaAsset));
  } catch {
    const snapshot = await getDocs(collection(db, MEDIA_COLLECTION));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MediaAsset));
    return list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }
}

export async function updateMediaMetadata(
  id: string,
  updates: Partial<Pick<MediaAsset, "altText" | "caption" | "section">>
): Promise<void> {
  await updateDoc(doc(db, MEDIA_COLLECTION, id), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/** Recursively replace matching URL strings inside an arbitrary JSON value. */
function replaceUrlInValue<T>(value: T, oldUrl: string, newUrl: string): { next: T; changed: boolean } {
  if (typeof value === "string") {
    if (value === oldUrl) {
      return { next: newUrl as unknown as T, changed: true };
    }
    return { next: value, changed: false };
  }
  if (Array.isArray(value)) {
    let anyChanged = false;
    const mapped = value.map((item) => {
      const res = replaceUrlInValue(item, oldUrl, newUrl);
      if (res.changed) anyChanged = true;
      return res.next;
    });
    return { next: mapped as unknown as T, changed: anyChanged };
  }
  if (value && typeof value === "object") {
    let anyChanged = false;
    const obj = value as Record<string, unknown>;
    const copy: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      const res = replaceUrlInValue(v, oldUrl, newUrl);
      if (res.changed) anyChanged = true;
      copy[k] = res.next;
    }
    return { next: copy as T, changed: anyChanged };
  }
  return { next: value, changed: false };
}

/** Propagate a replaced media URL across all CMS draft/published docs and projects. */
async function propagateMediaUrlReplacement(oldUrl: string, newUrl: string): Promise<number> {
  if (!oldUrl || oldUrl === newUrl) return 0;
  let updatedCount = 0;

  for (const section of CMS_SECTION_COLLECTIONS) {
    for (const docId of ["draft", "published"]) {
      const refDoc = doc(db, section, docId);
      try {
        const snap = await getDoc(refDoc);
        if (!snap.exists()) continue;
        const payload = snap.data();
        const res = replaceUrlInValue(payload.data, oldUrl, newUrl);
        if (res.changed) {
          await updateDoc(refDoc, {
            data: res.next,
            updatedAt: new Date().toISOString(),
          });
          updatedCount++;
        }
      } catch (err) {
        console.error(`Failed propagating media replacement in ${section}/${docId}:`, err);
      }
    }
  }

  try {
    const projectSnap = await getDocs(collection(db, "projects"));
    for (const pDoc of projectSnap.docs) {
      const pData = pDoc.data();
      const res = replaceUrlInValue(pData, oldUrl, newUrl);
      if (res.changed) {
        await updateDoc(doc(db, "projects", pDoc.id), {
          ...(res.next as Record<string, unknown>),
          updatedAt: new Date().toISOString(),
        });
        updatedCount++;
      }
    }
  } catch (err) {
    console.error("Failed propagating media replacement in projects:", err);
  }

  return updatedCount;
}

/** Replace an existing media asset in Cloudinary, update its metadata, and sync CMS references. */
export async function replaceMediaAsset(params: {
  existing: MediaAsset;
  newFile: File;
  updatedBy: string;
  onProgress?: (percent: number) => void;
}): Promise<{ asset: MediaAsset; referencesUpdated: number }> {
  const { existing, newFile, updatedBy, onProgress } = params;
  const fallbackType: "image" | "video" = newFile.type.startsWith("video/") ? "video" : "image";

  const [dimensions, uploaded] = await Promise.all([
    extractMediaDimensions(newFile),
    uploadFileToCloudinary(newFile, existing.section, onProgress),
  ]);

  const mediaType: "image" | "video" =
    uploaded.resource_type === "video" || fallbackType === "video" ? "video" : "image";

  const now = new Date().toISOString();
  const width = uploaded.width ?? dimensions.width;
  const height = uploaded.height ?? dimensions.height;
  const duration = uploaded.duration ?? dimensions.duration;

  const updatedFields: Partial<MediaAsset> = {
    fileName: newFile.name,
    publicId: uploaded.public_id,
    storagePath: uploaded.public_id,
    downloadUrl: uploaded.secure_url,
    mediaType,
    fileType: newFile.type || (uploaded.format ? `${mediaType}/${uploaded.format}` : "application/octet-stream"),
    fileSize: uploaded.bytes ?? newFile.size,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(duration !== undefined ? { duration: Math.round(duration) } : {}),
    uploadedBy: updatedBy,
    updatedAt: now,
  };

  await updateDoc(doc(db, MEDIA_COLLECTION, existing.id), updatedFields);

  const oldPublicId = existing.publicId || existing.storagePath;
  if (oldPublicId && oldPublicId !== uploaded.public_id) {
    await deleteFromCloudinary({
      publicId: oldPublicId,
      url: existing.downloadUrl,
      resourceType: existing.mediaType,
    });
  }

  const referencesUpdated = await propagateMediaUrlReplacement(
    existing.downloadUrl,
    uploaded.secure_url
  );

  return {
    asset: { ...existing, ...updatedFields } as MediaAsset,
    referencesUpdated,
  };
}

export async function deleteMediaAsset(asset: MediaAsset): Promise<void> {
  const targetPublicId = asset.publicId || asset.storagePath;
  if (targetPublicId || asset.downloadUrl) {
    await deleteFromCloudinary({
      publicId: targetPublicId,
      url: asset.downloadUrl,
      resourceType: asset.mediaType,
    });
  }
  await deleteDoc(doc(db, MEDIA_COLLECTION, asset.id));
}
