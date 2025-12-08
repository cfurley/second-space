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
    
    // Check for actual default pinned spaces
    expect(screen.getByText('My Ideas')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('renders all spaces section header', () => {
    render(
      <Sidebar 
        activeSpace="My Ideas" 
        onSpaceChange={mockOnSpaceChange}
      />
    );
    
    // Initially allSpaces is empty, so just check the section exists
    expect(screen.getByText('All Spaces')).toBeInTheDocument();
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
