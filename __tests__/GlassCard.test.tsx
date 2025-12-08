import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GlassCard } from '../frontend/src/components/GlassCard';

describe('GlassCard Component', () => {
  it('renders without crashing', () => {
    render(<GlassCard>Test Content</GlassCard>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <GlassCard>
        <h2>Title</h2>
        <p>Description</p>
      </GlassCard>
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('applies glass card styling', () => {
    const { container } = render(<GlassCard>Content</GlassCard>);
    const card = container.firstChild as HTMLElement;
    
    expect(card).toHaveClass('bg-card');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('border-border');
  });

  it('has hover effects', () => {
    const { container } = render(<GlassCard>Content</GlassCard>);
    const card = container.firstChild as HTMLElement;
    
    expect(card).toHaveClass('hover:shadow-xl');
    expect(card).toHaveClass('hover:scale-[1.02]');
  });

  it('has proper spacing and layout', () => {
    const { container } = render(<GlassCard>Content</GlassCard>);
    const card = container.firstChild as HTMLElement;
    
    expect(card).toHaveClass('p-4');
    expect(card).toHaveClass('rounded-x1');
  });

  it('renders multiple children', () => {
    render(
      <GlassCard>
        <div>First child</div>
        <div>Second child</div>
        <div>Third child</div>
      </GlassCard>
    );
    
    expect(screen.getByText('First child')).toBeInTheDocument();
    expect(screen.getByText('Second child')).toBeInTheDocument();
    expect(screen.getByText('Third child')).toBeInTheDocument();
  });

  it('can render complex nested content', () => {
    render(
      <GlassCard>
        <article>
          <header>
            <h1>Article Title</h1>
          </header>
          <section>
            <p>Article content</p>
          </section>
        </article>
      </GlassCard>
    );
    
    expect(screen.getByText('Article Title')).toBeInTheDocument();
    expect(screen.getByText('Article content')).toBeInTheDocument();
  });
});
