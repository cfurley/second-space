import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FilterBar } from '../FilterBar';

describe('FilterBar Component', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all filter buttons', () => {
    render(
      <FilterBar 
        activeFilter="Recent" 
        onFilterChange={mockOnFilterChange}
      />
    );
    
    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(screen.getByText('Images')).toBeInTheDocument();
    expect(screen.getByText('Links')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('Videos')).toBeInTheDocument();
  });

  it('highlights the active filter', () => {
    render(
      <FilterBar 
        activeFilter="Images" 
        onFilterChange={mockOnFilterChange}
      />
    );
    
    const imagesButton = screen.getByText('Images');
    expect(imagesButton).toHaveClass('bg-gray-900');
  });

  it('applies different styling to inactive filters', () => {
    render(
      <FilterBar 
        activeFilter="Recent" 
        onFilterChange={mockOnFilterChange}
      />
    );
    
    const imagesButton = screen.getByText('Images');
    expect(imagesButton).toHaveClass('bg-white');
    expect(imagesButton).not.toHaveClass('bg-gray-900');
  });

  it('calls onFilterChange when filter is clicked', () => {
    render(
      <FilterBar 
        activeFilter="Recent" 
        onFilterChange={mockOnFilterChange}
      />
    );
    
    const imagesButton = screen.getByText('Images');
    fireEvent.click(imagesButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('Images');
  });

  it('calls onFilterChange with correct filter name', () => {
    render(
      <FilterBar 
        activeFilter="Recent" 
        onFilterChange={mockOnFilterChange}
      />
    );
    
    const linksButton = screen.getByText('Links');
    fireEvent.click(linksButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('Links');
  });

  it('all filter buttons are clickable', () => {
    render(
      <FilterBar 
        activeFilter="Recent" 
        onFilterChange={mockOnFilterChange}
      />
    );
    
    const filters = ['Recent', 'Images', 'Links', 'Text', 'Videos'];
    
    filters.forEach(filter => {
      const button = screen.getByText(filter);
      expect(button.tagName).toBe('BUTTON');
      fireEvent.click(button);
      expect(mockOnFilterChange).toHaveBeenCalledWith(filter);
    });
  });

  it('renders with proper layout styling', () => {
    const { container } = render(
      <FilterBar 
        activeFilter="Recent" 
        onFilterChange={mockOnFilterChange}
      />
    );
    
    const filterContainer = container.firstChild as HTMLElement;
    expect(filterContainer).toHaveClass('flex');
    expect(filterContainer).toHaveClass('gap-3');
  });
});
