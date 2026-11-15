import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Node 25+ өөрийн localStorage-тай болсон бөгөөд --localstorage-file өгөөгүй бол
// undefined буцааж, jsdom-ын localStorage-ийг дардаг. jsdom-ынхыг буцааж холбоно.
for (const name of ["localStorage", "sessionStorage"]) {
  if (!globalThis[name] && globalThis.jsdom) {
    Object.defineProperty(globalThis, name, {
      value: globalThis.jsdom.window[name],
      configurable: true,
      writable: true,
    });
  }
}

// globals: false үед Testing Library автоматаар цэвэрлэдэггүй тул тест бүрийн дараа цэвэрлэнэ.
afterEach(() => cleanup());
