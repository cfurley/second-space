import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Header } from "../Header";
import { setUserCache, clearUserCache } from '../../utils/userCache';

describe("Header Component", () => {
  const mockOnNavChange = vi.fn();
  const mockUser = {
    id: "1",
    username: "jackiechen",
    first_name: "Jackie",
    last_name: "Chen"
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    clearUserCache();
  });

  describe("Rendering", () => {
    it("renders header with branding and search", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);
      expect(screen.getByText("Second Space")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Search spaces...")).toBeInTheDocument();
    });

    it("renders logout button in header", async () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);
      await waitFor(() => {
        expect(screen.getByText("US")).toBeInTheDocument();
      });
    });

    it("shows generated initials from stored user data", async () => {
      setUserCache(mockUser);
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);
      await waitFor(() => {
        expect(screen.getByText("JC")).toBeInTheDocument();
      });
    });
  });

  describe("Search Functionality", () => {
    it("calls onSearchChange when search input changes", () => {
      const mockOnSearchChange = vi.fn();
      render(
        <Header 
          activeNav="Spaces" 
          onNavChange={mockOnNavChange}
          searchQuery=""
          onSearchChange={mockOnSearchChange}
        />
      );

      const searchInput = screen.getByPlaceholderText("Search spaces...") as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: "test" } });

      expect(mockOnSearchChange).toHaveBeenCalledWith("test");
    });

    it("displays current search query", () => {
      render(
        <Header 
          activeNav="Spaces" 
          onNavChange={mockOnNavChange}
          searchQuery="spaces"
          onSearchChange={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText("Search spaces...") as HTMLInputElement;
      expect(searchInput.value).toBe("spaces");
    });
  });
});

