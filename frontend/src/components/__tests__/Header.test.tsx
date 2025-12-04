import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Header } from "../Header";

describe("Header Component", () => {
  const mockOnNavChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders header with correct structure", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      // Check main elements are present
      expect(screen.getByText("Second Space")).toBeInTheDocument();
    });

    it("renders search input", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const searchInput = screen.getByPlaceholderText("Search spaces...");
      expect(searchInput).toBeInTheDocument();
    });

    it("renders profile button with AT text", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const profileButton = screen.getByText("AT");
      expect(profileButton).toBeInTheDocument();
    });
  });

  describe("Profile Menu", () => {
    it("profile menu is initially hidden", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      expect(screen.queryByText("Username")).not.toBeInTheDocument();
      expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    });

    it("opens profile menu when profile button is clicked", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const profileButton = screen.getByText("AT");
      fireEvent.click(profileButton);

      expect(screen.getByText("Username")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("closes profile menu when profile button is clicked again", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const profileButton = screen.getByText("AT");
      fireEvent.click(profileButton);
      expect(screen.getByText("Username")).toBeInTheDocument();

      fireEvent.click(profileButton);
      expect(screen.queryByText("Username")).not.toBeInTheDocument();
    });

    it("shows username and logout options in dropdown", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const profileButton = screen.getByText("AT");
      fireEvent.click(profileButton);

      expect(screen.getByText("Username")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("search input accepts text", () => {
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
      fireEvent.change(searchInput, { target: { value: "test search" } });

      expect(mockOnSearchChange).toHaveBeenCalledWith("test search");
    });

    it("displays current search query in input", () => {
      render(
        <Header 
          activeNav="Spaces" 
          onNavChange={mockOnNavChange}
          searchQuery="existing query"
          onSearchChange={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText("Search spaces...") as HTMLInputElement;
      expect(searchInput.value).toBe("existing query");
    });
  });

  describe("Title/Logo", () => {
    it("renders Second Space title with larger size", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const title = screen.getByText("Second Space");
      expect(title).toBeInTheDocument();
      // Title should have font size of 0.5 inch (inline style)
      expect(title).toHaveStyle({ fontSize: '0.5in' });
    });

    it("title is semibold", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const title = screen.getByText("Second Space");
      expect(title).toHaveClass("font-semibold");
    });
  });

  describe("Header Layout", () => {
    it("header has flex layout with space-between", () => {
      const { container } = render(
        <Header activeNav="Spaces" onNavChange={mockOnNavChange} />
      );

      const flexContainer = container.querySelector(".flex.items-center.justify-between");
      expect(flexContainer).toBeInTheDocument();
    });

    it("header has correct padding", () => {
      const { container } = render(
        <Header activeNav="Spaces" onNavChange={mockOnNavChange} />
      );

      const header = container.querySelector("header");
      expect(header).toHaveClass("px-8");
      expect(header).toHaveClass("py-3");
    });
  });

  describe("Accessibility", () => {
    it("header uses semantic HTML element", () => {
      const { container } = render(
        <Header activeNav="Spaces" onNavChange={mockOnNavChange} />
      );

      const header = container.querySelector("header");
      expect(header?.tagName.toLowerCase()).toBe("header");
    });

    it("profile button is accessible", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const profileButton = screen.getByText("AT");
      expect(profileButton.tagName.toLowerCase()).toBe("button");
    });

    it("search input has accessible placeholder", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const searchInput = screen.getByPlaceholderText("Search spaces...");
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe("Dark Mode Support", () => {
    it("header has dark mode styling classes", () => {
      const { container } = render(
        <Header activeNav="Spaces" onNavChange={mockOnNavChange} />
      );

      const header = container.querySelector("header");
      expect(header).toHaveClass("dark:bg-[#0a0a0a]");
      expect(header).toHaveClass("dark:border-white/10");
    });

    it("title has dark mode text color", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const title = screen.getByText("Second Space");
      expect(title).toHaveClass("dark:text-white");
    });

    it("search input has dark mode styling", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const searchInput = screen.getByPlaceholderText("Search spaces...");
      expect(searchInput).toHaveClass("dark:bg-white/5");
      expect(searchInput).toHaveClass("dark:text-white");
    });
  });
});
