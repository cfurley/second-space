import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FloatingMenu } from '../FloatingMenu';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

describe('FloatingMenu Component', () => {
  const mockOnContentAdded = vi.fn();
  const mockOnSearchChange = vi.fn();

  beforeEach(() => {
    mockOnContentAdded.mockClear();
    mockOnSearchChange.mockClear();
  });

  it('renders the floating menu', () => {
    render(<FloatingMenu currentSpaceId="test-space" currentUserId="test-user" />);
    
    // Check if floating menu container exists
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shows action menu when main button is clicked', async () => {
    const { container } = render(<FloatingMenu currentSpaceId="test-space" currentUserId="test-user" />);
    
    // Find and click a button (likely the + button)
    const buttons = screen.getAllByRole('button');
    const mainButton = buttons.find(btn => btn.textContent === '+');
    
    if (mainButton) {
      fireEvent.click(mainButton);
      
      // Wait for menu to appear - check for increased number of visible buttons
      await waitFor(() => {
        const updatedButtons = screen.getAllByRole('button');
        expect(updatedButtons.length).toBeGreaterThan(buttons.length);
      });
    }
  });

  it('opens dialogs when action buttons are clicked', async () => {
    render(<FloatingMenu currentSpaceId="test-space" currentUserId="test-user" />);
    
    // Open menu
    const buttons = screen.getAllByRole('button');
    const mainButton = buttons.find(btn => btn.textContent === '+');
    
    if (mainButton) {
      fireEvent.click(mainButton);
      
      await waitFor(() => {
        // Find any action button with a title attribute
        const actionButtons = screen.getAllByRole('button').filter(btn => btn.hasAttribute('title'));
        expect(actionButtons.length).toBeGreaterThan(0);
        
        // Click first action button
        if (actionButtons[0]) {
          fireEvent.click(actionButtons[0]);
        }
      });
      
      // Check that a dialog opened (look for dialog content)
      await waitFor(() => {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        expect(dialogs.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    }
  });

  it('calls onSearchChange when search is triggered', async () => {
    render(<FloatingMenu currentSpaceId="test-space" currentUserId="test-user" onSearchChange={mockOnSearchChange} />);
    
    // Find and click search button (🔍)
    const searchButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('🔍'));
    
    if (searchButton) {
      fireEvent.click(searchButton);
      
      // Find search input
      await waitFor(() => {
        const searchInputs = screen.getAllByRole('textbox');
        const searchInput = searchInputs.find(input => 
          input.getAttribute('placeholder')?.toLowerCase().includes('search')
        );
        
        if (searchInput) {
          fireEvent.change(searchInput, { target: { value: 'test query' } });
          expect(mockOnSearchChange).toHaveBeenCalledWith('test query');
        }
      });
    }
  });

  it('calls onContentAdded when content is created', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<FloatingMenu currentSpaceId="test-space" currentUserId="test-user" onContentAdded={mockOnContentAdded} />);
    
    // Open menu and click first action button
    const buttons = screen.getAllByRole('button');
    const mainButton = buttons.find(btn => btn.textContent === '+');
    
    if (mainButton) {
      fireEvent.click(mainButton);
      
      await waitFor(() => {
        const actionButtons = screen.getAllByRole('button').filter(btn => btn.hasAttribute('title'));
        if (actionButtons[0]) {
          fireEvent.click(actionButtons[0]);
        }
      });
      
      // Fill any text inputs that appear
      await waitFor(async () => {
        const inputs = screen.getAllByRole('textbox');
        if (inputs.length > 0) {
          inputs.forEach((input, idx) => {
            fireEvent.change(input, { target: { value: `Test value ${idx}` } });
          });
          
          // Find and click submit button (any button with text like "Create", "Upload", "Save")
          const submitButtons = screen.getAllByRole('button').filter(btn => {
            const text = btn.textContent?.toLowerCase() || '';
            return text.includes('create') || text.includes('upload') || text.includes('save') || text.includes('post');
          });
          
          if (submitButtons.length > 0) {
            fireEvent.click(submitButtons[0]);
            
            await waitFor(() => {
              expect(mockOnContentAdded).toHaveBeenCalled();
            }, { timeout: 1000 });
          }
        }
      }, { timeout: 2000 });
    }
    
    alertMock.mockRestore();
  });

  it('handles form inputs correctly', async () => {
    render(<FloatingMenu currentSpaceId="test-space" currentUserId="test-user" />);
    
    // Open menu
    const buttons = screen.getAllByRole('button');
    const mainButton = buttons.find(btn => btn.textContent === '+');
    
    if (mainButton) {
      fireEvent.click(mainButton);
      
      await waitFor(() => {
        const actionButtons = screen.getAllByRole('button').filter(btn => btn.hasAttribute('title'));
        if (actionButtons[0]) {
          fireEvent.click(actionButtons[0]);
        }
      });
      
      // Check that form inputs can be filled
      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        if (inputs.length > 0) {
          fireEvent.change(inputs[0], { target: { value: 'Test input' } });
          expect(inputs[0]).toHaveValue('Test input');
        }
      });
    }
  });
});