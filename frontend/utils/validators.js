/**
 * TASK-04 — Д. Баттөмөр
 * Нэр, тайлбар, файл төрөл/хэмжээний validation
 */

// Course title: required, 3-80 chars
export function validateTitle(title) {
  if (!title || !title.trim()) return "Хичээлийн нэр оруулна уу";
  if (title.trim().length < 3) return "Нэр хамгийн багадаа 3 тэмдэгт";
  if (title.trim().length > 80) return "Нэр хамгийн ихдээ 80 тэмдэгт";
  return null;
}

// Course category: required
export function validateCategory(category) {
  const valid = ["WEB", "OS", "DATABASE", "PROGRAMMING"];
  if (!category) return "Ангилал сонгоно уу";
  if (!valid.includes(category)) return "Зөв ангилал сонгоно уу";
  return null;
}

// Course description: required, 10-500 chars
export function validateDescription(description) {
  if (!description || !description.trim()) return "Тайлбар оруулна уу";
  if (description.trim().length < 10) return "Тайлбар хамгийн багадаа 10 тэмдэгт";
  if (description.trim().length > 500) return "Тайлбар хамгийн ихдээ 500 тэмдэгт";
  return null;
}

// Material file: type and size
export function validateMaterial(file) {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg"
  ];
  if (!allowedTypes.includes(file.type)) return "Зөвхөн pdf, pptx, docx, png, jpg файл";
  if (file.size > 10 * 1024 * 1024) return "Файл 10 MB-аас их байна";
  return null;
}

// Lecture title: required only if any lecture field is filled
export function validateLectureTitle(title) {
  if (!title || !title.trim()) return "Лекцийн гарчиг оруулна уу";
  return null;
}

// Lecture content: required only if any lecture field is filled
export function validateLectureContent(content) {
  if (!content || !content.trim()) return "Лекцийн агуулга оруулна уу";
  return null;
}

// Validate entire course form
export function validateCourseForm({ title, category, description, lectureTitle, lectureTopic, lectureSummary, lectureContent, lectureCode, lectureDemo }) {
  const errors = {};

  const titleErr = validateTitle(title);
  if (titleErr) errors.title = titleErr;

  const catErr = validateCategory(category);
  if (catErr) errors.category = catErr;

  const descErr = validateDescription(description);
  if (descErr) errors.description = descErr;

  // Check if any lecture field is filled
  const hasLecture = lectureTitle || lectureTopic || lectureSummary || lectureContent || lectureCode || lectureDemo;
  if (hasLecture) {
    const ltErr = validateLectureTitle(lectureTitle);
    if (ltErr) errors.lectureTitle = ltErr;
    const lcErr = validateLectureContent(lectureContent);
    if (lcErr) errors.lectureContent = lcErr;
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}


// --- Task 03 (Г. Тэмүүжин): Суралцах замналын нэгж болон тэмдэглэл шалгах ---
export function validatePathUnitInput(input = {}) {
  const errors = {};
  const title = (input.title || '').trim();
  const unitGroup = Number(input.unitGroup);
  const xp = Number(input.xp);

  if (!title) {
    errors.title = 'Нэгжийн нэрийг заавал оруулна уу.';
  } else if (title.length < 2) {
    errors.title = 'Нэгжийн нэр хамгийн багадаа 2 тэмдэгт байна.';
  } else if (title.length > 40) {
    errors.title = 'Нэгжийн нэр 40 тэмдэгтээс хэтрэхгүй байна.';
  }

  if (!Number.isInteger(unitGroup) || unitGroup < 1 || unitGroup > 10) {
    errors.unitGroup = 'Нэгжийн дугаар 1-ээс 10 хооронд бүхэл тоо байна.';
  }

  if (Number.isNaN(xp) || xp < 10 || xp > 500) {
    errors.xp = 'XP оноо 10-аас 500 хооронд байх ёстой.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateStudyNoteInput(noteText = '') {
  const trimmed = String(noteText || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Тэмдэглэлийн агуулга хоосон байж болохгүй.' };
  }
  if (trimmed.length < 5) {
    return { isValid: false, error: 'Тэмдэглэл хамгийн багадаа 5 тэмдэгт байна.' };
  }
  if (trimmed.length > 300) {
    return { isValid: false, error: 'Тэмдэглэл 300 тэмдэгтээс хэтрэхгүй байна.' };
  }
  return { isValid: true, error: '' };
}