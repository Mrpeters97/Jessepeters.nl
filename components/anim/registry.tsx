"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Live (code) animations referenced by name from lib/data.ts — card covers via
 * `thumbnailEmbed`, detail-grid tiles via `{ type: "embed", name }`. Each is
 * code-split, so a page only loads the animations it shows; card covers live in
 * their own small modules so Home and Work never load a project's detail tiles.
 */

type TileProps = { delay?: number; mobile?: boolean; background?: string };
type CoverProps = { alt: string };

const pulse20 = () => import("./pulse20/Pulse20");
const pulse20Brand = () => import("./pulse20/Pulse20Brand");
const cafeDelMar = () => import("./cafedelmar/CafeDelMar");
const dna = () => import("./dna/Dna");
const vanHulley = () => import("./vanhulley/VanHulley");
const tynaarlo = () => import("./tynaarlo/Tynaarlo");
const wdw = () => import("./wdw/Wdw");
const pc = () => import("./pc/Pc");
const oan = () => import("./oan/Oan");
const lgc = () => import("./lgc/Lgc");
const dvo = () => import("./dvo/Dvo");
const civ = () => import("./civ/Civ");
const civBrand = () => import("./civ/CivBrand");
const sappe = () => import("./sappe/Sappe");
const deBoer = () => import("./deboer/DeBoer");

export const animTiles: Record<string, ComponentType<TileProps>> = {
  "dvo-illustrations": dynamic(() => import("@/components/dvo/DvoIllustrations")) as ComponentType<TileProps>,
  "deboer-cube": dynamic(() => import("@/components/thumbs/CubeTile")) as ComponentType<TileProps>,
  "pulse20-2": dynamic(() => pulse20().then((m) => m.Pulse20Build)),
  "pulse20-3": dynamic(() => pulse20().then((m) => m.Pulse20Uitleg)),
  "pulse20-4": dynamic(() => pulse20().then((m) => m.Pulse20Board)),
  "pulse20-5": dynamic(() => pulse20().then((m) => m.Pulse20Overview)),
  "pulse20-8": dynamic(() => pulse20().then((m) => m.Pulse20Insta)),
  "pulse20-design": dynamic(() => pulse20Brand().then((m) => m.Pulse20Design)),
  "pulse20-components": dynamic(() => pulse20Brand().then((m) => m.Pulse20Components)),
  "cafedelmar-2": dynamic(() => cafeDelMar().then((m) => m.CafeDelMarMelanges)),
  "cafedelmar-4": dynamic(() => cafeDelMar().then((m) => m.CafeDelMarBoard)),
  "cafedelmar-5": dynamic(() => cafeDelMar().then((m) => m.CafeDelMarHero)),
  "cafedelmar-7": dynamic(() => cafeDelMar().then((m) => m.CafeDelMarFooter)),
  "cafedelmar-8": dynamic(() => cafeDelMar().then((m) => m.CafeDelMarLogo)),
  "dna-2": dynamic(() => dna().then((m) => m.DnaOverview)),
  "dna-4": dynamic(() => dna().then((m) => m.DnaBoard)),
  "dna-5": dynamic(() => dna().then((m) => m.DnaRings)),
  "dna-6": dynamic(() => dna().then((m) => m.DnaLogo)),
  "dna-7": dynamic(() => dna().then((m) => m.DnaScreens)),
  "dna-10": dynamic(() => dna().then((m) => m.DnaHonors)),
  "dna-11": dynamic(() => dna().then((m) => m.DnaSotd)),
  "vanhulley-2": dynamic(() => vanHulley().then((m) => m.VanHulleyLogos)),
  "vanhulley-4": dynamic(() => vanHulley().then((m) => m.VanHulleyBoard)),
  "vanhulley-7": dynamic(() => vanHulley().then((m) => m.VanHulleyFooter)),
  "vanhulley-8": dynamic(() => vanHulley().then((m) => m.VanHulleyDuo)),
  "tynaarlo-3": dynamic(() => tynaarlo().then((m) => m.TynaarloInsta)),
  "tynaarlo-7": dynamic(() => tynaarlo().then((m) => m.TynaarloBoard)),
  "wdw-1": dynamic(() => wdw().then((m) => m.WdwBoard)),
  "wdw-2": dynamic(() => wdw().then((m) => m.WdwOverview)),
  "wdw-4": dynamic(() => wdw().then((m) => m.WdwFull)),
  "wdw-5": dynamic(() => wdw().then((m) => m.WdwArrows)),
  "wdw-7": dynamic(() => wdw().then((m) => m.WdwPages)),
  "wdw-9": dynamic(() => wdw().then((m) => m.WdwCircles)),
  "pc-2": dynamic(() => pc().then((m) => m.PcLogo)),
  "pc-3": dynamic(() => pc().then((m) => m.PcPlayers)),
  "pc-4": dynamic(() => pc().then((m) => m.PcBoard)),
  "pc-5": dynamic(() => pc().then((m) => m.PcText)),
  "pc-6": dynamic(() => pc().then((m) => m.PcKings)),
  "pc-7": dynamic(() => pc().then((m) => m.PcRows)),
  "pc-8": dynamic(() => pc().then((m) => m.PcHistory)),
  "pc-9": dynamic(() => pc().then((m) => m.PcSlides)),
  "oan-3": dynamic(() => oan().then((m) => m.OanMap)),
  "oan-4": dynamic(() => oan().then((m) => m.OanBoard)),
  "oan-5": dynamic(() => oan().then((m) => m.OanAward)),
  "oan-intro": dynamic(() => oan().then((m) => m.OanIntro)),
  "oan-timetable": dynamic(() => oan().then((m) => m.OanTimetable)),
  "oan-agencies": dynamic(() => oan().then((m) => m.OanAgencies)),
  "lgc-3": dynamic(() => lgc().then((m) => m.LgcLogo)),
  "lgc-4": dynamic(() => lgc().then((m) => m.LgcBoard)),
  "lgc-5": dynamic(() => lgc().then((m) => m.LgcSite)),
  "lgc-7": dynamic(() => lgc().then((m) => m.LgcPartners)),
  "lgc-8": dynamic(() => lgc().then((m) => m.LgcPattern)),
  "lgc-11": dynamic(() => lgc().then((m) => m.LgcInsta)),
  "lgc-design": dynamic(() => lgc().then((m) => m.LgcDesign)),
  "lgc-components": dynamic(() => lgc().then((m) => m.LgcComponents)),
  "lgc-concept": dynamic(() => lgc().then((m) => m.LgcConcept)),
  "lgc-type": dynamic(() => lgc().then((m) => m.LgcType)),
  "civ-2": dynamic(() => civ().then((m) => m.CivOverview)),
  "civ-3": dynamic(() => civ().then((m) => m.CivPhones)),
  "civ-4": dynamic(() => civ().then((m) => m.CivBoard)),
  "civ-5": dynamic(() => civ().then((m) => m.CivWaves)),
  "civ-menu": dynamic(() => civ().then((m) => m.CivMenu)),
  "civ-design": dynamic(() => civBrand().then((m) => m.CivDesign)),
  "civ-components": dynamic(() => civBrand().then((m) => m.CivComponents)),
  "civ-partners": dynamic(() => civBrand().then((m) => m.CivPartners)),
  "sappe-login": dynamic(() => sappe().then((m) => m.SappeLogin)),
  "sappe-design": dynamic(() => sappe().then((m) => m.SappeDesign)),
  "sappe-ux": dynamic(() => sappe().then((m) => m.SappeUx)),
  "sappe-flow": dynamic(() => sappe().then((m) => m.SappeFlow)),
  "sappe-learning": dynamic(() => sappe().then((m) => m.SappeLearning)),
  "sappe-questions": dynamic(() => sappe().then((m) => m.SappeQuestions)),
  "sappe-board": dynamic(() => sappe().then((m) => m.SappeBoard)),
  "sappe-components": dynamic(() => sappe().then((m) => m.SappeComponents)),
  "sappe-knowledge": dynamic(() => sappe().then((m) => m.SappeKnowledge)),
  "deboer-4": dynamic(() => deBoer().then((m) => m.DeBoerHome)),
  "deboer-5": dynamic(() => deBoer().then((m) => m.DeBoerMenu)),
  "deboer-6": dynamic(() => deBoer().then((m) => m.DeBoerPhones)),
  "deboer-7": dynamic(() => deBoer().then((m) => m.DeBoerBoard)),
  "deboer-8": dynamic(() => deBoer().then((m) => m.DeBoerWireframes)),
  "deboer-design": dynamic(() => deBoer().then((m) => m.DeBoerDesign)),
  "deboer-components": dynamic(() => deBoer().then((m) => m.DeBoerComponents)),
};

/** Detail-page heroes: drawn over the static hero image, which stays as the LCP and fallback. */
export const animHeroes: Record<string, ComponentType<CoverProps>> = {
  "pulse20-hero": dynamic(() => pulse20().then((m) => m.Pulse20PageHero)),
  "cafedelmar-hero": dynamic(() => cafeDelMar().then((m) => m.CafeDelMarPageHero)),
  "vanhulley-hero": dynamic(() => vanHulley().then((m) => m.VanHulleyPageHero)),
  "wdw-hero": dynamic(() => wdw().then((m) => m.WdwPageHero)),
  "pc-hero": dynamic(() => pc().then((m) => m.PcPageHero)),
  "oan-hero": dynamic(() => oan().then((m) => m.OanPageHero)),
  "lgc-hero": dynamic(() => lgc().then((m) => m.LgcPageHero)),
  "dvo-hero": dynamic(() => dvo().then((m) => m.DvoPageHero)),
  "civ-hero": dynamic(() => civ().then((m) => m.CivPageHero)),
};

/** Marks set above the title in the detail-page hero, keyed by `heroEmbed`; `play` starts their build-up. */
export const animHeroMarks: Record<string, ComponentType<{ play: boolean }>> = {
  "pc-hero": dynamic(() => pc().then((m) => m.PcHeroCrown)),
};

export const animCovers: Record<string, ComponentType<CoverProps>> = {
  "deboer-cube": dynamic(() => import("@/components/thumbs/DeBoerCube")),
  "pulse20-cover": dynamic(() => import("./pulse20/Pulse20Cover").then((m) => m.Pulse20Cover)),
  "cafedelmar-cover": dynamic(() => import("./cafedelmar/CafeDelMarCover").then((m) => m.CafeDelMarCover)),
  "dna-cover": dynamic(() => import("./dna/DnaCover").then((m) => m.DnaCover)),
  "vanhulley-cover": dynamic(() => import("./vanhulley/VanHulleyCover").then((m) => m.VanHulleyCover)),
  "wdw-cover": dynamic(() => import("./wdw/WdwCover").then((m) => m.WdwCover)),
  "pc-cover": dynamic(() => import("./pc/PcCover").then((m) => m.PcCover)),
  "oan-cover": dynamic(() => import("./oan/OanCover").then((m) => m.OanCover)),
  "lgc-cover": dynamic(() => import("./lgc/LgcCover").then((m) => m.LgcCover)),
  "civ-cover": dynamic(() => import("./civ/CivCover").then((m) => m.CivCover)),
  "sappe-cover": dynamic(() => import("./sappe/SappeCover").then((m) => m.SappeCover)),
};
