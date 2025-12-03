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

  test("renders in light mode by default", async () => {
    // Mock the GET /theme/theme call
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ theme_id: LIGHT_THEME_ID }),
    });

    await act(async () => {
      render(<ThemeSelector />);
    });

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("🌙");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("loads saved dark theme from API", async () => {
    // Mock the GET /theme/theme call returning dark theme
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ theme_id: DARK_THEME_ID }),
    });

    await act(async () => {
      render(<ThemeSelector />);
    });

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
    expect(button).toHaveTextContent("🌙"); // Light mode emoji
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Click to toggle
    await act(async () => {
      fireEvent.click(button);
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(button).toHaveTextContent("🌞"); // Dark mode emoji

    // Check that PUT was called with the dark theme ID
    const putCall = (global.fetch as any).mock.calls.find(
      (call: any[]) => call[1] && call[1].method === "PUT"
    );
    expect(putCall).toBeDefined();
    expect(JSON.parse(putCall[1].body)).toEqual({ themeId: DARK_THEME_ID });
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
    expect(button).toHaveTextContent("🌙");

    // Second click (Light -> Dark)
    await act(async () => {
      fireEvent.click(button);
    });
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(button).toHaveTextContent("🌞");

    // Check that the second PUT request saved the DARK theme (ID 1)
    const putCalls = (global.fetch as any).mock.calls.filter(
      (call: any[]) => call[1] && call[1].method === "PUT"
    );
    expect(putCalls.length).toBe(2);
    expect(JSON.parse(putCalls[1][1].body)).toEqual({ themeId: DARK_THEME_ID });
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
