import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  it("renders as a contentinfo landmark with the tagline text", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent(
      "Built with Next.js 16 + DaisyUI — Demonstrating SSG, SSR, ISR, and CSR patterns"
    );
  });
});
