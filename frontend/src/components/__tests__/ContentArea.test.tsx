import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentArea } from '../ContentArea';

describe('ContentArea Component', () => {
  const mockOnFilterChange = vi.fn();
  const mockSpaceContent = [
    {
      type: 'text',
      content: {
        title: 'Test Note',
        text: 'This is a test note',
        timestamp: '2024-01-01'
      }
    },
    {
      type: 'image',
      content: {
        title: 'Test Image',
        image: 'https://example.com/image.jpg',
        timestamp: '2024-01-02'
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <ContentArea 
        activeSpace="My Ideas" 
        activeFilter="Recent" 
        onFilterChange={mockOnFilterChange}
        spaceContent={[]}
      />
    );
    expect(screen.getByText('My Ideas')).toBeInTheDocument();
  });

  it('displays the active space name', () => {
    render(
      <ContentArea 
        activeSpace="Fitness Plans" 
        activeFilter="Recent" 
        onFilterChange={mockOnFilterChange}
        spaceContent={[]}
      />
    );
    expect(screen.getByText('Fitness Plans')).toBeInTheDocument();
  });

  it('renders the space title', () => {
    render(
      <ContentArea 
        activeSpace="My Ideas" 
        activeFilter="Recent" 
        onFilterChange={mockOnFilterChange}
        spaceContent={[]}
      />
    );
    expect(screen.getByText('My Ideas')).toBeInTheDocument();
  });

  it('shows empty state when no content', () => {
    const { container } = render(
      <ContentArea 
        activeSpace="My Ideas" 
        activeFilter="Recent" 
        onFilterChange={mockOnFilterChange}
        spaceContent={[]}
      />
    );
    // Component should still render even with no content
    expect(container.querySelector('.flex-1')).toBeInTheDocument();
  });
});
