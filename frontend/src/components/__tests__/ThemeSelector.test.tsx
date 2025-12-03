/// <reference types="jest" />

import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeSelector } from "../ThemeSelector";
import { vi } from "vitest";

// Mock the global fetch function
global.fetch = vi.fn();

// Theme IDs used in the component (must match backend IDs)
const DARK_THEME_ID = 1;
const LIGHT_THEME_ID = 2;

describe("ThemeSelector", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
    vi.clearAllMocks();
  });

  test("renders in light mode by default", () => {
    render(<ThemeSelector />);
    const button = screen.getByRole("button");
    // The selector now renders only an emoji: 🌙 for light, 🌞 for dark
    expect(button).toHaveTextContent("🌙");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("loads saved dark theme from localStorage", () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeSelector />);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("🌞");
  });

  test("toggles from light → dark mode when clicked and calls PUT API", async () => {
    // Mock initial GET call returning light theme
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ theme_id: LIGHT_THEME_ID }),
    });

    // Mock the PUT call for toggling
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Theme updated" }),
    });

    await act(async () => {
      render(<ThemeSelector />);
    });

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("🌙");

    // Click to toggle
    await act(async () => {
      fireEvent.click(button);
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(button).toHaveTextContent("🌞");
  });

  test("toggles from dark → light mode when clicked twice and calls PUT API", async () => {
    // Mock initial GET call returning dark theme
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ theme_id: DARK_THEME_ID }),
    });

    // Mock PUT calls
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Theme updated" }),
    });

    await act(async () => {
      render(<ThemeSelector />);
    });

    const button = screen.getByRole("button");
    expect(document.documentElement.classList.contains("dark")).toBe(true); // Should start dark

    // First click (Dark -> Light)
    await act(async () => {
      fireEvent.click(button);
    });
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
    expect(button).toHaveTextContent("🌙");
  });

  test("does not crash if localStorage is unavailable", async () => {
    // Mock GET call
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ theme_id: LIGHT_THEME_ID }),
    });

    const originalLocalStorage = window.localStorage;
    // @ts-ignore - simulate missing localStorage
    delete window.localStorage;

    await act(async () => {
      expect(() => render(<ThemeSelector />)).not.toThrow();
    });

    window.localStorage = originalLocalStorage;
  });

  test("falls back to localStorage if API call fails", async () => {
    // Mock GET call to fail
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    // Set localStorage to dark
    localStorage.setItem("theme", "dark");

    await act(async () => {
      render(<ThemeSelector />);
    });

    // Should load dark theme from localStorage
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("🌞");
  });
});
