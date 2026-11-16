import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ExploreCourses from "../task-05-explore/ExploreCourses";
import courses from "../../public/mock/courses.json";
import topics from "../../public/mock/topics.json";
import lectures from "../../public/mock/lectures.json";
import topicProgress from "../../public/mock/topic-progress.json";

const mockFiles = {
  "/mock/courses.json": courses,
  "/mock/topics.json": topics,
  "/mock/lectures.json": lectures,
  "/mock/topic-progress.json": topicProgress,
};

const student = { id: "U05", displayName: "Б. Тэмүүлэн", role: "STUDENT", totalXp: 2480, streakDays: 7, avatar: "Т" };

function serveMock(failing = false) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => (failing ? { ok: false, statusText: "boom" } : { ok: true, json: async () => mockFiles[url] })),
  );
}

// Node 25-ийн өөрийн (ажиллагаагүй) localStorage нь jsdom-ынхыг дардаг тул санах ойн хувилбар ашиглана
function memoryStorage() {
  const items = new Map();
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
    clear: () => items.clear(),
  };
}

const renderPage = (user = student) =>
  render(
    <MemoryRouter initialEntries={["/explore"]}>
      <ExploreCourses user={user} />
    </MemoryRouter>,
  );

const courseList = () => within(screen.getByRole("list", { name: "Хичээлүүд" }));
// Жагсаалт ачаалагдтал хүлээж, дараа нь тухайн хичээлийн нэр харагдаж байгааг баталгаажуулна
const see = (text) => waitFor(() => expect(courseList().getByText(text)).toBeInTheDocument());

beforeEach(() => vi.stubGlobal("localStorage", memoryStorage()));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ExploreCourses", () => {
  it("shows the shared Navbar with Судлах active and every course with the student's progress", async () => {
    serveMock();
    renderPage();

    await see("Веб систем ба технологи");
    expect(courseList().getByText("Үйлдлийн систем")).toBeInTheDocument();
    expect(courseList().getByText("Өгөгдлийн сан")).toBeInTheDocument();
    expect(screen.getByText(/3 \/ 6 сэдэв дууссан/)).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Судлах" })).toHaveClass("active");
  });

  it("lists the selected course's topics with done / current / next states and lecture links", async () => {
    serveMock();
    renderPage();

    const detail = within(await screen.findByRole("region", { name: /Веб систем ба технологи — сэдвүүд/ }));
    expect(detail.getAllByText("Дууссан")).toHaveLength(3);
    expect(detail.getByText("Үргэлжилж байна")).toBeInTheDocument();
    expect(detail.getAllByText("Дараагийн")).toHaveLength(2);
    expect(detail.getAllByRole("link", { name: "Лекц үзэх" })[3]).toHaveAttribute("href", "/explore/lecture/L04");
  });

  it("continues the current topic from the course card", async () => {
    serveMock();
    renderPage();

    const link = await screen.findByRole("link", { name: "Үргэлжлүүлэх: Веб систем ба технологи" });
    expect(link).toHaveAttribute("href", "/explore/lecture/L04");
  });

  it("switches the detail panel when another course is selected", async () => {
    serveMock();
    renderPage();

    await see("Үйлдлийн систем");
    fireEvent.click(courseList().getByRole("button", { name: /Үйлдлийн систем/ }));
    const detail = within(await screen.findByRole("region", { name: /Үйлдлийн систем — сэдвүүд/ }));
    expect(detail.getByText("Процессийн төлөв")).toBeInTheDocument();
    expect(detail.getAllByText("Лекц удахгүй")).toHaveLength(3);
  });

  it("filters by search text (case-insensitive) after a short debounce", async () => {
    serveMock();
    renderPage();
    await see("Веб систем ба технологи");

    fireEvent.change(screen.getByRole("searchbox", { name: "Хичээл хайх" }), { target: { value: "ҮЙЛДЛИЙН" } });
    await waitFor(() => expect(courseList().queryByText("Веб систем ба технологи")).not.toBeInTheDocument());
    expect(courseList().getByText("Үйлдлийн систем")).toBeInTheDocument();
  });

  it("filters by category chip", async () => {
    serveMock();
    renderPage();
    await see("Веб систем ба технологи");

    fireEvent.click(screen.getByRole("button", { name: "Өгөгдлийн сан" }));
    await waitFor(() => expect(courseList().queryByText("Үйлдлийн систем")).not.toBeInTheDocument());
    expect(courseList().getByText("Өгөгдлийн сан")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Өгөгдлийн сан" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows an empty state and clears the filters", async () => {
    serveMock();
    renderPage();
    await see("Веб систем ба технологи");

    const box = screen.getByRole("searchbox", { name: "Хичээл хайх" });
    fireEvent.change(box, { target: { value: "xyz-байхгүй" } });
    expect(await screen.findByText("Хайлтад тохирох хичээл олдсонгүй.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Шүүлтүүр арилгах" }));
    expect(box).toHaveValue("");
    await see("Веб систем ба технологи");
  });

  it("shows an error message when the data cannot be loaded", async () => {
    serveMock(true);
    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("ачаалж чадсангүй");
  });
});
