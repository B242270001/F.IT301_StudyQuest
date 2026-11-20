import { NOTE_MAX_LENGTH } from "../models/Note.js";

export function validateNote(body = {}) {
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    return {
      error: { status: 422, message: "Тэмдэглэлийн агуулга хоосон байж болохгүй", field: "content" },
    };
  }
  if (content.length > NOTE_MAX_LENGTH) {
    return {
      error: {
        status: 422,
        message: `Тэмдэглэл ${NOTE_MAX_LENGTH} тэмдэгтээс хэтрэхгүй`,
        field: "content",
      },
    };
  }
  return { value: { content } };
}
