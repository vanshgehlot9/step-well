export type InitiativePublicationStatus = "draft" | "published";

export interface Initiative {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  short_description: string;
  full_description: string;
  category: string;
  location: string;
  status: string;
  cover_image: string;
  is_featured: boolean;
  display_order: number;
  publication_status: InitiativePublicationStatus;
  seo_title: string;
  seo_description: string;
  seo_og_image?: string;
  seo_canonical_url?: string;
  seo_no_index?: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface InitiativeImage {
  id: string;
  initiative_id: string;
  image_url: string;
  cloudinary_public_id: string;
  alt_text: string;
  caption: string;
  display_order: number;
  is_primary: boolean;
  is_published: boolean;
  created_at: string;
}

export interface InitiativeVideo {
  id: string;
  initiative_id: string;
  video_url: string;
  cloudinary_public_id: string;
  video_type: "upload" | "external" | "instagram";
  title: string;
  description: string;
  file_size: number;
  duration_label?: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
}

export interface InitiativeLink {
  id: string;
  initiative_id: string;
  platform: "instagram" | "facebook" | "youtube" | "twitter" | "website" | "other";
  label: string;
  url: string;
  is_published: boolean;
  created_at: string;
}

export interface InitiativeTeamMember {
  id: string;
  initiative_id: string;
  name: string;
  role: string;
  description: string;
  image_url: string;
  cloudinary_public_id?: string;
  display_order: number;
  is_published: boolean;
}

export interface InitiativeFull extends Initiative {
  images: InitiativeImage[];
  videos: InitiativeVideo[];
  links: InitiativeLink[];
  team: InitiativeTeamMember[];
}

export const INITIATIVE_CATEGORIES = [
  "Heritage Restoration",
  "Ecological Restoration",
  "Wildlife & Biodiversity",
  "Community Empowerment",
  "Water Heritage Awareness",
  "Community Participation",
] as const;

export const INITIATIVE_STATUSES = [
  "Ongoing",
  "Active",
  "Completed",
  "Planning",
] as const;
