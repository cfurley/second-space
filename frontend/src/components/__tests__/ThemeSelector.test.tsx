/// <reference types="jest" />

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeSelector } from "../ThemeSelector";

describe("ThemeSelector", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  test("renders in light mode by default", () => {
    render(<ThemeSelector />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Dark Mode");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("loads saved dark theme from localStorage", () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeSelector />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Light Mode");
  });

  test("toggles from light → dark mode when clicked", () => {
    render(<ThemeSelector />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Dark Mode");

    fireEvent.click(button);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(button).toHaveTextContent("Light Mode");
  });

  test("toggles from dark → light mode when clicked twice", () => {
    render(<ThemeSelector />);

    const button = screen.getByRole("button");

    // First click → dark
    fireEvent.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");

    // Second click → light
    fireEvent.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
    expect(button).toHaveTextContent("Dark Mode");
  });

  test("does not crash if localStorage is unavailable", () => {
    const originalLocalStorage = window.localStorage;
    // @ts-ignore - simulate missing localStorage
    delete window.localStorage;

    expect(() => render(<ThemeSelector />)).not.toThrow();

    window.localStorage = originalLocalStorage;
  });
});
