import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import GlobalUIStates from "../task-06-leaderboard/GlobalUIStates";

afterEach(cleanup);

describe("GlobalUIStates", () => {
  it("renders the page with its heading", () => {
    render(<GlobalUIStates />);

    expect(screen.getByTestId("page-ui-states")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Харагдах төлөвүүд");
  });

  it("shows every element in all five states", () => {
    const { container } = render(<GlobalUIStates />);

    expect(container.querySelectorAll(".ui-row:not(.ui-head)")).toHaveLength(8);
    expect(container.querySelectorAll(".ui-sample")).toHaveLength(40);
    expect(container.querySelectorAll(".ui-sample button:disabled")).toHaveLength(8);
  });

  it("marks the required login fields as invalid", () => {
    render(<GlobalUIStates />);

    expect(screen.getByLabelText("Оюутны код *").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Оюутны кодоо оруулна уу.")).toBeTruthy();
  });
});
