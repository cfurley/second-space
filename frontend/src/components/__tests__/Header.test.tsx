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

    it("renders logout button in header", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });
  });


  describe("Logout Functionality", () => {
    it("shows logout confirmation dialog when logout button is clicked", async () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const logoutButton = screen.getByText("Logout");
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText(/Confirm Logout/)).toBeInTheDocument();
        expect(screen.getByText("Are you sure you want to logout? You will be taken back to the login screen.")).toBeInTheDocument();
      });
    });

    it("closes dialog when cancel is clicked", async () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const logoutButton = screen.getByText("Logout");
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText(/Confirm Logout/)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelButton);

      expect(screen.queryByText(/Confirm Logout/)).not.toBeInTheDocument();
    });

    it("clears localStorage when logout is confirmed", async () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;

      const logoutButton = screen.getByText("Logout");
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText(/Confirm Logout/)).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole("button");
      const confirmLogoutButton = buttons.find((btn: HTMLElement) => btn.textContent?.includes("Logout") && btn.className.includes("!bg-amber"));
      if (confirmLogoutButton) {
        fireEvent.click(confirmLogoutButton);
      }

      await waitFor(() => {
        // Check that userCache localStorage keys are cleared (not 'user')
        expect(localStorage.getItem('ss_user_data')).toBeNull();
        expect(localStorage.getItem('ss_user_data_expiry')).toBeNull();
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

