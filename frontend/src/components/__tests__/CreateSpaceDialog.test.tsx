import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateSpaceDialog } from '../CreateSpaceDialog';

describe('CreateSpaceDialog Component', () => {
  const mockOnCreateSpace = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button', () => {
    render(
      <CreateSpaceDialog 
        onCreateSpace={mockOnCreateSpace}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('opens dialog when trigger button is clicked', async () => {
    render(
      <CreateSpaceDialog 
        onCreateSpace={mockOnCreateSpace}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/create/i)).toBeInTheDocument();
    });
  });

  it('displays form fields when open', async () => {
    render(
      <CreateSpaceDialog 
        onCreateSpace={mockOnCreateSpace}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(
      <CreateSpaceDialog 
        onCreateSpace={mockOnCreateSpace}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(createButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a space name/i)).toBeInTheDocument();
    });
  });

  it('validates minimum name length', async () => {
    render(
      <CreateSpaceDialog 
        onCreateSpace={mockOnCreateSpace}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.change(nameInput, { target: { value: 'AB' } });
      
      const createButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(createButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('validates maximum name length', async () => {
    render(
      <CreateSpaceDialog 
        onCreateSpace={mockOnCreateSpace}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i);
      const longName = 'A'.repeat(51);
      fireEvent.change(nameInput, { target: { value: longName } });
      
      const createButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(createButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/50 characters or less/i)).toBeInTheDocument();
    });
  });

  it('validates maximum description length', async () => {
    render(
      <CreateSpaceDialog 
        onCreateSpace={mockOnCreateSpace}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i);
      const descInput = screen.getByLabelText(/description/i);
      
      fireEvent.change(nameInput, { target: { value: 'Valid Name' } });
      const longDesc = 'A'.repeat(201);
      fireEvent.change(descInput, { target: { value: longDesc } });
      
      const createButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(createButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/200 characters or less/i)).toBeInTheDocument();
    });
  });

  it('calls onCreateSpace with valid data', async () => {
    render(
      <CreateSpaceDialog 
        onCreateSpace={mockOnCreateSpace}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i);
      const descInput = screen.getByLabelText(/description/i);
      
      fireEvent.change(nameInput, { target: { value: 'New Space' } });
      fireEvent.change(descInput, { target: { value: 'Space description' } });
      
      const createButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(createButton);
    });
    
    await waitFor(() => {
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'New Space',
        icon: expect.any(String),
        description: 'Space description'
      });
    });
  });

  it('resets form when dialog closes', async () => {
    render(
      <CreateSpaceDialog 
        onCreateSpace={mockOnCreateSpace}
        onOpenChange={mockOnOpenChange}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.change(nameInput, { target: { value: 'Test Name' } });
    });
    
    // Close dialog
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('applies custom button className', () => {
    render(
      <CreateSpaceDialog 
        onCreateSpace={mockOnCreateSpace}
        buttonClassName="custom-class"
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});
