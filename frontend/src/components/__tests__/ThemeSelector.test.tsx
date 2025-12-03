import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { ThemeSelector } from "../ThemeSelector";
import { api } from "../../utils/api";

// Mock the API module
vi.mock("../../utils/api", () => ({
  api: {
    getThemes: vi.fn(),
  },
}));

// Mock the UI components if necessary, but rendering them is usually better for integration tests.
// Since Shadcn uses Radix, we might need to rely on pointer events or simple clicks.
// For unit testing, standard fireEvent usually works for triggers.

describe("ThemeSelector", () => {
  const mockThemes = [
    {
      id: "1",
      name: "Light Theme",
      backgroundColor: "#ffffff",
      mainColor: "#000000",
      textColor: "#333333",
      subColor: "#f0f0f0",
      errorColor: "#ff0000",
    },
    {
      id: "2",
      name: "Dark Theme",
      backgroundColor: "#000000",
      mainColor: "#ffffff",
      textColor: "#cccccc",
      subColor: "#1a1a1a",
      errorColor: "#ff0000",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document styles and storage before each test
    document.documentElement.style.cssText = "";
    document.documentElement.className = "";
    localStorage.clear();
  });

  it("fetches themes on mount", async () => {
    (api.getThemes as any).mockResolvedValue(mockThemes);
    
    render(<ThemeSelector />);

    await waitFor(() => {
      expect(api.getThemes).toHaveBeenCalledTimes(1);
    });
  });

  it("renders the theme button", () => {
    (api.getThemes as any).mockResolvedValue(mockThemes);
    render(<ThemeSelector />);
    
    const button = screen.getByLabelText("Select Theme");
    expect(button).toBeDefined();
  });

  it("opens dropdown and displays themes when clicked", async () => {
    (api.getThemes as any).mockResolvedValue(mockThemes);
    const user = userEvent.setup();
    render(<ThemeSelector />);

    // Wait for loading to finish (if any)
    await waitFor(() => expect(api.getThemes).toHaveBeenCalled());

    // Open dropdown
    const button = screen.getByLabelText("Select Theme");
    await user.click(button);

    // Check if themes are visible
    // Note: Radix UI portals content, but testing-library usually finds it if it's in the DOM
    const lightThemeOption = await screen.findByText("Light Theme");
    const darkThemeOption = await screen.findByText("Dark Theme");

    expect(lightThemeOption).toBeDefined();
    expect(darkThemeOption).toBeDefined();
  });

  it("applies theme styles and saves to localStorage when a theme is selected", async () => {
    (api.getThemes as any).mockResolvedValue(mockThemes);
    const user = userEvent.setup();
    render(<ThemeSelector />);

    // Wait for fetch
    await waitFor(() => expect(api.getThemes).toHaveBeenCalled());

    // Open dropdown
    const button = screen.getByLabelText("Select Theme");
    await user.click(button);

    // Click "Dark Theme"
    const darkThemeOption = await screen.findByText("Dark Theme");
    await user.click(darkThemeOption);

    // Verify localStorage
    expect(localStorage.getItem("themeId")).toBe("2");

    // Verify CSS variables were set on <html> (document.documentElement)
    const rootStyle = document.documentElement.style;
    expect(rootStyle.getPropertyValue("--background")).toBe("#000000");
    expect(rootStyle.getPropertyValue("--foreground")).toBe("#cccccc");
    expect(rootStyle.getPropertyValue("--primary")).toBe("#ffffff");
  });

  it("adds 'dark' class if theme name contains 'dark'", async () => {
    (api.getThemes as any).mockResolvedValue(mockThemes);
    const user = userEvent.setup();
    render(<ThemeSelector />);

    await waitFor(() => expect(api.getThemes).toHaveBeenCalled());

    const button = screen.getByLabelText("Select Theme");
    await user.click(button);

    const darkThemeOption = await screen.findByText("Dark Theme");
    await user.click(darkThemeOption);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("handles empty theme list gracefully", async () => {
    (api.getThemes as any).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<ThemeSelector />);

    await waitFor(() => expect(api.getThemes).toHaveBeenCalled());

    const button = screen.getByLabelText("Select Theme");
    await user.click(button);

    const noThemesMessage = await screen.findByText("No themes found");
    expect(noThemesMessage).toBeDefined();
    expect(noThemesMessage.getAttribute("aria-disabled")).toBe("true");
  });

  it("loads saved theme from localStorage on mount", async () => {
    // Setup localStorage before mount
    localStorage.setItem("themeId", "2");
    (api.getThemes as any).mockResolvedValue(mockThemes);

    render(<ThemeSelector />);

    await waitFor(() => {
      // It should apply styles immediately upon finding the theme in the fetched list
      expect(document.documentElement.style.getPropertyValue("--background")).toBe("#000000");
    });
  });
});