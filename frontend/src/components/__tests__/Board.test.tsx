import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Board from '../frontend/src/components/Board';

describe('Board Component', () => {
  it('renders without crashing', () => {
    render(<Board />);
    expect(screen.getByText('Second Space')).toBeInTheDocument();
  });

  it('displays the Second Space card', () => {
    render(<Board />);
    expect(screen.getByText('Second Space')).toBeInTheDocument();
    expect(screen.getByText('Collaborative workspace for creativity and productivity.')).toBeInTheDocument();
  });

  it('displays the Ideas Board card', () => {
    render(<Board />);
    expect(screen.getByText('Ideas Board')).toBeInTheDocument();
    expect(screen.getByText('Capture and organize your creative sparks in one place.')).toBeInTheDocument();
  });

  it('renders GlassCard components', () => {
    const { container } = render(<Board />);
    const cards = container.querySelectorAll('.bg-card');
    expect(cards.length).toBeGreaterThan(0);
  });
});
