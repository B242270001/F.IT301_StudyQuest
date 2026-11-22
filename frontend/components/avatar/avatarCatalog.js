// TASK-01: Дүрийн (avatar) сонголтын каталог.
// Утгууд нь backend/src/models/avatarOptions.js-тэй ижил байх ёстой.

export const AVATAR_PARTS = [
  {
    field: "body",
    label: "Биеийн хэлбэр",
    options: [
      { value: "female", label: "Эмэгтэй" },
      { value: "male", label: "Эрэгтэй" },
    ],
  },
  {
    field: "hairStyle",
    label: "Үсний загвар",
    options: [
      { value: "short", label: "Богино" },
      { value: "buzz", label: "Тайрмал" },
      { value: "long", label: "Урт" },
      { value: "bun", label: "Боодол" },
      { value: "ponytail", label: "Гэзэг" },
      { value: "curly", label: "Буржгар" },
    ],
  },
  {
    field: "outfit",
    label: "Хувцас",
    options: [
      { value: "hoodie", label: "Hoodie" },
      { value: "tshirt", label: "Футболк" },
      { value: "deel", label: "Дээл" },
      { value: "dress", label: "Даашинз" },
    ],
  },
  {
    field: "accessory",
    label: "Нэмэлт",
    options: [
      { value: "none", label: "Байхгүй" },
      { value: "glasses", label: "Нүдний шил" },
      { value: "headphones", label: "Чихэвч" },
      { value: "cap", label: "Малгай" },
    ],
  },
];

export const AVATAR_COLORS = [
  {
    field: "skinTone",
    label: "Арьсны өнгө",
    colors: ["#f6d7bd", "#eec19a", "#d9a074", "#b97b52", "#8a5634"],
  },
  {
    field: "hairColor",
    label: "Үсний өнгө",
    colors: ["#2b1d14", "#5a3825", "#a0522d", "#d9b26f", "#7c5cfc", "#1f2937"],
  },
  {
    field: "outfitColor",
    label: "Хувцасны өнгө",
    colors: ["#7c5cfc", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"],
  },
];

export const DEFAULT_AVATAR = {
  body: "female",
  skinTone: "#eec19a",
  hairStyle: "long",
  hairColor: "#2b1d14",
  outfit: "hoodie",
  outfitColor: "#7c5cfc",
  accessory: "none",
};

const HEX = /^#[0-9a-fA-F]{6}$/;

// API-гаас дутуу/буруу утга ирвэл default-оор нөхөж, дүр хэзээ ч эвдрэхгүй.
export function normalizeAvatar(config) {
  const out = { ...DEFAULT_AVATAR };
  if (!config || typeof config !== "object") return out;
  for (const { field, options } of AVATAR_PARTS) {
    if (options.some((o) => o.value === config[field])) out[field] = config[field];
  }
  for (const { field } of AVATAR_COLORS) {
    if (HEX.test(config[field] || "")) out[field] = config[field];
  }
  return out;
}
