// TASK-01 (Lab 6): бүртгэлийн оролтын шалгалт
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,30}$/;

// Backend-ийн validateCreateUser-тэй ижил дүрэм (хэрэглэгчид түргэн хариу өгөх)
export function validateRegister({ username, displayName, password, confirm }) {
  const errors = {};
  const u = username.trim();
  const d = displayName.trim();
  if (!u) errors.username = "Нэвтрэх нэрээ оруулна уу";
  else if (!USERNAME_PATTERN.test(u)) errors.username = "3–30 тэмдэгт: латин үсэг, тоо, . _ -";
  if (!d) errors.displayName = "Нэрээ оруулна уу";
  else if (d.length < 2 || d.length > 50) errors.displayName = "Нэр 2–50 тэмдэгт байна";
  if (!password) errors.password = "Нууц үгээ оруулна уу";
  else if (password.length < 6) errors.password = "Нууц үг хамгийн багадаа 6 тэмдэгт";
  if (password && confirm !== password) errors.confirm = "Нууц үг таарахгүй байна";
  return errors;
}
