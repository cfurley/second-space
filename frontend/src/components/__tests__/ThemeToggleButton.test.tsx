import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { ThemeToggleButton } from "../ThemeToggleButton";

describe("ThemeToggleButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document styles and storage before each test
    document.documentElement.className = "";
    localStorage.clear();
  });

  it("renders the theme toggle button with dark theme by default", () => {
    render(<ThemeToggleButton />);
    
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeDefined();
    expect(button.textContent).toBe("🌙");
  });

  it("initializes with dark theme and adds dark class to document", () => {
    render(<ThemeToggleButton />);
    
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe(null);
  });

  it("has proper accessibility labels", () => {
    render(<ThemeToggleButton />);
    
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toHaveAttribute("aria-label", "Toggle theme");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("updates aria-expanded when dropdown is toggled", async () => {
    const user = userEvent.setup();
    render(<ThemeToggleButton />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("opens dropdown menu when button is clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggleButton />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    const darkOption = await screen.findByRole("menuitem", { name: /switch to dark theme/i });
    const lightOption = await screen.findByRole("menuitem", { name: /switch to light theme/i });

    expect(darkOption).toBeDefined();
    expect(lightOption).toBeDefined();
  });

  it("switches to light theme when light option is clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggleButton />);

    // Open dropdown
    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    // Click light theme
    const lightOption = await screen.findByRole("menuitem", { name: /switch to light theme/i });
    await user.click(lightOption);

    // Verify dark class is removed and theme is saved
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("switches to dark theme when dark option is clicked", async () => {
    // Start with light theme
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
    
    const user = userEvent.setup();
    render(<ThemeToggleButton />);

    // Open dropdown
    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    // Click dark theme
    const darkOption = await screen.findByRole("menuitem", { name: /switch to dark theme/i });
    await user.click(darkOption);

    // Verify dark class is added and theme is saved
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("loads saved light theme from localStorage on mount", () => {
    localStorage.setItem("theme", "light");
    
    render(<ThemeToggleButton />);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button.textContent).toBe("☀️");
  });

  it("closes dropdown after selecting a theme", async () => {
    const user = userEvent.setup();
    render(<ThemeToggleButton />);

    // Open dropdown
    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    // Verify dropdown is open
    const lightOption = await screen.findByRole("menuitem", { name: /switch to light theme/i });
    expect(lightOption).toBeDefined();

    // Select light theme
    await user.click(lightOption);

    // Verify dropdown is closed
    await waitFor(() => {
      expect(screen.queryByRole("menuitem", { name: /switch to light theme/i })).not.toBeInTheDocument();
    });
  });
});