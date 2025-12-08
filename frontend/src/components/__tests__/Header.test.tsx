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

  describe("Profile Menu", () => {
    it("displays username when menu is opened", async () => {
      setUserCache(mockUser);
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const profileButton = await waitFor(() => screen.getByText("JC"));
      fireEvent.click(profileButton);

      // After opening the menu, click the Logout item to open confirmation
      const logoutButton = await waitFor(() => screen.getByText("Logout"));
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText(/Confirm Logout/)).toBeInTheDocument();
        expect(screen.getByText("Are you sure you want to logout? You will be taken back to the login screen.")).toBeInTheDocument();
      });
    });

    it("closes menu when profile button is clicked again", async () => {
      setUserCache(mockUser);
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const profileButton = await waitFor(() => screen.getByText("JC"));
      fireEvent.click(profileButton);

      const logoutButton = await waitFor(() => screen.getByText("Logout"));
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

      // Open profile menu and the confirmation dialog
      const profileButton = await waitFor(() => screen.getByText("US"));
      fireEvent.click(profileButton);
      const logoutButton = await waitFor(() => screen.getByText("Logout"));
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText(/Confirm Logout/)).toBeInTheDocument();
      });

      // Find the dialog and click the confirm Logout button inside it
      const dialog = screen.getByText(/Confirm Logout/).closest('div');
      if (dialog) {
        const { getByRole } = within(dialog as HTMLElement);
        const confirmLogoutButton = getByRole('button', { name: /logout/i });
        fireEvent.click(confirmLogoutButton);
      }

      await waitFor(() => {
        expect(localStorage.getItem('user')).toBeNull();
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

      await waitFor(() => {
        expect(screen.getByText(/Confirm Logout/)).toBeInTheDocument();
      });

      const dialog = screen.getByText(/Confirm Logout/).closest('div');
      if (dialog) {
        const { getByRole } = within(dialog as HTMLElement);
        const confirmLogoutButton = getByRole('button', { name: 'Logout' });
        fireEvent.click(confirmLogoutButton);
      }

      // Verify cache is cleared (both keys)
      await waitFor(() => {
        expect(localStorage.getItem('ss_user_data')).toBeNull();
        expect(localStorage.getItem('ss_user_data_expiry')).toBeNull();
        // Also check legacy key is cleared
        expect(localStorage.getItem('user')).toBeNull();
      });
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

      await waitFor(() => {
        expect(screen.getByText(/Confirm Logout/)).toBeInTheDocument();
      });

      const dialog = screen.getByText(/Confirm Logout/).closest('div');
      if (dialog) {
        const { getByRole } = within(dialog as HTMLElement);
        const confirmLogoutButton = getByRole('button', { name: 'Logout' });
        fireEvent.click(confirmLogoutButton);
      }

      await waitFor(() => {
        expect(screen.queryByText("jackiechen")).not.toBeInTheDocument();
      });
    });
  });
});

