import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
    const textInput = screen.getByLabelText('Text') as HTMLTextAreaElement;
    
    // Simulate user input by setting value and triggering events properly
    await act(async () => {
      // For controlled components, we need to set the value descriptor and trigger both input and change
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(titleInput, 'New Title');
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        titleInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      if (nativeTextareaValueSetter) {
        nativeTextareaValueSetter.call(textInput, 'New Text');
        textInput.dispatchEvent(new Event('input', { bubbles: true }));
        textInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    const saveButton = screen.getByText('Save');
    
    await act(async () => {
      fireEvent.click(saveButton);
    });

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
