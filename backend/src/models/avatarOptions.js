// TASK-01: Хэрэглэгчийн дүрийн (avatar) зөвшөөрөгдсөн сонголтууд.
// Frontend-ийн frontend/components/avatar/avatarCatalog.js-тэй ижил утгатай байх ёстой.

export const AVATAR_OPTIONS = {
  body: ["female", "male"],
  hairStyle: ["short", "buzz", "long", "bun", "ponytail", "curly"],
  outfit: ["hoodie", "tshirt", "deel", "dress"],
  accessory: ["none", "glasses", "headphones", "cap"],
};

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export const AVATAR_COLOR_FIELDS = ["skinTone", "hairColor", "outfitColor"];

const SKIN_TONES = ["#f6d7bd", "#eec19a", "#d9a074", "#b97b52", "#8a5634"];
const HAIR_COLORS = ["#2b1d14", "#5a3825", "#a0522d", "#d9b26f", "#7c5cfc", "#1f2937"];
const OUTFIT_COLORS = ["#7c5cfc", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

export const DEFAULT_AVATAR = {
  body: "female",
  skinTone: SKIN_TONES[1],
  hairStyle: "long",
  hairColor: HAIR_COLORS[0],
  outfit: "hoodie",
  outfitColor: OUTFIT_COLORS[0],
  accessory: "none",
};

// Хүйсээр анхны дүр сонгоно; seed (тоо) өгвөл өнгө, үсийг хувиргаж хэрэглэгч бүр өөр харагдана.
export function defaultAvatarFor(gender = "female", seed = 0) {
  const body = gender === "male" ? "male" : "female";
  const hairs = body === "male" ? ["short", "buzz", "curly"] : ["long", "bun", "ponytail", "curly"];
  return {
    body,
    skinTone: SKIN_TONES[seed % SKIN_TONES.length],
    hairStyle: hairs[seed % hairs.length],
    hairColor: HAIR_COLORS[seed % HAIR_COLORS.length],
    outfit: ["hoodie", "tshirt", "deel"][seed % 3],
    outfitColor: OUTFIT_COLORS[seed % OUTFIT_COLORS.length],
    accessory: ["none", "glasses", "none", "headphones"][seed % 4],
  };
}
