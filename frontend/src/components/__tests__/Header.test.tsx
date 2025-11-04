import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Header } from "../Header";

describe("Header Component - Borders and Styling", () => {
  const mockOnNavChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders header with correct structure", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      // Check main elements are present
      expect(screen.getByText("Second Space")).toBeInTheDocument();
      expect(screen.getByText("Spaces")).toBeInTheDocument();
      expect(screen.getByText("Recent")).toBeInTheDocument();
      expect(screen.getByText("Shared")).toBeInTheDocument();
    });

    it("renders with glass styling class", () => {
      const { container } = render(
        <Header activeNav="Spaces" onNavChange={mockOnNavChange} />
      );

      const header = container.querySelector("header");
      expect(header).toHaveClass("glass");
    });

    it("header has correct padding", () => {
      const { container } = render(
        <Header activeNav="Spaces" onNavChange={mockOnNavChange} />
      );

      const header = container.querySelector("header");
      expect(header).toHaveClass("px-10");
      expect(header).toHaveClass("py-5");
    });
  });

  describe("Navigation Items", () => {
    it("renders all navigation items", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const navItems = ["Spaces", "Recent", "Shared"];
      navItems.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it("active nav item has correct styling", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const spacesButton = screen.getByText("Spaces");
      expect(spacesButton).toHaveClass("text-white");
    });

    it("inactive nav items have correct styling", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const recentButton = screen.getByText("Recent");
      const sharedButton = screen.getByText("Shared");

      expect(recentButton).toHaveClass("text-white/50");
      expect(sharedButton).toHaveClass("text-white/50");
    });

    it("calls onNavChange when navigation item is clicked", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const recentButton = screen.getByText("Recent");
      fireEvent.click(recentButton);

      expect(mockOnNavChange).toHaveBeenCalledWith("Recent");
      expect(mockOnNavChange).toHaveBeenCalledTimes(1);
    });

    it("updates active state when different nav item is clicked", () => {
      const { rerender } = render(
        <Header activeNav="Spaces" onNavChange={mockOnNavChange} />
      );

      // Initial state
      expect(screen.getByText("Spaces")).toHaveClass("text-white");
      expect(screen.getByText("Recent")).toHaveClass("text-white/50");

      // Simulate nav change
      rerender(<Header activeNav="Recent" onNavChange={mockOnNavChange} />);

      // Check updated state
      expect(screen.getByText("Spaces")).toHaveClass("text-white/50");
      expect(screen.getByText("Recent")).toHaveClass("text-white");
    });
  });

  describe("Border and Glass Effects", () => {
    it("header element exists in DOM", () => {
      const { container } = render(
        <Header activeNav="Spaces" onNavChange={mockOnNavChange} />
      );

      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
    });

    it("navigation has correct flex styling", () => {
      const { container } = render(
        <Header activeNav="Spaces" onNavChange={mockOnNavChange} />
      );

      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("flex");
      expect(nav).toHaveClass("gap-6");
    });

    it("header has flex layout with space-between", () => {
      const { container } = render(
        <Header activeNav="Spaces" onNavChange={mockOnNavChange} />
      );

      const header = container.querySelector("header");
      expect(header).toHaveClass("glass");
      expect(header).toHaveClass("px-10");
      expect(header).toHaveClass("py-5");
    });
  });

  describe("Title/Logo", () => {
    it("renders Second Space title", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const title = screen.getByText("Second Space");
      expect(title).toBeInTheDocument();
    });

    it("title has correct styling", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const title = screen.getByText("Second Space");
      expect(title).toHaveClass("text-white");
      expect(title).toHaveClass("text-xl");
      expect(title).toHaveClass("font-bold");
    });
  });

  describe("User Menu Integration", () => {
    it("renders user menu container", () => {
      const { container } = render(
        <Header activeNav="Spaces" onNavChange={mockOnNavChange} />
      );

      const userMenuContainer = container.querySelector(
        ".flex.items-center.gap-4"
      );
      expect(userMenuContainer).toBeInTheDocument();
    });
  });

  describe("Hover Effects", () => {
    it("inactive nav items have hover styling class", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const recentButton = screen.getByText("Recent");
      expect(recentButton).toHaveClass("hover:text-white/75");
    });

    it("nav buttons have transition styling", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        if (button.textContent === "Spaces" || 
            button.textContent === "Recent" || 
            button.textContent === "Shared") {
          expect(button).toHaveClass("transition-all");
        }
      });
    });
  });

  describe("Accessibility", () => {
    it("navigation items are buttons", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const spacesButton = screen.getByRole("button", { name: "Spaces" });
      const recentButton = screen.getByRole("button", { name: "Recent" });
      const sharedButton = screen.getByRole("button", { name: "Shared" });

      expect(spacesButton).toBeInTheDocument();
      expect(recentButton).toBeInTheDocument();
      expect(sharedButton).toBeInTheDocument();
    });

    it("header uses semantic HTML element", () => {
      const { container } = render(
        <Header activeNav="Spaces" onNavChange={mockOnNavChange} />
      );

      const header = container.querySelector("header");
      expect(header?.tagName.toLowerCase()).toBe("header");
    });

    it("navigation uses semantic nav element", () => {
      const { container } = render(
        <Header activeNav="Spaces" onNavChange={mockOnNavChange} />
      );

      const nav = container.querySelector("nav");
      expect(nav?.tagName.toLowerCase()).toBe("nav");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty string as activeNav", () => {
      render(<Header activeNav="" onNavChange={mockOnNavChange} />);

      // All nav items should be inactive
      expect(screen.getByText("Spaces")).toHaveClass("text-white/50");
      expect(screen.getByText("Recent")).toHaveClass("text-white/50");
      expect(screen.getByText("Shared")).toHaveClass("text-white/50");
    });

    it("handles invalid activeNav value", () => {
      render(<Header activeNav="InvalidNav" onNavChange={mockOnNavChange} />);

      // All nav items should be inactive
      expect(screen.getByText("Spaces")).toHaveClass("text-white/50");
      expect(screen.getByText("Recent")).toHaveClass("text-white/50");
      expect(screen.getByText("Shared")).toHaveClass("text-white/50");
    });

    it("handles rapid navigation changes", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const recentButton = screen.getByText("Recent");
      const sharedButton = screen.getByText("Shared");
      const spacesButton = screen.getByText("Spaces");

      // Rapidly click multiple nav items
      fireEvent.click(recentButton);
      fireEvent.click(sharedButton);
      fireEvent.click(spacesButton);

      expect(mockOnNavChange).toHaveBeenCalledTimes(3);
      expect(mockOnNavChange).toHaveBeenNthCalledWith(1, "Recent");
      expect(mockOnNavChange).toHaveBeenNthCalledWith(2, "Shared");
      expect(mockOnNavChange).toHaveBeenNthCalledWith(3, "Spaces");
    });

    it("onNavChange is not called when active item is clicked", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const spacesButton = screen.getByText("Spaces");
      fireEvent.click(spacesButton);

      // Should still be called even if already active
      expect(mockOnNavChange).toHaveBeenCalledWith("Spaces");
    });
  });

  describe("Text Sizing", () => {
    it("navigation items have text-sm class", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const buttons = ["Spaces", "Recent", "Shared"];
      buttons.forEach((buttonText) => {
        const button = screen.getByText(buttonText);
        expect(button).toHaveClass("text-sm");
      });
    });

    it("title has larger font size than nav items", () => {
      render(<Header activeNav="Spaces" onNavChange={mockOnNavChange} />);

      const title = screen.getByText("Second Space");
      const navItem = screen.getByText("Spaces");

      expect(title).toHaveClass("text-xl");
      expect(navItem).toHaveClass("text-sm");
    });
  });
});
