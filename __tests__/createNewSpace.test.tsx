import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateSpaceDialog } from '../frontend/src/components/CreateSpaceDialog';

// Mock ReactDOM.createPortal to render in place for testing
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('CreateSpaceDialog Component - Comprehensive Tests', () => {
  const mockOnCreateSpace = vi.fn();
  const mockOnOpenChange = vi.fn();
  const mockAlert = vi.fn();

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Mock window.alert
    window.alert = mockAlert;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test Suite 1: UI Rendering and Initial State
   */
  describe('UI Rendering and Initial State', () => {
    /**
     * Test Case 1.1: Component renders with "+" button
     * Expected: The "+" button should be visible
     */
    it('should render the "New Space" button initially', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      const newSpaceButton = screen.getByLabelText('Create new space');
      expect(newSpaceButton).toBeInTheDocument();
      expect(newSpaceButton).toHaveTextContent('➕');
    });

    /**
     * Test Case 1.2: Dialog opens when "+" button is clicked
     * Expected: The form should appear with all fields
     */
    it('should open the dialog when "New Space" button is clicked', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      const newSpaceButton = screen.getByLabelText('Create new space');
      fireEvent.click(newSpaceButton);
      
      expect(screen.getByText('Create a space to organize your content')).toBeInTheDocument();
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Icon/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });

    /**
     * Test Case 1.3: Dialog shows "✕" button when open
     * Expected: The "✕" button should replace "+" button
     */
    it('should show "Close" button when dialog is open', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      const newSpaceButton = screen.getByLabelText('Create new space');
      fireEvent.click(newSpaceButton);
      
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
      expect(screen.queryByLabelText('Create new space')).not.toBeInTheDocument();
    });

    /**
     * Test Case 1.4: Dialog closes when "✕" button is clicked
     * Expected: The dialog should close and show "+" button again
     */
    it('should close the dialog when "Close" button is clicked', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      fireEvent.click(screen.getByLabelText('Close dialog'));
      
      expect(screen.queryByText('Create a space to organize your content')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Create new space')).toBeInTheDocument();
    });

    /**
     * Test Case 1.5: Dialog closes when backdrop is clicked
     * Expected: Clicking the backdrop should close the dialog
     */
    it('should close the dialog when backdrop is clicked', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/30');
      expect(backdrop).toBeInTheDocument();
      
      fireEvent.click(backdrop!);
      
      expect(screen.queryByText('Create a space to organize your content')).not.toBeInTheDocument();
    });

    /**
     * Test Case 1.6: Dialog closes when Cancel button is clicked
     * Expected: The dialog should close without creating a space
     */
    it('should close the dialog when Cancel button is clicked', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      fireEvent.click(screen.getByText('Cancel'));
      
      expect(screen.queryByText('Create a space to organize your content')).not.toBeInTheDocument();
      expect(mockOnCreateSpace).not.toHaveBeenCalled();
    });
  });

  /**
   * Test Suite 2: Space Name Validation
   */
  describe('Space Name Validation', () => {
    /**
     * Test Case 2.1: Space name is required
     * Expected: Alert shown when trying to submit empty space name
     */
    it('should show alert when space name is empty', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      const form = nameInput.closest('form')!;
      
      // Manually trigger form submission to bypass HTML5 validation
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      Object.defineProperty(submitEvent, 'target', { value: form, enumerable: true });
      form.dispatchEvent(submitEvent);
      
      expect(mockAlert).toHaveBeenCalledWith('Please enter a space name');
      expect(mockOnCreateSpace).not.toHaveBeenCalled();
    });

    /**
     * Test Case 2.2: Space name with only whitespace is invalid
     * Expected: Alert shown when trying to submit whitespace-only name
     */
    it('should show alert when space name contains only whitespace', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: '   ' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockAlert).toHaveBeenCalledWith('Please enter a space name');
      expect(mockOnCreateSpace).not.toHaveBeenCalled();
    });

    /**
     * Test Case 2.3: Valid space name (minimum length)
     * Expected: Space created successfully with 3 character name
     */
    it('should accept valid space name with minimum length (3 characters)', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'ABC' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'ABC',
        icon: '📁',
        description: '',
      });
    });

    /**
     * Test Case 2.4: Valid space name (maximum length)
     * Expected: Space created successfully with 50 character name
     */
    it('should accept valid space name with maximum length (50 characters)', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const longName = 'A'.repeat(50);
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: longName } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: longName,
        icon: '📁',
        description: '',
      });
    });

    /**
     * Test Case 2.5: Space name with leading/trailing whitespace is trimmed
     * Expected: Whitespace should be trimmed before creating space
     */
    it('should trim leading and trailing whitespace from space name', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: '  My Space  ' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'My Space',
        icon: '📁',
        description: '',
      });
    });

    /**
     * Test Case 2.6: Space name with special characters
     * Expected: Letters, numbers, spaces, hyphens, underscores should be accepted
     */
    it('should accept space name with allowed special characters', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'My-Space_123' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'My-Space_123',
        icon: '📁',
        description: '',
      });
    });
  });

  /**
   * Test Suite 3: Icon Field Functionality
   */
  describe('Icon Field Functionality', () => {
    /**
     * Test Case 3.1: Icon is optional
     * Expected: Default icon (📁) should be used if no icon provided
     */
    it('should use default icon (📁) when icon field is empty', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'My Space' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'My Space',
        icon: '📁',
        description: '',
      });
    });

    /**
     * Test Case 3.2: Custom icon can be provided
     * Expected: Custom icon should be used when provided
     */
    it('should accept custom icon when provided', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      const iconInput = screen.getByLabelText(/Icon/i);
      
      fireEvent.change(nameInput, { target: { value: 'Fitness' } });
      fireEvent.change(iconInput, { target: { value: '🏃' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'Fitness',
        icon: '🏃',
        description: '',
      });
    });

    /**
     * Test Case 3.3: Icon with whitespace is trimmed
     * Expected: Whitespace should be trimmed from icon
     */
    it('should trim whitespace from icon', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      const iconInput = screen.getByLabelText(/Icon/i);
      
      fireEvent.change(nameInput, { target: { value: 'My Space' } });
      fireEvent.change(iconInput, { target: { value: '  🎯  ' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'My Space',
        icon: '🎯',
        description: '',
      });
    });

    /**
     * Test Case 3.4: Icon field has maxLength of 2
     * Expected: Icon input should have maxLength attribute
     */
    it('should have maxLength of 2 for icon field', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const iconInput = screen.getByLabelText(/Icon/i) as HTMLInputElement;
      expect(iconInput).toHaveAttribute('maxLength', '2');
    });
  });

  /**
   * Test Suite 4: Description Field Functionality
   */
  describe('Description Field Functionality', () => {
    /**
     * Test Case 4.1: Description is optional
     * Expected: Empty description should be accepted
     */
    it('should accept empty description', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'My Space' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'My Space',
        icon: '📁',
        description: '',
      });
    });

    /**
     * Test Case 4.2: Description can be provided
     * Expected: Custom description should be saved
     */
    it('should accept custom description when provided', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      const descriptionInput = screen.getByLabelText(/Description/i);
      
      fireEvent.change(nameInput, { target: { value: 'Fitness Plans' } });
      fireEvent.change(descriptionInput, { 
        target: { value: 'Track my workout routines and progress' } 
      });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'Fitness Plans',
        icon: '📁',
        description: 'Track my workout routines and progress',
      });
    });

    /**
     * Test Case 4.3: Description with whitespace is trimmed
     * Expected: Leading and trailing whitespace should be trimmed
     */
    it('should trim leading and trailing whitespace from description', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      const descriptionInput = screen.getByLabelText(/Description/i);
      
      fireEvent.change(nameInput, { target: { value: 'My Space' } });
      fireEvent.change(descriptionInput, { 
        target: { value: '  My description  ' } 
      });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'My Space',
        icon: '📁',
        description: 'My description',
      });
    });

    /**
     * Test Case 4.4: Long description (200 characters)
     * Expected: Description with 200 characters should be accepted
     */
    it('should accept description with maximum length (200 characters)', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const longDescription = 'A'.repeat(200);
      const nameInput = screen.getByLabelText(/Name/i);
      const descriptionInput = screen.getByLabelText(/Description/i);
      
      fireEvent.change(nameInput, { target: { value: 'My Space' } });
      fireEvent.change(descriptionInput, { target: { value: longDescription } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'My Space',
        icon: '📁',
        description: longDescription,
      });
    });
  });

  /**
   * Test Suite 5: Form Submission and Reset
   */
  describe('Form Submission and Reset', () => {
    /**
     * Test Case 5.1: Successful space creation
     * Expected: onCreateSpace callback should be called with correct data
     */
    it('should call onCreateSpace with correct data on successful submission', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      const iconInput = screen.getByLabelText(/Icon/i);
      const descriptionInput = screen.getByLabelText(/Description/i);
      
      fireEvent.change(nameInput, { target: { value: 'Work Projects' } });
      fireEvent.change(iconInput, { target: { value: '💼' } });
      fireEvent.change(descriptionInput, { 
        target: { value: 'All my work-related projects' } 
      });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'Work Projects',
        icon: '💼',
        description: 'All my work-related projects',
      });
    });

    /**
     * Test Case 5.2: Form resets after successful submission
     * Expected: All form fields should be cleared after submission
     */
    it('should reset form fields after successful submission', async () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      const iconInput = screen.getByLabelText(/Icon/i) as HTMLInputElement;
      const descriptionInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
      
      fireEvent.change(nameInput, { target: { value: 'Test Space' } });
      fireEvent.change(iconInput, { target: { value: '🎯' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      // Wait for the dialog to close
      await waitFor(() => {
        expect(screen.queryByText('Create a space to organize your content')).not.toBeInTheDocument();
      });
      
      // Reopen the dialog
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      // Wait for dialog to open and then check values
      await waitFor(() => {
        const newNameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
        const newIconInput = screen.getByLabelText(/Icon/i) as HTMLInputElement;
        const newDescriptionInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
        
        expect(newNameInput.value).toBe('');
        expect(newIconInput.value).toBe('');
        expect(newDescriptionInput.value).toBe('');
      });
    });

    /**
     * Test Case 5.3: Dialog closes after successful submission
     * Expected: Dialog should close automatically after creating space
     */
    it('should close dialog after successful submission', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'My Space' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(screen.queryByText('Create a space to organize your content')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Create new space')).toBeInTheDocument();
    });

    /**
     * Test Case 5.4: onOpenChange callback is called
     * Expected: onOpenChange should be called when dialog opens/closes
     */
    it('should call onOpenChange callback when dialog state changes', () => {
      render(
        <CreateSpaceDialog 
          onCreateSpace={mockOnCreateSpace} 
          onOpenChange={mockOnOpenChange}
        />
      );
      
      // Open dialog
      fireEvent.click(screen.getByLabelText('Create new space'));
      expect(mockOnOpenChange).toHaveBeenCalledWith(true);
      
      // Close dialog
      fireEvent.click(screen.getByLabelText('Close dialog'));
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  /**
   * Test Suite 6: Async Operations
   */
  describe('Async Operations', () => {
    /**
     * Test Case 6.1: Handles async onCreateSpace callback
     * Expected: Should work with async callback functions
     */
    it('should handle async onCreateSpace callback', async () => {
      const asyncMock = vi.fn().mockResolvedValue(undefined);
      
      render(<CreateSpaceDialog onCreateSpace={asyncMock} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Async Space' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(asyncMock).toHaveBeenCalledWith({
          title: 'Async Space',
          icon: '📁',
          description: '',
        });
      });
    });

    /**
     * Test Case 6.2: Dialog closes even with async callback
     * Expected: Dialog should close after async operation
     */
    it('should close dialog after async operation completes', async () => {
      const asyncMock = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<CreateSpaceDialog onCreateSpace={asyncMock} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Async Space' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      // Dialog should close immediately (not waiting for async)
      expect(screen.queryByText('Create a space to organize your content')).not.toBeInTheDocument();
    });
  });

  /**
   * Test Suite 7: Edge Cases and Error Handling
   */
  describe('Edge Cases and Error Handling', () => {
    /**
     * Test Case 7.1: Multiple rapid clicks on submit
     * Expected: Should only call onCreateSpace once
     */
    it('should handle multiple rapid submit clicks', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Test Space' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      fireEvent.click(createButton);
      fireEvent.click(createButton);
      
      // Should only be called once since dialog closes
      expect(mockOnCreateSpace).toHaveBeenCalledTimes(1);
    });

    /**
     * Test Case 7.2: Form submission with Enter key
     * Expected: Should submit form when Enter is pressed
     */
    it('should submit form when Enter key is pressed in input field', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Enter Key Test' } });
      
      fireEvent.submit(nameInput.closest('form')!);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'Enter Key Test',
        icon: '📁',
        description: '',
      });
    });

    /**
     * Test Case 7.3: Special characters in all fields
     * Expected: Should handle special characters correctly
     */
    it('should handle special characters in all fields', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i);
      const iconInput = screen.getByLabelText(/Icon/i);
      const descriptionInput = screen.getByLabelText(/Description/i);
      
      fireEvent.change(nameInput, { target: { value: 'Test!@#$%^&*()' } });
      fireEvent.change(iconInput, { target: { value: '🎉' } });
      fireEvent.change(descriptionInput, { 
        target: { value: 'Special chars: <>&"\'`' } 
      });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'Test!@#$%^&*()',
        icon: '🎉',
        description: 'Special chars: <>&"\'`',
      });
    });

    /**
     * Test Case 7.4: Empty string vs whitespace handling
     * Expected: Both should be treated as empty
     */
    it('should treat empty string and whitespace the same', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      // Test with empty icon
      const nameInput = screen.getByLabelText(/Name/i);
      const iconInput = screen.getByLabelText(/Icon/i);
      
      fireEvent.change(nameInput, { target: { value: 'Test' } });
      fireEvent.change(iconInput, { target: { value: '   ' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(mockOnCreateSpace).toHaveBeenCalledWith({
        title: 'Test',
        icon: '📁', // Should use default since whitespace is trimmed
        description: '',
      });
    });
  });

  /**
   * Test Suite 8: Accessibility
   */
  describe('Accessibility', () => {
    /**
     * Test Case 8.1: Form has proper labels
     * Expected: All form fields should have associated labels
     */
    it('should have proper labels for all form fields', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Icon/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });

    /**
     * Test Case 8.2: Required field is marked
     * Expected: Name field should be marked as required
     */
    it('should mark Name field as required', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      expect(nameInput).toHaveAttribute('required');
    });

    /**
     * Test Case 8.3: Buttons have proper text
     * Expected: All buttons should have descriptive text or aria-labels
     */
    it('should have descriptive button text', () => {
      render(<CreateSpaceDialog onCreateSpace={mockOnCreateSpace} />);
      
      fireEvent.click(screen.getByLabelText('Create new space'));
      
      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });
  });
});
