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
    
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
    expect(button.textContent).toBe("🌙");
  });

  it("initializes with dark theme and adds dark class to document", () => {
    render(<ThemeToggleButton />);
    
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe(null);
  });

  it("opens dropdown menu when button is clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggleButton />);

    const button = screen.getByRole("button");
    await user.click(button);

    const darkOption = await screen.findByText("Dark");
    const lightOption = await screen.findByText("Light");

    expect(darkOption).toBeDefined();
    expect(lightOption).toBeDefined();
  });

  it("switches to light theme when light option is clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggleButton />);

    // Open dropdown
    const button = screen.getByRole("button");
    await user.click(button);

    // Click light theme
    const lightOption = await screen.findByText("Light");
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
    const button = screen.getByRole("button");
    await user.click(button);

    // Click dark theme
    const darkOption = await screen.findByText("Dark");
    await user.click(darkOption);

    // Verify dark class is added and theme is saved
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("loads saved light theme from localStorage on mount", () => {
    localStorage.setItem("theme", "light");
    
    render(<ThemeToggleButton />);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    const button = screen.getByRole("button");
    expect(button.textContent).toBe("☀️");
  });

  it("displays correct icon for current theme", async () => {
    const user = userEvent.setup();
    render(<ThemeToggleButton />);

    const button = screen.getByRole("button");
    expect(button.textContent).toBe("🌙"); // Dark theme icon

    // Switch to light
    await user.click(button);
    const lightOption = await screen.findByText("Light");
    await user.click(lightOption);

    await waitFor(() => {
      expect(button.textContent).toBe("☀️"); // Light theme icon
    });
  });

  it("closes dropdown after selecting a theme", async () => {
    const user = userEvent.setup();
    render(<ThemeToggleButton />);

    // Open dropdown
    const button = screen.getByRole("button");
    await user.click(button);

    // Verify dropdown is open
    expect(screen.queryByText("Dark")).toBeDefined();

    // Select light theme
    const lightOption = await screen.findByText("Light");
    await user.click(lightOption);

    // Verify dropdown is closed
    await waitFor(() => {
      expect(screen.queryByText("Light")).toBeNull();
    });
  });
});