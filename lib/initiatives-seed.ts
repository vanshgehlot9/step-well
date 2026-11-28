import { db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { saveInitiativeFull } from "./initiatives-services";

/**
 * Idempotent seed data built strictly from verified Stepwells Renovater website content and existing assets.
 * Missing videos or unverified external links are intentionally left empty for admin completion.
 */
const REAL_INITIAL_INITIATIVES = [
  {
    title: "Stepwell Restoration Drive",
    slug: "stepwell-restoration-drive",
    subtitle: "Reviving Water Heritage, Rebuilding Communities",
    short_description:
      "A focused effort to clean, restore and protect historic Bawaris (stepwells) across Rajasthan, with community participation and expert conservation support.",
    full_description:
      "Once buried beneath years of debris and neglect, historic stepwells like Toorji Ka Jhalra, Mahamandir Bawri, and Trivedi Sukhdev Ji Ka Jhalra in Jodhpur have re-emerged through sustained community participation and dedicated cleanliness drives.\n\nInspired by the decade-long efforts of Caron Rawnsley, the Stepwells Renovater Foundation mobilizes volunteers, local residents, and conservation specialists to desilt, clean, and protect Rajasthan's ancient water architecture.\n\nEvery restoration drive combines careful removal of debris and structural care with public awareness so each stepwell returns as a living cultural and ecological landmark.",
    category: "Heritage Restoration",
    location: "Jodhpur, Rajasthan",
    status: "Ongoing",
    cover_image: "/story.jpeg",
    is_featured: true,
    display_order: 1,
    seo_title: "Stepwell Restoration Drive | Stepwells Renovater Foundation",
    seo_description:
      "Community-led restoration and cleaning of historic Bawaris across Jodhpur and Rajasthan.",
    images: [
      {
        image_url: "/story.jpeg",
        cloudinary_public_id: "",
        alt_text: "Stepwells Renovater volunteers at a stepwell cleanup drive",
        caption: "Volunteers and community members during a stepwell cleaning drive",
        display_order: 1,
        is_primary: true,
      },
      {
        image_url: "/toorji.jpg",
        cloudinary_public_id: "",
        alt_text: "Toorji Ka Jhalra restored stepwell in Jodhpur",
        caption: "Toorji Ka Jhalra — From neglect to revival",
        display_order: 2,
        is_primary: false,
      },
      {
        image_url: "/mahamandirhero.jpeg",
        cloudinary_public_id: "",
        alt_text: "Mahamandir Bawri heritage stepwell",
        caption: "Mahamandir Bawri — Clean waters and restored stonework",
        display_order: 3,
        is_primary: false,
      },
      {
        image_url: "/sukhdev.PNG",
        cloudinary_public_id: "",
        alt_text: "Trivedi Sukhdev Ji Ka Jhalra",
        caption: "Trivedi Sukhdev Ji Ka Jhalra — Ongoing heritage conservation",
        display_order: 4,
        is_primary: false,
      },
      {
        image_url: "/hero1.png",
        cloudinary_public_id: "",
        alt_text: "Stepwell cleanup volunteers working together",
        caption: "Community hands working together to revive traditional water systems",
        display_order: 5,
        is_primary: false,
      },
    ],
    links: [
      {
        platform: "instagram" as const,
        label: "Follow @stepwells_renovater",
        url: "https://instagram.com/stepwells_renovater",
      },
    ],
    team: [
      {
        name: "R.K. Padmaja Rathore",
        role: "Co-Founder",
        description:
          "A passionate heritage conservationist with deep roots in Rajasthan, leading community outreach and awareness initiatives.",
        image_url: "",
        display_order: 1,
      },
      {
        name: "Ravindra Vishnoi",
        role: "Co-Founder",
        description:
          "Brings expertise in traditional water systems and coordinates restoration projects across multiple stepwells in Jodhpur.",
        image_url: "",
        display_order: 2,
      },
      {
        name: "Vijendra",
        role: "Co-Founder",
        description:
          "Leads volunteer mobilisation and site operations, ensuring every restoration drive is executed with care and community involvement.",
        image_url: "",
        display_order: 3,
      },
      {
        name: "Caron Rawnsley",
        role: "Patron & Advisor",
        description:
          "Whose decade-long dedication revived public awareness of Jodhpur's historic stepwells and inspired the Foundation.",
        image_url: "",
        display_order: 4,
      },
    ],
  },
  {
    title: "Afforestation & Ecological Restoration",
    slug: "afforestation-ecological-restoration",
    subtitle: "Native Plantation & Catchment Revival",
    short_description:
      "Native plantation, landscape restoration and habitat revival around traditional water structures in Rajasthan.",
    full_description:
      "Healthy stepwells and traditional water bodies depend on the ecological health of their surrounding catchments. Alongside structural cleaning, the Foundation supports native plantation and landscape restoration efforts to strengthen groundwater recharge and local biodiversity.\n\nAdmin note: Additional field documentation, site photographs, and local drive updates can be added directly from the Initiatives editor.",
    category: "Ecological Restoration",
    location: "Rajasthan",
    status: "Ongoing",
    cover_image: "/mahamandir.jpeg",
    is_featured: false,
    display_order: 2,
    seo_title: "Afforestation & Ecological Restoration | Stepwells Renovater Foundation",
    seo_description:
      "Native plantation, landscape restoration and catchment revival in Rajasthan.",
    images: [
      {
        image_url: "/mahamandir.jpeg",
        cloudinary_public_id: "",
        alt_text: "Restored stepwell surroundings and greenery",
        caption: "Ecological surroundings around restored stepwell heritage",
        display_order: 1,
        is_primary: true,
      },
    ],
    links: [],
    team: [],
  },
  {
    title: "Wildlife & Biodiversity",
    slug: "wildlife-biodiversity",
    subtitle: "Protecting Native Habitats & Coexistence",
    short_description:
      "Protecting native wildlife, restoring aquatic and surrounding habitats, and fostering peaceful coexistence.",
    full_description:
      "Clean, chemical-free stepwell waters and conserved heritage surroundings restore natural habitats for aquatic life, birds, and local fauna across arid Rajasthan. At sites like Mahamandir Bawri, desilting and water revival have enabled aquatic life to return naturally.\n\nAdmin note: Specific biodiversity surveys and wildlife photographs can be uploaded in the Media tab.",
    category: "Wildlife & Biodiversity",
    location: "Jodhpur, Rajasthan",
    status: "Ongoing",
    cover_image: "/mahamandirhero.jpeg",
    is_featured: false,
    display_order: 3,
    seo_title: "Wildlife & Biodiversity | Stepwells Renovater Foundation",
    seo_description:
      "Restoring natural water habitats and supporting native biodiversity around Rajasthan's stepwells.",
    images: [
      {
        image_url: "/mahamandirhero.jpeg",
        cloudinary_public_id: "",
        alt_text: "Clean waters supporting aquatic life at Mahamandir Bawri",
        caption: "Revived water ecosystems supporting aquatic life",
        display_order: 1,
        is_primary: true,
      },
    ],
    links: [],
    team: [],
  },
  {
    title: "Women & Community Empowerment",
    slug: "women-community-empowerment",
    subtitle: "Artisans, Livelihoods & Local Leadership",
    short_description:
      "Skilling, artisan marketplace partnerships, and community leadership for stronger, self-reliant neighbourhoods.",
    full_description:
      "Heritage conservation thrives when local communities lead it. Through volunteer stewardship and the Foundation Marketplace, Stepwells Renovater Foundation connects local artisans, textile creators, and community members with sustainable livelihoods that directly support conservation.\n\nAdmin note: Upload community workshop photographs and partner stories as drives progress.",
    category: "Community Empowerment",
    location: "Rajasthan",
    status: "Ongoing",
    cover_image: "/sponser/store.jpeg",
    is_featured: false,
    display_order: 4,
    seo_title: "Women & Community Empowerment | Stepwells Renovater Foundation",
    seo_description:
      "Empowering local artisans and community leaders alongside water heritage conservation.",
    images: [
      {
        image_url: "/sponser/store.jpeg",
        cloudinary_public_id: "",
        alt_text: "Local community crafts and Foundation store initiative",
        caption: "Supporting artisan livelihoods and community conservation",
        display_order: 1,
        is_primary: true,
      },
    ],
    links: [],
    team: [],
  },
  {
    title: "Water Heritage Awareness",
    slug: "water-heritage-awareness",
    subtitle: "Education, Public Outreach & Stewardship",
    short_description:
      "Education, heritage walks, and public campaigns inspiring communities to value and conserve traditional water systems.",
    full_description:
      "Promoting heritage awareness and educating youth and visitors on the architectural and environmental wisdom of India's stepwells is central to the Foundation's mission.\n\nThrough public outreach, media documentation, and youth engagement, we work to create the next generation of heritage guardians.",
    category: "Water Heritage Awareness",
    location: "Jodhpur, Rajasthan",
    status: "Ongoing",
    cover_image: "/toorji.jpg",
    is_featured: false,
    display_order: 5,
    seo_title: "Water Heritage Awareness | Stepwells Renovater Foundation",
    seo_description:
      "Education and awareness programs preserving traditional water architecture in Rajasthan.",
    images: [
      {
        image_url: "/toorji.jpg",
        cloudinary_public_id: "",
        alt_text: "Toorji Ka Jhalra heritage landmark",
        caption: "Historic stepwell architecture preserved through community awareness",
        display_order: 1,
        is_primary: true,
      },
    ],
    links: [
      {
        platform: "instagram" as const,
        label: "Instagram @stepwells_renovater",
        url: "https://instagram.com/stepwells_renovater",
      },
    ],
    team: [],
  },
  {
    title: "Cleaning Drives & Community Participation",
    slug: "cleaning-drives-community-participation",
    subtitle: "Hands-On Citizen Action at Historic Stepwells",
    short_description:
      "Free, community-led cleanup drives uniting local citizens and visiting volunteers to clear silt, plastic, and debris.",
    full_description:
      "Every hand that cleans a stone writes history. Our regular, completely free volunteer cleaning drives invite residents, students, and travellers to join site coordinators in safely removing debris and caring for historic stepwells.\n\nOver 5,000 volunteers have participated across Jodhpur's stepwells, demonstrating the power of collective civic care.",
    category: "Community Participation",
    location: "Jodhpur, Rajasthan",
    status: "Ongoing",
    cover_image: "/hero1.png",
    is_featured: false,
    display_order: 6,
    seo_title: "Cleaning Drives & Community Participation | Stepwells Renovater Foundation",
    seo_description:
      "Join free community cleaning drives restoring historic stepwells across Jodhpur.",
    images: [
      {
        image_url: "/hero1.png",
        cloudinary_public_id: "",
        alt_text: "Volunteers participating in a stepwell cleaning drive",
        caption: "Volunteers working side by side during a community cleanup drive",
        display_order: 1,
        is_primary: true,
      },
      {
        image_url: "/sukhdev.PNG",
        cloudinary_public_id: "",
        alt_text: "Trivedi Sukhdev Ji Ka Jhalra cleaning initiative",
        caption: "Silt and debris removal at Trivedi Sukhdev Ji Ka Jhalra",
        display_order: 2,
        is_primary: false,
      },
    ],
    links: [
      {
        platform: "website" as const,
        label: "Apply to Volunteer",
        url: "/get-involved",
      },
    ],
    team: [],
  },
];

/**
 * Idempotently seeds real Stepwells Renovater initiatives into Firestore.
 * Existing initiatives with the same slug are never overwritten.
 */
export async function seedRealInitiatives(): Promise<{
  created: number;
  skipped: number;
  createdSlugs: string[];
}> {
  let created = 0;
  let skipped = 0;
  const createdSlugs: string[] = [];

  for (const item of REAL_INITIAL_INITIATIVES) {
    const existing = await getDocs(
      query(collection(db, "initiatives"), where("slug", "==", item.slug))
    );
    if (!existing.empty) {
      skipped++;
      continue;
    }

    await saveInitiativeFull({
      initiative: {
        title: item.title,
        slug: item.slug,
        subtitle: item.subtitle,
        short_description: item.short_description,
        full_description: item.full_description,
        category: item.category,
        location: item.location,
        status: item.status,
        cover_image: item.cover_image,
        is_featured: item.is_featured,
        display_order: item.display_order,
        publication_status: "published",
        seo_title: item.seo_title,
        seo_description: item.seo_description,
        seo_og_image: item.cover_image,
        seo_canonical_url: "",
        seo_no_index: false,
      },
      images: item.images,
      videos: [],
      links: item.links,
      team: item.team,
      publishNow: true,
    });

    created++;
    createdSlugs.push(item.slug);
  }

  return { created, skipped, createdSlugs };
}
