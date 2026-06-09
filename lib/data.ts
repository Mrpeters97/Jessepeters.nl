export type CardSize = "sm" | "md" | "lg" | "wide" | "full";

/** Cover aspect-bucket — drives which grid slot a project lands in. */
export type CoverAspect = "wide" | "square";

export type Project = {
  slug: string;
  title: string;
  categories: string[];
  year: number;
  date?: string;
  client: string;
  employer?: string;
  responsibilities?: string;
  results?: string;
  description: string;
  /** Cover image (Cover.jpg) — shown on the home/work grid and as the detail hero. */
  thumbnail: string;
  /** Intrinsic cover dimensions, used to size the grid slot without cropping. */
  coverW: number;
  coverH: number;
  /** Aspect bucket derived from the cover ratio. */
  aspect: CoverAspect;
  featured: boolean;
  liveUrl?: string;
  /** Fallback background behind the cover image (and on the next-project card). */
  cardColor?: string;
  cardTextColor?: string;
  size?: CardSize;
  /**
   * Ordered image paths for the detail page.
   * images[0] = cover/hero (100vh), images[1..] = the in-order 1..N grid.
   */
  images?: string[];
};

export type Photo = {
  id: string;
  title: string;
  location: string;
  year: number;
  src: string;
  tags?: string[];
};

const proj = (folder: string, files: string[]) =>
  files.map((f) => `/projects/${folder}/${f}`);

export const projects: Project[] = [
  {
    slug: "pulse20",
    title: "Pulse20",
    categories: ["Brand design", "UX/UI"],
    year: 2022,
    client: "Pulse20",
    description: "Brand design and UX & UI for Pulse20.",
    thumbnail: "/projects/Pulse20/Cover.jpg",
    coverW: 2871,
    coverH: 1305,
    aspect: "wide",
    featured: true,
    cardColor: "#2A65E8",
    images: proj("Pulse20", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg",
      "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg",
    ]),
  },
  {
    slug: "dna-projecten",
    title: "DNA Projecten",
    categories: ["Brand design", "UX/UI"],
    year: 2022,
    client: "DNA Projecten",
    description:
      "Brand identity and digital design for DNA Projecten, a company focused on creating happy workplaces. Delivered comprehensive branding, UX and UI design for desktop and mobile.",
    thumbnail: "/projects/DNA_Projecten/Cover.jpg",
    coverW: 1512,
    coverH: 1292,
    aspect: "square",
    featured: true,
    liveUrl: "https://dnaprojecten.nl",
    cardColor: "#F5E9D7",
    cardTextColor: "#0E0E0D",
    images: proj("DNA_Projecten", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg",
      "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg",
    ]),
  },
  {
    slug: "gemeente-tynaarlo",
    title: "Gemeente Tynaarlo",
    categories: ["Campaign strategy", "Branding", "Art direction"],
    year: 2024,
    date: "November 2024",
    client: "Gemeente Tynaarlo",
    employer: "Junction creative + digital agency",
    responsibilities: "Campagne strategy, Branding, Art direction",
    results: "Online & Offline employer branding campagne",
    description: "Employer branding campagne: Maak er werk van",
    thumbnail: "/projects/Gemeente_Tynaarlo/Cover.jpg",
    coverW: 2154,
    coverH: 979,
    aspect: "wide",
    featured: true,
    cardColor: "#1A1A18",
    images: proj("Gemeente_Tynaarlo", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg",
      "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.gif",
    ]),
  },
  {
    slug: "wdw",
    title: "WDW",
    categories: ["UX/UI"],
    year: 2022,
    client: "WDW",
    description: "UX & UI design for WDW.",
    thumbnail: "/projects/WDW/Cover.jpg",
    coverW: 1512,
    coverH: 1292,
    aspect: "square",
    featured: false,
    cardColor: "#FFE600",
    cardTextColor: "#0E0E0D",
    images: proj("WDW", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg",
      "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg",
    ]),
  },
  {
    slug: "leeuwarder-golfclub",
    title: "Leeuwarder Golfclub",
    categories: ["Brand design", "UX/UI"],
    year: 2023,
    client: "Leeuwarder Golfclub",
    description: "Brand design and UX & UI for Leeuwarder Golfclub.",
    thumbnail: "/projects/Leeuwarder_Golfclub/Cover.jpg",
    coverW: 2871,
    coverH: 1305,
    aspect: "wide",
    featured: true,
    cardColor: "#1E5C3A",
    images: proj("Leeuwarder_Golfclub", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg",
      "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg",
    ]),
  },
  {
    slug: "cafe-del-mar",
    title: "Café del Mar",
    categories: ["Brand design", "Art direction"],
    year: 2023,
    client: "Café del Mar",
    description: "Brand design and art direction for Café del Mar.",
    thumbnail: "/projects/Cafe_Del_Mar/Cover.jpg",
    coverW: 2871,
    coverH: 1305,
    aspect: "wide",
    featured: true,
    cardColor: "#E8A14B",
    cardTextColor: "#0E0E0D",
    images: proj("Cafe_Del_Mar", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg",
      "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg",
    ]),
  },
  {
    slug: "vanhulley",
    title: "Vanhulley",
    categories: ["UX/UI"],
    year: 2022,
    client: "Vanhulley",
    description: "UX & UI design for Vanhulley.",
    thumbnail: "/projects/Van_Hulley/Cover.jpg",
    coverW: 2335,
    coverH: 1939,
    aspect: "square",
    featured: true,
    cardColor: "#9DC4B5",
    images: proj("Van_Hulley", [
      "1.jpg", "2.jpg", "3.gif", "4.jpg",
      "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg",
    ]),
  },
  {
    slug: "civ-water",
    title: "CIV Water",
    categories: ["UX/UI"],
    year: 2022,
    client: "CIV Water",
    description: "UX & UI design for CIV Water.",
    thumbnail: "/projects/CIV_Water/Cover.jpg",
    coverW: 1512,
    coverH: 1292,
    aspect: "square",
    featured: false,
    cardColor: "#34A853",
    images: proj("CIV_Water", [
      "1.jpg", "2.jpg", "3.jpg", "4.png", "5.jpg", "6.jpg",
    ]),
  },
  {
    slug: "open-agency-night",
    title: "Open Agency Night",
    categories: ["UX/UI"],
    year: 2022,
    client: "Open Agency Night",
    description: "UX & UI for Open Agency Night.",
    thumbnail: "/projects/Open_Agency_Night/Cover.jpg",
    coverW: 1512,
    coverH: 1292,
    aspect: "square",
    featured: false,
    cardColor: "#9F86E0",
    images: proj("Open_Agency_Night", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg",
    ]),
  },
  {
    slug: "spieren-voor-spieren",
    title: "Spieren voor Spieren",
    categories: ["UX/UI"],
    year: 2022,
    client: "Spieren voor Spieren",
    description: "UX & UI design for Spieren voor Spieren.",
    thumbnail: "/projects/Spieren_voor_Spieren/Cover.jpg",
    coverW: 1512,
    coverH: 1292,
    aspect: "square",
    featured: false,
    cardColor: "#F5A37E",
    cardTextColor: "#0E0E0D",
    images: proj("Spieren_voor_Spieren", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg",
    ]),
  },
];

/** Portrait travel photos — reused as the random fillers woven into the work grid. */
export const archivePhotos: string[] = Array.from({ length: 44 }, (_, i) => {
  const n = i + 1;
  return `/images/archive/Archive${n}.${n <= 42 ? "jpeg" : "jpg"}`;
});

export const photos: Photo[] = [
  {
    id: "italy-cinque-terre",
    title: "Cinque Terre",
    location: "Italy",
    year: 2021,
    src: "/images/archive/italy-cinque-terre.jpg",
    tags: ["Italy", "coastal"],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
