import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BottomMenuBar } from '../BottomMenuBar';

describe('BottomMenuBar Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<BottomMenuBar />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders three action buttons', () => {
    const { container } = render(<BottomMenuBar />);
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(3);
  });

  it('has fixed positioning at bottom right', () => {
    const { container } = render(<BottomMenuBar />);
    const menuBar = container.firstChild as HTMLElement;
    expect(menuBar).toHaveClass('fixed');
    expect(menuBar).toHaveClass('bottom-8');
    expect(menuBar).toHaveClass('right-8');
  });

  it('renders edit button with yellow color', () => {
    const { container } = render(<BottomMenuBar />);
    const editButton = container.querySelector('button');
    expect(editButton).toHaveClass('text-yellow-400');
  });

  it('all buttons are interactive', () => {
    const { container } = render(<BottomMenuBar />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button).toBeEnabled();
    });
  });
});
