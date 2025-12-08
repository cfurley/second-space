import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnimatedBackground from '../AnimatedBackground';

describe('AnimatedBackground Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<AnimatedBackground />);
    expect(container).toBeInTheDocument();
  });

  it('renders the background container', () => {
    const { container } = render(<AnimatedBackground />);
    const backgroundDiv = container.firstChild;
    expect(backgroundDiv).toBeInTheDocument();
  });

  it('generates floating icons', () => {
    const { container } = render(<AnimatedBackground />);
    // The component generates 35 floating icons
    const motionDivs = container.querySelectorAll('.absolute');
    expect(motionDivs.length).toBeGreaterThan(0);
  });

  it('applies proper styling classes', () => {
    const { container } = render(<AnimatedBackground />);
    const backgroundDiv = container.firstChild as HTMLElement;
    expect(backgroundDiv).toHaveClass('fixed');
  });
});
