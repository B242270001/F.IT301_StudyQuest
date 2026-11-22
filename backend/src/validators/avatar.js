import { AVATAR_COLOR_FIELDS, AVATAR_OPTIONS, HEX_COLOR } from "../models/avatarOptions.js";

const FIELD_LABELS = {
  body: "Биеийн хэлбэр",
  hairStyle: "Үсний загвар",
  outfit: "Хувцас",
  accessory: "Нэмэлт",
  skinTone: "Арьсны өнгө",
  hairColor: "Үсний өнгө",
  outfitColor: "Хувцасны өнгө",
};

// Бүх 7 талбарыг заавал шаардана — хагас дутуу дүр хадгалагдахгүй.
export function validateAvatarConfig(body = {}) {
  const value = {};

  for (const [field, allowed] of Object.entries(AVATAR_OPTIONS)) {
    const v = body[field];
    if (!allowed.includes(v)) {
      return {
        error: {
          status: 422,
          message: `${FIELD_LABELS[field]} буруу байна (${allowed.join(", ")})`,
          field,
        },
      };
    }
    value[field] = v;
  }

  for (const field of AVATAR_COLOR_FIELDS) {
    const v = body[field];
    if (typeof v !== "string" || !HEX_COLOR.test(v)) {
      return {
        error: { status: 422, message: `${FIELD_LABELS[field]} #RRGGBB хэлбэртэй байна`, field },
      };
    }
    value[field] = v.toLowerCase();
  }

  return { value };
}
