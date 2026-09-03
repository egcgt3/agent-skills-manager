import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import CopyButton from "@/components/CopyButton";

describe("CopyButton", () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeText.mockClear();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the copy icon with the default aria-label", () => {
    render(<CopyButton text="hello world" />);

    expect(
      screen.getByRole("button", { name: "Copy skill content" })
    ).toBeInTheDocument();
  });

  it("copies the given text to the clipboard when clicked", async () => {
    render(<CopyButton text="hello world" />);
    const button = screen.getByRole("button", { name: "Copy skill content" });

    await act(async () => {
      button.click();
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith("hello world");
  });

  it("shows the 'Copied' state after copying, then reverts after 1.5s", async () => {
    render(<CopyButton text="hello world" />);
    const button = screen.getByRole("button", { name: "Copy skill content" });

    await act(async () => {
      button.click();
    });

    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(
      screen.getByRole("button", { name: "Copy skill content" })
    ).toBeInTheDocument();
  });
});
