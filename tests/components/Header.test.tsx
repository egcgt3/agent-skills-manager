import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("Header", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  it("shows a loading spinner while auth status is loading", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      logout: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(<Header />);

    expect(document.querySelector(".loading-spinner")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  it("shows Login and Sign Up links, and no Dashboard link, when logged out", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      logout: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(<Header />);

    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute(
      "href",
      "/register"
    );
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("shows the user's avatar initial and account menu when logged in", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: "gerardo@example.com", name: "Gerardo" },
      isLoading: false,
      logout: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(<Header />);

    expect(screen.getByText("G")).toBeInTheDocument();
    expect(screen.getByText("Gerardo")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Dashboard" })
    ).toHaveLength(3);
    expect(
      screen.getByRole("link", { name: "Create Skill" })
    ).toHaveAttribute("href", "/dashboard/skills/new");
  });

  it("calls logout when the Logout button is clicked", () => {
    const logout = vi.fn();
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: "gerardo@example.com", name: "Gerardo" },
      isLoading: false,
      logout,
      login: vi.fn(),
      register: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
