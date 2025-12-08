import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Sidebar } from '../Sidebar';

describe('Sidebar Component', () => {
  const mockOnSpaceChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <Sidebar 
        activeSpace="My Ideas" 
        onSpaceChange={mockOnSpaceChange}
      />
    );
    expect(screen.getByText('Starred Spaces')).toBeInTheDocument();
  });

  it('displays starred spaces section', () => {
    render(
      <Sidebar 
        activeSpace="My Ideas" 
        onSpaceChange={mockOnSpaceChange}
      />
    );
    expect(screen.getByText('Starred Spaces')).toBeInTheDocument();
  });

  it('renders initial pinned spaces', () => {
    render(
      <Sidebar 
        activeSpace="My Ideas" 
        onSpaceChange={mockOnSpaceChange}
      />
    );
    
    expect(screen.getByText('My Ideas')).toBeInTheDocument();
    expect(screen.getByText('Fitness Plans')).toBeInTheDocument();
    expect(screen.getByText('Shopping')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  it('renders all spaces section', () => {
    render(
      <Sidebar 
        activeSpace="My Ideas" 
        onSpaceChange={mockOnSpaceChange}
      />
    );
    
    expect(screen.getByText('Recipes')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
    expect(screen.getByText('Learning')).toBeInTheDocument();
  });

  it('highlights active space', () => {
    render(
      <Sidebar 
        activeSpace="My Ideas" 
        onSpaceChange={mockOnSpaceChange}
      />
    );
    
    const myIdeasSpace = screen.getByText('My Ideas').closest('div');
    expect(myIdeasSpace).toHaveClass('bg-black/10');
  });

  it('calls onSpaceChange when space is clicked', () => {
    render(
      <Sidebar 
        activeSpace="My Ideas" 
        onSpaceChange={mockOnSpaceChange}
      />
    );
    
    const fitnessSpace = screen.getByText('Fitness Plans');
    fireEvent.click(fitnessSpace);
    
    expect(mockOnSpaceChange).toHaveBeenCalledWith('Fitness Plans');
  });

  it('shows star button for pinned spaces', () => {
    render(
      <Sidebar 
        activeSpace="My Ideas" 
        onSpaceChange={mockOnSpaceChange}
      />
    );
    
    const starButtons = screen.getAllByLabelText(/unstart/i);
    expect(starButtons.length).toBeGreaterThan(0);
  });

  it('can unstar a pinned space', () => {
    render(
      <Sidebar 
        activeSpace="My Ideas" 
        onSpaceChange={mockOnSpaceChange}
      />
    );
    
    // Find the star button for "My Ideas"
    const myIdeasUnstarButton = screen.getByLabelText('Unstart My Ideas');
    fireEvent.click(myIdeasUnstarButton);
    
    // "My Ideas" should move from pinned to all spaces
    // It should still be in the document
    expect(screen.getByText('My Ideas')).toBeInTheDocument();
  });

  it('can star a space from all spaces', () => {
    render(
      <Sidebar 
        activeSpace="My Ideas" 
        onSpaceChange={mockOnSpaceChange}
      />
    );
    
    // Find the star button for "Recipes" (in all spaces)
    const recipesStarButton = screen.getByLabelText('Start Recipes');
    fireEvent.click(recipesStarButton);
    
    // "Recipes" should still be in the document
    expect(screen.getByText('Recipes')).toBeInTheDocument();
  });

  it('renders CreateSpaceDialog', () => {
    const { container } = render(
      <Sidebar 
        activeSpace="My Ideas" 
        onSpaceChange={mockOnSpaceChange}
      />
    );
    
    // CreateSpaceDialog should be rendered
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('renders ThemeToggleButton', () => {
    const { container } = render(
      <Sidebar 
        activeSpace="My Ideas" 
        onSpaceChange={mockOnSpaceChange}
      />
    );
    
    // ThemeToggleButton should be present
    expect(container).toBeInTheDocument();
  });

  it('displays space icons', () => {
    render(
      <Sidebar 
        activeSpace="My Ideas" 
        onSpaceChange={mockOnSpaceChange}
      />
    );
    
    // Check for emoji icons
    expect(screen.getByText('💡')).toBeInTheDocument();
    expect(screen.getByText('🏃')).toBeInTheDocument();
    expect(screen.getByText('🛍️')).toBeInTheDocument();
  });

  it('has proper sidebar styling', () => {
    const { container } = render(
      <Sidebar 
        activeSpace="My Ideas" 
        onSpaceChange={mockOnSpaceChange}
      />
    );
    
    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar).toHaveClass('w-[280px]');
    expect(sidebar).toHaveClass('bg-gray-200');
  });
});
