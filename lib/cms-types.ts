export type CMSSectionKey =
  | "siteSettings"
  | "homepage"
  | "aboutFoundation"
  | "impactStatistics"
  | "featuredRestorations"
  | "recognitionMedia"
  | "sponsors"
  | "marketplaceContent"
  | "team"
  | "involvementContent"
  | "footer";

export type CMSStatus = "draft" | "published" | "unpublished";

export interface CMSDraftDoc<T> {
  section: CMSSectionKey;
  data: T;
  updatedAt: string;
  updatedBy: string;
  version: number;
  publishedVersion?: number;
}

export interface CMSPublishedDoc<T> {
  section: CMSSectionKey;
  status: "published" | "unpublished";
  data: T;
  publishedAt: string;
  publishedBy: string;
  version: number;
}

export interface ContentRevision<T = unknown> {
  id: string;
  section: string;
  version: number;
  action: "publish" | "unpublish" | "restore";
  data: T;
  createdAt: string;
  createdBy: string;
  note?: string;
}

export interface HomepageCMS {
  mainHeading: string;
  highlightedHeading: string;
  description: string;
  heroImage: string;
  heroImageAlt: string;
  heroImagePosition: "center" | "top" | "bottom" | "left" | "right";
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  visibility: {
    showHero: boolean;
    showMission: boolean;
    showImpactStats: boolean;
    showFeaturedRestorations: boolean;
    showMarketplace: boolean;
    showRecognition: boolean;
    showSponsors: boolean;
  };
}

export interface AboutWhoWeAreItem {
  id: string;
  title: string;
  body: string;
}

export interface AboutMissionCard {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface AboutFoundationCMS {
  homeEyebrow?: string;
  sectionHeading: string;
  highlightedHeading: string;
  foundationDescription: string;
  storyAndHistory: string;
  founderInformation: string;
  supportingImage: string;
  supportingImageAlt: string;
  readStoryButtonLabel: string;
  readStoryButtonUrl: string;
  pageEyebrow: string;
  pageHeading: string;
  whoWeAreItems: AboutWhoWeAreItem[];
  galleryPrimaryImage: string;
  galleryPrimaryTitle: string;
  galleryPrimarySubtitle: string;
  gallerySecondaryLeftImage: string;
  gallerySecondaryLeftTitle: string;
  gallerySecondaryRightImage: string;
  gallerySecondaryRightTitle: string;
  missionEyebrow: string;
  missionHeading: string;
  missionDescription: string;
  missionCards: AboutMissionCard[];
  visionEyebrow: string;
  visionHeading: string;
  visionParagraph1: string;
  visionParagraph2: string;
  visionImage: string;
  visionQuote: string;
  visionQuoteAuthor: string;
}

export interface ImpactStatItem {
  id: string;
  value: string;
  label: string;
  description: string;
  icon: string;
  order: number;
  visible: boolean;
}

export interface ImpactStatisticsCMS {
  sectionVisible: boolean;
  items: ImpactStatItem[];
}

export interface FeaturedRestorationsCMS {
  eyebrow: string;
  heading: string;
  sublabel: string;
  ctaLabel: string;
  autoplaySeconds: number;
  visible: boolean;
}

export type RecognitionMediaType = "image" | "video" | "instagram" | "tweet" | "press";

export interface RecognitionMediaItem {
  id: string;
  type: RecognitionMediaType;
  title: string;
  caption: string;
  mediaUrl: string;
  embedUrl?: string;
  tweetId?: string;
  externalUrl?: string;
  sourceName?: string;
  order: number;
  visible: boolean;
}

export interface RecognitionMediaCMS {
  eyebrow: string;
  heading: string;
  description: string;
  visible: boolean;
  items: RecognitionMediaItem[];
}

export interface SponsorPartnerItem {
  id: string;
  name: string;
  logo: string;
  websiteUrl: string;
  shortDescription: string;
  order: number;
  visible: boolean;
}

export interface SponsorsCMS {
  eyebrow: string;
  heading: string;
  visible: boolean;
  items: SponsorPartnerItem[];
}

export interface MarketplaceContentCMS {
  homeEyebrow: string;
  homeHeading: string;
  homeDescription: string;
  homeCtaLabel: string;
  homeCtaUrl: string;
  storePageEyebrow: string;
  storePageHeading: string;
  bannerEyebrow: string;
  bannerDescription: string;
  promotionalImage: string;
  visible: boolean;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  designation: string;
  group: "founder" | "core";
  photo: string;
  initials: string;
  accentColor: string;
  biography: string;
  socialLinks: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  order: number;
  visible: boolean;
}

export interface TeamCMS {
  eyebrow: string;
  heading: string;
  description: string;
  foundersHeading: string;
  coreTeamHeading: string;
  joinHeading: string;
  joinDescription: string;
  joinCtaLabel: string;
  joinCtaUrl: string;
  members: TeamMemberItem[];
}

export interface InvolvementContentCMS {
  volunteerEyebrow: string;
  volunteerHeading: string;
  volunteerDescription: string;
  volunteerImage: string;
  volunteerCtaLabel: string;
  volunteerCtaUrl: string;
  volunteerGuidelines: string[];
  volunteerFooterNote: string;
  donationHeading: string;
  donationSubheading: string;
  donationDescription: string;
  donationCtaLabel: string;
  donationSecurityNote: string;
  donationImage: string;
}

export interface FooterNavLink {
  id: string;
  label: string;
  href: string;
}

export interface FooterNavColumn {
  id: string;
  heading: string;
  links: FooterNavLink[];
}

export interface FooterCMS {
  foundationName: string;
  foundationBrandPrimary: string;
  foundationBrandAccent: string;
  logo: string;
  shortDescription: string;
  ctaEyebrow: string;
  ctaHeading: string;
  ctaHighlight: string;
  ctaPrimaryLabel: string;
  ctaPrimaryUrl: string;
  ctaSecondaryLabel: string;
  ctaSecondaryUrl: string;
  email: string;
  phone: string;
  address: string;
  googleMapsLink: string;
  googleMapsEmbedUrl: string;
  navigationColumns: FooterNavColumn[];
  socialLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
  };
  copyrightText: string;
}

export interface SiteSettingsCMS {
  siteTitle: string;
  siteDescription: string;
  navbarTagline: string;
  announcementEnabled: boolean;
  announcementBadge: string;
  announcementText: string;
  announcementPhone: string;
}

export type MediaSection =
  | "general"
  | "homepage"
  | "about"
  | "restorations"
  | "recognition"
  | "sponsors"
  | "marketplace"
  | "team"
  | "involvement"
  | "footer";

export interface MediaAsset {
  id: string;
  fileName: string;
  publicId: string;
  storagePath?: string;
  downloadUrl: string;
  mediaType: "image" | "video";
  fileType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  section: MediaSection;
  altText: string;
  caption?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}
