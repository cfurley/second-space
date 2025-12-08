import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

    it("shows default US initials when no user data", async () => {
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

  describe("Profile Menu", () => {
    it("displays username when menu is opened", async () => {
      setUserCache(mockUser);
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      await waitFor(() => {
        const profileButton = screen.getByText("JC");
        fireEvent.click(profileButton);
      });

      expect(screen.getByText("jackiechen")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("closes menu when profile button is clicked again", async () => {
      setUserCache(mockUser);
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      await waitFor(() => {
        const profileButton = screen.getByText("JC");
        fireEvent.click(profileButton);
      });

      expect(screen.getByText("jackiechen")).toBeInTheDocument();

      const profileButton = screen.getByText("JC");
      fireEvent.click(profileButton);

      expect(screen.queryByText("jackiechen")).not.toBeInTheDocument();
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

  describe("Logout Functionality", () => {
    it("clears user cache when logout is clicked", async () => {
      setUserCache(mockUser);
      
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      await waitFor(() => {
        const profileButton = screen.getByText("JC");
        fireEvent.click(profileButton);
      });

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;
      
      const logoutButton = screen.getByText("Logout");
      fireEvent.click(logoutButton);

      // Verify cache is cleared (both keys)
      expect(localStorage.getItem('ss_user_data')).toBeNull();
      expect(localStorage.getItem('ss_user_data_expiry')).toBeNull();
      // Also check legacy key is cleared
      expect(localStorage.getItem('user')).toBeNull();
    });

    it("closes menu after logout", async () => {
      setUserCache(mockUser);
      
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      await waitFor(() => {
        const profileButton = screen.getByText("JC");
        fireEvent.click(profileButton);
      });

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;
      
      const logoutButton = screen.getByText("Logout");
      fireEvent.click(logoutButton);

      expect(screen.queryByText("jackiechen")).not.toBeInTheDocument();
    });
  });
});

