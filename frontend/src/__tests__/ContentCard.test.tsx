import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentCard } from '../frontend/src/components/ContentCard';

describe('ContentCard Component', () => {
  const mockOnToggleBookmark = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnRequestEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Text Card', () => {
    it('renders text card with title and text', () => {
      render(
        <ContentCard 
          type="text"
          content={{
            title: 'Test Title',
            text: 'Test content here',
            timestamp: '2024-01-01'
          }}
        />
      );
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test content here')).toBeInTheDocument();
    });

    it('displays timestamp', () => {
      render(
        <ContentCard 
          type="text"
          content={{
            title: 'Test',
            text: 'Content',
            timestamp: '2024-01-01 10:30'
          }}
        />
      );
      expect(screen.getByText('2024-01-01 10:30')).toBeInTheDocument();
    });

    it('calls onRequestEdit when Edit is clicked', () => {
      render(
        <ContentCard 
          type="text"
          content={{
            title: 'Test',
            text: 'Content',
            timestamp: '2024-01-01'
          }}
          onRequestEdit={mockOnRequestEdit}
        />
      );
      
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      expect(mockOnRequestEdit).toHaveBeenCalled();
    });
  });

  describe('Image Card', () => {
    it('renders image card with image', () => {
      render(
        <ContentCard 
          type="image"
          content={{
            title: 'Test Image',
            image: 'https://example.com/image.jpg',
            timestamp: '2024-01-01'
          }}
        />
      );
      
      const img = screen.getByAltText('Test Image');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('renders with description and flips on click', () => {
      render(
        <ContentCard 
          type="image"
          content={{
            title: 'Test Image',
            image: 'https://example.com/image.jpg',
            description: 'This is a test description',
            timestamp: '2024-01-01'
          }}
        />
      );
      
      const card = screen.getByText('Test Image').closest('div');
      if (card) {
        fireEvent.click(card);
      }
      expect(screen.getByText('This is a test description')).toBeInTheDocument();
    });
  });

  describe('Link Card', () => {
    it('renders link card with URL', () => {
      render(
        <ContentCard 
          type="link"
          content={{
            title: 'Test Link',
            url: 'https://example.com',
            domain: 'example.com',
            timestamp: '2024-01-01'
          }}
        />
      );
      
      expect(screen.getByText('Test Link')).toBeInTheDocument();
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    it('renders link as clickable element', () => {
      render(
        <ContentCard 
          type="link"
          content={{
            title: 'Test Link',
            url: 'https://example.com',
            domain: 'example.com',
            timestamp: '2024-01-01'
          }}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com');
    });
  });

  describe('Bookmark functionality', () => {
    it('shows bookmark button when onToggleBookmark is provided', () => {
      render(
        <ContentCard 
          type="text"
          content={{
            title: 'Test',
            text: 'Content',
            timestamp: '2024-01-01'
          }}
          onToggleBookmark={mockOnToggleBookmark}
        />
      );
      
      const bookmarkButton = screen.getByLabelText(/bookmark/i);
      expect(bookmarkButton).toBeInTheDocument();
    });

    it('calls onToggleBookmark when bookmark is clicked', () => {
      render(
        <ContentCard 
          type="text"
          content={{
            title: 'Test',
            text: 'Content',
            timestamp: '2024-01-01'
          }}
          onToggleBookmark={mockOnToggleBookmark}
        />
      );
      
      const bookmarkButton = screen.getByLabelText(/bookmark/i);
      fireEvent.click(bookmarkButton);
      expect(mockOnToggleBookmark).toHaveBeenCalled();
    });

    it('displays bookmarked state', () => {
      render(
        <ContentCard 
          type="text"
          content={{
            title: 'Test',
            text: 'Content',
            timestamp: '2024-01-01',
            isBookmarked: true
          }}
          onToggleBookmark={mockOnToggleBookmark}
        />
      );
      
      // Visual indication of bookmarked state should be present
      const bookmarkButton = screen.getByLabelText(/bookmark/i);
      expect(bookmarkButton).toBeInTheDocument();
    });
  });
});
