export type Project = {
  slug: string;
  title: string;
  categories: string[];
  year: number;
  date?: string;
  client: string;
  employer?: string;
  /** Small classification label, e.g. "Campaign site". */
  format?: string;
  responsibilities?: string;
  results?: string;
  description: string;
  /** Cover image (Cover.jpg) — shown on the home/work grid and as the detail hero. */
  thumbnail: string;
  /** Optional clip for the work/home grid card (path without extension); plays once when the card first scrolls into view. */
  thumbnailVideo?: string;
  /** Shows thumbnailVideo as a screen (16:10, `size`% of a 2871×1305 canvas) on a flat background, like the framed still covers. */
  thumbnailVideoFrame?: { background: string; size: number };
  /** Optional light-mode outline for every detail-grid tile, so light tiles stay distinct from the light page. */
  tileBorder?: string;
  /** Optional detail-grid row pattern (images per row), e.g. [1, 2, 1, 2]. Defaults to [2, 1, 2, 1, 2, 1, 2]. */
  gridPattern?: number[];
  featured: boolean;
  /** External live site — shows a "Visit live site" CTA on the detail page when set. */
  liveUrl?: string;
  /**
   * Ordered media for the detail page.
   * images[0] = cover/hero (100vh, always an image), images[1..] = the in-order 1..N grid.
   */
  images?: ProjectMedia[];
};

/**
 * A looping, muted clip in the detail grid. The composition around it (tile
 * background, screen or iPhone frame, radius, shadow) is built in CSS, so the
 * clip itself stays small and sharp. Files: `${src}.mp4`, `${src}.webm`,
 * `${src}-poster.webp` (first frame) and `${src}-still.webp` (reduced motion).
 */
export type ProjectVideo = {
  type: "video";
  src: string;
  /** Same proportions as the still tiles: half = 1512×1292, full = 3112×2584. */
  tile: "half" | "full";
  background: string;
  frame: "screen" | "phone" | "bleed";
  /** screen: width in % of the tile. phone: screen width in % of the tile. */
  size?: number;
  /** screen: aspect ratio of the clip, e.g. "1920 / 1200". */
  aspect?: string;
  onLight?: boolean;
  /** screen: fill of the empty screen before the clip fades in. */
  screen?: string;
  /** phone: status bar fill + text colour and home indicator colour. */
  statusBar?: { background: string; color: string; indicator: string };
};

/** A full-width tile rendered as live code (e.g. a client's illustrations), loaded on demand. */
export type ProjectEmbed = { type: "embed"; name: "dvo-illustrations"; background: string };

/** A tilted collage of screen columns that drift up/down (alternating) on scroll (full-width tile).
 *  Column `w`/`h` are in % of the tile width; `offset` shifts a column along its length (same unit). */
export type ProjectBoard = {
  type: "board";
  columns: { src: string; w: number; h: number; offset: number }[];
  background: string;
};

export type ProjectMedia = string | ProjectVideo | ProjectEmbed | ProjectBoard;

const proj = (folder: string, files: string[]) =>
  files.map((f) => `/projects/${folder}/${f}`);

const video = (folder: string, name: string, spec: Omit<ProjectVideo, "type" | "src">): ProjectVideo => ({
  type: "video",
  src: `/projects/${folder}/${name}`,
  ...spec,
});

const DVO_NAVY = "#061426";
const DVO_LIGHT_BLUE = "#B9DDF3";
const DVO_OFF_WHITE = "#F5F5F5";

export const projects: Project[] = [
  {
    slug: "dvo-coaching",
    title: "DVO Coaching",
    categories: ["Brand design", "UX / UI", "Motion design", "Development"],
    year: 2026,
    client: "DVO Coaching",
    employer: "Freelance",
    responsibilities: "Brand design, UX / UI, Motion design, Development",
    results: "Website design and multi-language WordPress development",
    description: "Train smarter. Finish stronger.",
    thumbnail: "/projects/DVO_Coaching/Cover.jpg",
    featured: true,
    // liveUrl: "https://dvocoaching.com" — add once the domain is live
    thumbnailVideo: "/projects/DVO_Coaching/cover",
    thumbnailVideoFrame: { background: DVO_LIGHT_BLUE, size: 49 },
    gridPattern: [2, 1, 2, 1, 2, 1, 2, 2],
    tileBorder: DVO_LIGHT_BLUE,
    images: [
      "/projects/DVO_Coaching/1.jpg",
      video("DVO_Coaching", "3", { tile: "half", background: DVO_LIGHT_BLUE, frame: "screen", size: 84, aspect: "1920 / 1200", onLight: true, screen: DVO_OFF_WHITE }),
      video("DVO_Coaching", "4", {
        tile: "half", background: DVO_OFF_WHITE, frame: "phone", size: 32.5, onLight: true,
        statusBar: { background: DVO_OFF_WHITE, color: "#000000", indicator: "rgba(0, 0, 0, 0.8)" },
      }),
      video("DVO_Coaching", "2", { tile: "full", background: DVO_OFF_WHITE, frame: "screen", size: 80, aspect: "1920 / 1200", onLight: true }),
      video("DVO_Coaching", "9", { tile: "half", background: DVO_OFF_WHITE, frame: "screen", size: 84, aspect: "1920 / 1200", onLight: true }),
      "/projects/DVO_Coaching/7.jpg",
      { type: "embed", name: "dvo-illustrations", background: DVO_NAVY },
      video("DVO_Coaching", "6", { tile: "half", background: DVO_LIGHT_BLUE, frame: "screen", size: 84, aspect: "1920 / 1200", onLight: true }),
      "/projects/DVO_Coaching/10.jpg",
      {
        type: "board",
        background: DVO_LIGHT_BLUE,
        columns: [6, -10, 12, -6, 10, -14].map((offset, i) => ({
          src: `/projects/DVO_Coaching/collage/col-${i + 1}.webp`,
          w: i % 2 ? 31 : 17.799,
          h: i % 2 ? 169.749 : 184.43,
          offset,
        })),
      },
      video("DVO_Coaching", "12", { tile: "half", background: DVO_NAVY, frame: "bleed" }),
      "/projects/DVO_Coaching/14.jpg",
      video("DVO_Coaching", "13", {
        tile: "half", background: DVO_OFF_WHITE, frame: "phone", size: 32.5, onLight: true,
        statusBar: { background: DVO_NAVY, color: "#ffffff", indicator: "rgba(255, 255, 255, 0.85)" },
      }),
      video("DVO_Coaching", "11", { tile: "half", background: DVO_LIGHT_BLUE, frame: "screen", size: 84, aspect: "1920 / 1200", onLight: true }),
    ],
  },
  {
    slug: "pulse20",
    title: "Pulse20",
    categories: ["Brand design", "UX / UI"],
    year: 2022,
    client: "Pulse20",
    employer: "Junction creative + digital agency",
    responsibilities: "Brand design, UX / UI",
    results: "Brand identity, UX / UI and mobile design",
    description: "Strength in every pulse",
    thumbnail: "/projects/Pulse20/Cover.jpg",
    featured: false,
    liveUrl: "https://www.pulse20.nl/",
    images: proj("Pulse20", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg",
      "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg",
    ]),
  },
  {
    slug: "dna-projecten",
    title: "DNA Projecten",
    categories: ["Brand design", "UX / UI"],
    year: 2022,
    client: "DNA projecten",
    employer: "Junction creative + digital agency",
    responsibilities: "Brand design, UX / UI",
    results: "Brand, UX / UI, desktop and mobile design",
    description: "Creator of happy workplaces",
    thumbnail: "/projects/DNA_Projecten/Cover.jpg",
    featured: true,
    liveUrl: "https://dnaprojecten.nl/",
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
    featured: true,
    images: proj("Gemeente_Tynaarlo", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg",
      "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.gif",
    ]),
  },
  {
    slug: "wdw",
    title: "WDW",
    categories: ["UX / UI"],
    year: 2022,
    client: "WDW",
    employer: "Junction creative + digital agency",
    responsibilities: "UX / UI",
    results: "UX / UI desktop and mobile design",
    description: "Creating gas-free residential areas",
    thumbnail: "/projects/WDW/Cover.jpg",
    featured: false,
    images: proj("WDW", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg",
      "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg",
    ]),
  },
  {
    slug: "pc-franeker",
    title: "PC Franeker",
    categories: ["Brand design", "UX / UI"],
    year: 2025,
    client: "PC Franeker",
    employer: "Junction creative + digital agency",
    responsibilities: "Brand design, UX / UI",
    results: "Brand identity update, UX / UI",
    description: "The Netherlands' oldest annual sports classic",
    thumbnail: "/projects/PC_Franeker/Cover.jpg",
    featured: true,
    liveUrl: "https://www.pc-franeker.nl/",
    images: proj("PC_Franeker", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg",
      "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg",
    ]),
  },
  {
    slug: "leeuwarder-golfclub",
    title: "Leeuwarder Golfclub",
    categories: ["Brand design", "UX / UI"],
    year: 2023,
    client: "Leeuwarder Golfclub",
    employer: "Junction creative + digital agency",
    results: "New Branding, UX / UI, Social media plan, Photography styling concepts",
    description: "Brand design and UX / UI for Leeuwarder Golfclub.",
    thumbnail: "/projects/Leeuwarder_Golfclub/Cover.jpg",
    featured: true,
    liveUrl: "https://www.leeuwardergolfclub.nl/",
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
    employer: "Junction creative + digital agency",
    responsibilities: "UX / UI",
    results: "UX / UI desktop and mobile design",
    description: "Life isn't always fair, but your coffee can be!",
    thumbnail: "/projects/Cafe_Del_Mar/Cover.jpg",
    featured: true,
    liveUrl: "https://www.cafedelmar.nl/",
    images: proj("Cafe_Del_Mar", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg",
      "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg",
    ]),
  },
  {
    slug: "vanhulley",
    title: "Vanhulley",
    categories: ["UX / UI"],
    year: 2022,
    client: "Vanhulley",
    employer: "Junction creative + digital agency",
    responsibilities: "UX / UI",
    results: "UX / UI desktop and mobile design",
    description: "We are limited editions",
    thumbnail: "/projects/Van_Hulley/Cover.jpg",
    featured: true,
    liveUrl: "https://www.vanhulley.com/",
    images: proj("Van_Hulley", [
      "1.jpg", "2.jpg", "3.gif", "4.jpg",
      "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg",
    ]),
  },
  {
    slug: "de-boer-rvs",
    title: "De Boer RVS",
    categories: ["UX / UI"],
    year: 2026,
    client: "De Boer RVS",
    employer: "Junction creative + digital agency",
    responsibilities: "UX / UI",
    results: "UX / UI desktop and mobile design",
    description: "Progress starts here!",
    thumbnail: "/projects/De_Boer_RVS/Cover.jpg",
    featured: false,
    liveUrl: "https://www.deboerrvs.nl/",
    images: proj("De_Boer_RVS", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg",
      "6.jpg", "7.jpg", "8.jpg", "9.jpg",
    ]),
  },
  {
    slug: "civ-water",
    title: "CIV Water",
    categories: ["UX / UI"],
    year: 2022,
    client: "CIV Water",
    employer: "Junction creative + digital agency",
    responsibilities: "UX / UI",
    results: "UX / UI desktop and mobile design",
    description: "Collaborating on the development of agile professionals for the water sector",
    thumbnail: "/projects/CIV_Water/Cover.jpg",
    featured: false,
    liveUrl: "https://civwater.nl/",
    images: proj("CIV_Water", [
      "1.jpg", "2.jpg", "3.jpg", "4.png", "5.jpg", "6.jpg",
    ]),
  },
  {
    slug: "open-agency-night",
    title: "Open Agency Night",
    categories: ["UX / UI"],
    year: 2022,
    client: "Junction & Mica",
    employer: "Junction creative + digital agency",
    responsibilities: "UX / UI",
    results: "UX / UI desktop and mobile design",
    description: "Come and see what's behind the doors of the biggest agencies of the North",
    thumbnail: "/projects/Open_Agency_Night/Cover.jpg",
    featured: false,
    liveUrl: "https://www.openagencynight.nl/",
    images: proj("Open_Agency_Night", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg",
    ]),
  },
  {
    slug: "spieren-voor-spieren",
    title: "Spieren voor Spieren",
    categories: ["UX / UI"],
    year: 2022,
    client: "Spieren voor Spieren",
    employer: "Junction creative + digital agency",
    format: "Campaign site",
    responsibilities: "UX / UI",
    results: "UX / UI desktop and mobile design",
    description: "The mission: to beat all child muscle diseases!",
    thumbnail: "/projects/Spieren_voor_Spieren/Cover.jpg",
    featured: false,
    images: proj("Spieren_voor_Spieren", [
      "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg",
    ]),
  },
];

/** Portraits of Jesse — hero carousel, about slideshow and transition frames.
 *  Explicit list (not a numeric range) because the numbering has gaps. */
export const portraits: string[] = [
  "/images/portrait/Jesse-01.jpg",
  "/images/portrait/Jesse-02.jpg",
  "/images/portrait/Jesse-03.jpg",
  "/images/portrait/Jesse-04.jpg",
  "/images/portrait/Jesse-05.jpg",
  "/images/portrait/Jesse-07.jpg",
  "/images/portrait/Jesse-09.jpg",
  "/images/portrait/Jesse-10.jpg",
];

/** Landscape portraits of Jesse — only in the home hero strip, where they run
 *  at the same height as the 4:5 portraits (so 3:2 → a wider slide). */
export const heroLandscapes: string[] = [
  "/images/portrait/Jesse-11.jpg",
];

/** Portrait travel photos — reused as the random fillers woven into the work grid.
 *  Filenames double as the caption source (see lib/momentsCaptions.ts). */
export const momentsPhotos: string[] = [
  "/images/moments/abandoned-airport-italy-2021.jpg",
  "/images/moments/bali-nusa-penida-2022.jpg",
  "/images/moments/golden-hour-surfing-bali-2022.jpg",
  "/images/moments/winter-on-the-slopes-fiss-2022.jpg",
  "/images/moments/kelingking-beach-nusa-penida-2022.jpg",
  "/images/moments/tropical-picknick-bali-2022.jpg",
  "/images/moments/mountain-view-fiss-2022.jpg",
  "/images/moments/early-morning-in-the-mountains-fiss-2022.jpg",
  "/images/moments/collection-of-surfboards-bali-2022.jpg",
  "/images/moments/a-view-on-the-colosseum-italy-2021.jpg",
  "/images/moments/tropical-groceriestore-gili-islands-2022.jpg",
  "/images/moments/the-perfect-holiday-spot-italy-2021.jpg",
  "/images/moments/lifeguard-s-house-bali-2022.jpg",
  "/images/moments/bali-bali-2022.jpg",
  "/images/moments/cinque-terre-italy-2021.jpg",
  "/images/moments/colorful-mitsubishi-bali-2022.jpg",
  "/images/moments/playing-football-in-paradise-gili-islands-2022.jpg",
  "/images/moments/parked-car-bali-2022.jpg",
  "/images/moments/classic-skilift-fiss-2022.jpg",
  "/images/moments/cinque-terre-italy-2021-2.jpg",
  "/images/moments/scooter-parking-bali-2022.jpg",
  "/images/moments/diamond-beach-nusa-penida-2022.jpg",
  "/images/moments/tegalalang-rice-terrace-bali-2022.jpg",
  "/images/moments/tropical-gas-station-nusa-penida-2022.jpg",
  "/images/moments/padang-padang-beach-bali-2022.jpg",
  "/images/moments/tower-of-pisa-italy-2021.jpg",
  "/images/moments/tropical-paradise-gili-islands-2022.jpg",
  "/images/moments/sunrise-on-mount-batur-bali-2022.jpg",
  "/images/moments/italian-porche-italy-2021.jpg",
  "/images/moments/chilling-on-the-beach-italy-2021.jpg",
  "/images/moments/surfing-in-black-white-bali-2022.jpg",
  "/images/moments/winter-on-the-slopes-fiss-2022-2.jpg",
  "/images/moments/golden-hour-surfing-bali-2022-2.jpg",
  "/images/moments/view-on-the-mountains-fiss-2022.jpg",
  "/images/moments/a-view-on-lombok-gili-islands-2022.jpg",
  "/images/moments/roadtrip-tuscany-italy-2021.jpg",
  "/images/moments/diamond-beach-nusa-penida-2022-2.jpg",
  "/images/moments/golden-hour-surfing-bali-2022-3.jpg",
  "/images/moments/sea-fishing-saint-tropez-2020.jpg",
  "/images/moments/ameland-lighthouse-ameland-2021.jpg",
  "/images/moments/beach-bird-netherlands-2020.jpg",
  "/images/moments/beach-houses-netherlands-2020.jpg",
  "/images/moments/beach-houses-netherlands-2020-2.jpg",
  "/images/moments/cadillac-in-the-rain-netherlands-2021.jpg",
  "/images/moments/riviera-villa-cote-d-azur-2020.jpg",
  "/images/moments/ice-skating-netherlands-2021.jpg",
  "/images/moments/island-ferry-wadden-sea-2021.jpg",
  "/images/moments/village-under-the-peak-dolomites-2022.jpg",
  "/images/moments/crossing-the-tracks-cape-town-2024.jpg",
  "/images/moments/golden-beach-cape-town-2024.jpg",
  "/images/moments/green-point-stadium-cape-town-2024.jpg",
  "/images/moments/retro-gas-station-cape-town-2024.jpg",
  "/images/moments/lion-s-head-cape-town-2024.jpg",
  "/images/moments/laundry-day-cape-town-2024.jpg",
  "/images/moments/camp-below-the-peak-dolomites-2026.jpg",
  "/images/moments/alpine-meadow-dolomites-2026.jpg",
  "/images/moments/bikes-at-lago-di-braies-dolomites-2026.jpg",
  "/images/moments/silhouette-dolomites-2026.jpg",
  "/images/moments/loaded-up-dolomites-2026.jpg",
  "/images/moments/shadow-self-portrait-dolomites-2026.jpg",
  "/images/moments/house-number-73-cape-town-2026.jpg",
  "/images/moments/beach-huts-cape-town-2026.jpg",
  "/images/moments/wild-camping-dolomites-2026.jpg",
  "/images/moments/mountain-marina-lake-garda-2026.jpg",
  "/images/moments/room-with-a-view-dolomites-2026.jpg",
  "/images/moments/lunch-break-dolomites-2026.jpg",
  "/images/moments/ponto-final-lisbon-2026.jpg",
  "/images/moments/above-the-valley-dolomites-2026.jpg",
  "/images/moments/wildflowers-dolomites-2026.jpg",
  "/images/moments/alpine-cows-dolomites-2026.jpg",
  "/images/moments/alpine-hotel-dolomites-2026.jpg",
  "/images/moments/dusk-over-the-lake-lake-garda-2026.jpg",
  "/images/moments/which-way-next-dolomites-2026.jpg",
  "/images/moments/pedal-boats-lake-garda-2026.jpg",
  "/images/moments/golden-hour-bike-dolomites-2026.jpg",
  "/images/moments/packed-and-ready-dolomites-2026.jpg",
  "/images/moments/marina-at-sunset-lake-garda-2026.jpg",
  "/images/moments/pastel-corner-dolomites-2026.jpg",
  "/images/moments/lakeside-hotel-lake-garda-2026.jpg",
  "/images/moments/below-the-wall-dolomites-2026.jpg",
  "/images/moments/view-from-the-tent-dolomites-2026.jpg",
  "/images/moments/crossing-the-border-dolomites-2026.jpg",
  "/images/moments/church-in-the-vineyards-italy-2026.jpg",
  "/images/moments/nightfall-on-the-lake-lake-garda-2026.jpg",
  "/images/moments/lake-ferry-lake-garda-2026.jpg",
  "/images/moments/chalet-country-alps-2026.jpg",
  "/images/moments/through-the-trees-italy-2026.jpg",
  "/images/moments/glittering-water-lake-garda-2026.jpg",
  "/images/moments/lago-di-braies-dolomites-2026.jpg",
  "/images/moments/hilltop-church-dolomites-2026.jpg",
  "/images/moments/summer-chairlift-dolomites-2026.jpg",
  "/images/moments/vintage-caravan-dolomites-2026.jpg",
  "/images/moments/prinsentuin-leeuwarden-2020.jpg",
  "/images/moments/prinsentuin-leeuwarden-2021.jpg",
  "/images/moments/retro-bike-netherlands-2021.jpg",
  "/images/moments/sunset-tower-netherlands-2021.jpg",
  "/images/moments/evening-sky-netherlands-2021.jpg",
  "/images/moments/dune-cabin-terschelling-2020.jpg",
  "/images/moments/cycling-the-crete-tuscany-2021.jpg",
  "/images/moments/vintage-volvo-netherlands-2020.jpg",
  "/images/moments/vintage-volvo-netherlands-2020-2.jpg",
  "/images/moments/wadden-at-low-tide-wadden-sea-2021.jpg",
  "/images/moments/frozen-morning-netherlands-2021.jpg",
  "/images/moments/passo-sella-dolomites-2021.jpg",
  "/images/moments/autumn-in-the-harbour-netherlands-2021.jpg",
  "/images/moments/caught-on-camera-netherlands-2021.jpg",
  "/images/moments/twin-doors-netherlands-2021.jpg",
  "/images/moments/beach-post-netherlands-2021.jpg",
  "/images/moments/mailboxes-in-bloom-netherlands-2021.jpg",
  "/images/moments/green-jersey-netherlands-2026.jpg",
  "/images/moments/polka-dot-jersey-netherlands-2026.jpg",
  "/images/moments/golden-hour-in-the-village-tour-du-mont-blanc-2026.jpg",
  "/images/moments/trailhead-tour-du-mont-blanc-2026.jpg",
  "/images/moments/trail-signs-tour-du-mont-blanc-2026.jpg",
  "/images/moments/village-church-tour-du-mont-blanc-2026.jpg",
  "/images/moments/hut-in-the-meadow-tour-du-mont-blanc-2026.jpg",
  "/images/moments/summit-in-black-white-tour-du-mont-blanc-2026.jpg",
  "/images/moments/rolling-ridges-tour-du-mont-blanc-2026.jpg",
  "/images/moments/tent-at-dusk-tour-du-mont-blanc-2026.jpg",
  "/images/moments/white-horse-in-the-meadow-tour-du-mont-blanc-2026.jpg",
  "/images/moments/mountain-stream-tour-du-mont-blanc-2026.jpg",
  "/images/moments/morning-at-the-campsite-tour-du-mont-blanc-2026.jpg",
  "/images/moments/boutique-santino-tour-du-mont-blanc-2026.jpg",
  "/images/moments/glacier-in-black-white-tour-du-mont-blanc-2026.jpg",
  "/images/moments/taking-in-the-view-tour-du-mont-blanc-2026.jpg",
  "/images/moments/looking-up-at-the-peak-tour-du-mont-blanc-2026.jpg",
  "/images/moments/lunch-with-a-view-tour-du-mont-blanc-2026.jpg",
  "/images/moments/contrail-over-the-ridge-tour-du-mont-blanc-2026.jpg",
  "/images/moments/trail-shoes-tour-du-mont-blanc-2026.jpg",
  "/images/moments/lakeside-break-tour-du-mont-blanc-2026.jpg",
  "/images/moments/picnic-in-the-woods-tour-du-mont-blanc-2026.jpg",
  "/images/moments/sheep-on-the-run-tour-du-mont-blanc-2026.jpg",
  "/images/moments/grazing-flock-tour-du-mont-blanc-2026.jpg",
  "/images/moments/mountain-refuge-tour-du-mont-blanc-2026.jpg",
  "/images/moments/silhouettes-on-the-ridge-tour-du-mont-blanc-2026.jpg",
  "/images/moments/old-chairlift-tour-du-mont-blanc-2026.jpg",
  "/images/moments/village-epicerie-tour-du-mont-blanc-2026.jpg",
  "/images/moments/camping-in-the-forest-tour-du-mont-blanc-2026.jpg",
  "/images/moments/riverside-flowers-tour-du-mont-blanc-2026.jpg",
  "/images/moments/busy-high-street-tour-du-mont-blanc-2026.jpg",
  "/images/moments/chalets-at-golden-hour-tour-du-mont-blanc-2026.jpg",  "/images/moments/brick-corner-house-groningen-2026.jpg",
  "/images/moments/corner-cafe-groningen-2026.jpg",
  "/images/moments/evening-on-the-canal-groningen-2026.jpg",
  "/images/moments/ice-cream-at-noorderzon-groningen-2026.jpg",
  "/images/moments/view-from-the-cabin-alde-feanen-2026.jpg",
  "/images/moments/golden-hour-sailing-alde-feanen-2026.jpg",
  "/images/moments/under-sail-alde-feanen-2026.jpg",
  "/images/moments/sailing-at-dusk-alde-feanen-2026.jpg",
  "/images/moments/moored-for-the-night-alde-feanen-2026.jpg",
  "/images/moments/on-the-jetty-alde-feanen-2026.jpg",
  "/images/moments/tent-in-the-dunes-schiermonnikoog-2026.jpg",
  "/images/moments/path-to-the-lighthouse-schiermonnikoog-2026.jpg",
  "/images/moments/red-lighthouse-schiermonnikoog-2026.jpg",
  "/images/moments/lighthouse-through-the-grass-schiermonnikoog-2026.jpg",
  "/images/moments/village-cyclist-schiermonnikoog-2026.jpg",
  "/images/moments/lifeguard-on-duty-schiermonnikoog-2026.jpg",
];

export const featuredProjects = projects.filter((p) => p.featured);
