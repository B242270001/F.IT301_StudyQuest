const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,30}$/;
const ALLOWED_ROLES = new Set(["STUDENT", "TEACHER"]);

function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateCreateUser(body = {}) {
  const username = asString(body.username);
  const password = typeof body.password === "string" ? body.password : "";
  const displayName = asString(body.displayName);
  const role = asString(body.role || "STUDENT").toUpperCase();

  if (!username) {
    return { error: { status: 422, message: "Нэр оруулна уу", field: "username" } };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return {
      error: {
        status: 422,
        message: "Нэр 3–30 тэмдэгт, зөвхөн үсэг, тоо, . _ - байна",
        field: "username",
      },
    };
  }
  if (!displayName) {
    return { error: { status: 422, message: "Нэр оруулна уу", field: "displayName" } };
  }
  if (displayName.length < 2 || displayName.length > 50) {
    return {
      error: {
        status: 422,
        message: "Харагдах нэр 2–50 тэмдэгт байна",
        field: "displayName",
      },
    };
  }
  if (!password) {
    return { error: { status: 422, message: "Нууц үг оруулна уу", field: "password" } };
  }
  if (password.length < 6) {
    return {
      error: {
        status: 422,
        message: "Нууц үг хамгийн багадаа 6 тэмдэгт байна",
        field: "password",
      },
    };
  }
  if (!ALLOWED_ROLES.has(role)) {
    return {
      error: {
        status: 422,
        message: "Эрх STUDENT эсвэл TEACHER байна",
        field: "role",
      },
    };
  }

  return { value: { username, password, displayName, role } };
}

export function validateLogin(body = {}) {
  const username = asString(body.username);
  const password = typeof body.password === "string" ? body.password : "";

  if (!username) {
    return { error: { status: 422, message: "Нэр оруулна уу", field: "username" } };
  }
  if (!password) {
    return { error: { status: 422, message: "Нууц үг оруулна уу", field: "password" } };
  }

  return { value: { username, password } };
}
