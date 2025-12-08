import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CardEditModal } from '../CardEditModal';

describe('CardEditModal Component', () => {
  const mockOnSave = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open is true', () => {
    render(
      <CardEditModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        type="text" 
        onSave={mockOnSave} 
      />
    );
    expect(screen.getByText('Edit Text')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    const { container } = render(
      <CardEditModal 
        open={false} 
        onOpenChange={mockOnOpenChange} 
        type="text" 
        onSave={mockOnSave} 
      />
    );
    expect(screen.queryByText('Edit Text')).not.toBeInTheDocument();
  });

  it('renders correct title for image type', () => {
    render(
      <CardEditModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        type="image" 
        onSave={mockOnSave} 
      />
    );
    expect(screen.getByText('Edit Image')).toBeInTheDocument();
  });

  it('renders correct title for link type', () => {
    render(
      <CardEditModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        type="link" 
        onSave={mockOnSave} 
      />
    );
    expect(screen.getByText('Edit Link')).toBeInTheDocument();
  });

  it('displays title input field', () => {
    render(
      <CardEditModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        type="text" 
        onSave={mockOnSave} 
      />
    );
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('displays text textarea for text type', () => {
    render(
      <CardEditModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        type="text" 
        onSave={mockOnSave} 
      />
    );
    expect(screen.getByLabelText('Text')).toBeInTheDocument();
  });

  it('displays image URL input for image type', () => {
    render(
      <CardEditModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        type="image" 
        onSave={mockOnSave} 
      />
    );
    expect(screen.getByLabelText('Image URL')).toBeInTheDocument();
  });

  it('displays target URL input for link type', () => {
    render(
      <CardEditModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        type="link" 
        onSave={mockOnSave} 
      />
    );
    expect(screen.getByLabelText('Target URL')).toBeInTheDocument();
  });

  it('pre-fills form with initial values', () => {
    const initial = { title: 'Test Title', text: 'Test Text' };
    render(
      <CardEditModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        type="text" 
        initial={initial}
        onSave={mockOnSave} 
      />
    );
    expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Text')).toBeInTheDocument();
  });

  it('calls onSave with form data when Save is clicked', async () => {
    render(
      <CardEditModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        type="text" 
        onSave={mockOnSave} 
      />
    );

    const titleInput = screen.getByLabelText('Title');
    const textInput = screen.getByLabelText('Text');
    
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    fireEvent.change(textInput, { target: { value: 'New Text' } });
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'New Title',
        text: 'New Text'
      });
    });
  });

  it('calls onOpenChange when Cancel is clicked', () => {
    render(
      <CardEditModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        type="text" 
        onSave={mockOnSave} 
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes modal after saving', async () => {
    render(
      <CardEditModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        type="text" 
        onSave={mockOnSave} 
      />
    );

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
