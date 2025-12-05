import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { FloatingMenu } from '../FloatingMenu';

describe('FloatingMenu Search Functionality', () => {
  const mockOnSearchChange = vi.fn();
  const mockOnContentAdded = vi.fn();

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Search Dialog Opening and Closing', () => {
    test('should open search dialog when search button is clicked', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Find and click the floating menu button
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);

      // Find and click the search button (🔍)
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      expect(searchButton).toBeDefined();
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        // Verify dialog opened
        await waitFor(() => {
          expect(screen.getByText('Search Posts')).toBeInTheDocument();
        });
      }
    });

    test('should close search dialog when cancel/close is clicked', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open floating menu
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);

      // Click search button
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(() => {
          expect(screen.getByText('Search Posts')).toBeInTheDocument();
        });

        // Close dialog
        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        await waitFor(() => {
          expect(screen.queryByText('Search Posts')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Search Input Field', () => {
    test('should have search input with correct placeholder', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(() => {
          const searchInput = screen.getByPlaceholderText('Search by title...');
          expect(searchInput).toBeInTheDocument();
        });
      }
    });

    test('should NOT have search icon inside the input field', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(() => {
          const searchInput = screen.getByPlaceholderText('Search by title...');
          const parent = searchInput.parentElement;
          
          // Check that there's no SVG icon as a sibling
          const svgIcons = parent?.querySelectorAll('svg');
          expect(svgIcons?.length || 0).toBe(0);
        });
      }
    });

    test('should auto-focus search input when dialog opens', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(() => {
          const searchInput = screen.getByPlaceholderText('Search by title...');
          expect(searchInput).toHaveFocus();
        });
      }
    });

    test('should update search query as user types', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          const searchInput = screen.getByPlaceholderText('Search by title...') as HTMLInputElement;
          
          fireEvent.change(searchInput, { target: { value: 'test query' } });
          
          expect(searchInput.value).toBe('test query');
          expect(mockOnSearchChange).toHaveBeenCalledWith('test query');
        });
      }
    });
  });

  describe('Helper Text Above Input', () => {
    test('should show default helper text when input is empty', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(() => {
          expect(screen.getByText('Type to search posts by title')).toBeInTheDocument();
        });
      }
    });

    test('should show "Searching for" text when input has value', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          const searchInput = screen.getByPlaceholderText('Search by title...');
          
          fireEvent.change(searchInput, { target: { value: 'my search' } });
          
          await waitFor(() => {
            expect(screen.getByText('Searching for: "my search"')).toBeInTheDocument();
          });
        });
      }
    });

    test('helper text should be ABOVE the input field', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(() => {
          const helperText = screen.getByText('Type to search posts by title');
          const searchInput = screen.getByPlaceholderText('Search by title...');
          
          // Get positions
          const helperRect = helperText.getBoundingClientRect();
          const inputRect = searchInput.getBoundingClientRect();
          
          // Helper text should be above (smaller y coordinate)
          expect(helperRect.top).toBeLessThan(inputRect.top);
        });
      }
    });
  });

  describe('Search History Functionality', () => {
    test('should save search to history when Enter key is pressed', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          const searchInput = screen.getByPlaceholderText('Search by title...');
          
          fireEvent.change(searchInput, { target: { value: 'test search' } });
          fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
          
          // Check localStorage
          const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
          expect(history).toContain('test search');
        });
      }
    });

    test('should save search to history when dialog is closed', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          const searchInput = screen.getByPlaceholderText('Search by title...');
          
          fireEvent.change(searchInput, { target: { value: 'closing search' } });
          
          // Close dialog
          const closeButton = screen.getByRole('button', { name: /close/i });
          fireEvent.click(closeButton);
          
          // Check localStorage
          await waitFor(() => {
            const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            expect(history).toContain('closing search');
          });
        });
      }
    });

    test('should NOT save empty search to history', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          const searchInput = screen.getByPlaceholderText('Search by title...');
          
          fireEvent.change(searchInput, { target: { value: '' } });
          fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
          
          // Check localStorage
          const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
          expect(history.length).toBe(0);
        });
      }
    });

    test('should NOT save whitespace-only search to history', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          const searchInput = screen.getByPlaceholderText('Search by title...');
          
          fireEvent.change(searchInput, { target: { value: '   ' } });
          fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
          
          // Check localStorage
          const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
          expect(history.length).toBe(0);
        });
      }
    });

    test('should limit search history to 10 items', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          const searchInput = screen.getByPlaceholderText('Search by title...');
          
          // Add 15 searches
          for (let i = 1; i <= 15; i++) {
            fireEvent.change(searchInput, { target: { value: `search ${i}` } });
            fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
          }
          
          // Check localStorage
          const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
          expect(history.length).toBe(10);
          expect(history[0]).toBe('search 15'); // Most recent first
        });
      }
    });

    test('should remove duplicate searches and move to top', async () => {
      // Pre-populate history
      localStorage.setItem('searchHistory', JSON.stringify(['old search', 'another search']));

      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          const searchInput = screen.getByPlaceholderText('Search by title...');
          
          // Search for existing item
          fireEvent.change(searchInput, { target: { value: 'old search' } });
          fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
          
          // Check localStorage
          const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
          expect(history.length).toBe(2); // No duplicate
          expect(history[0]).toBe('old search'); // Moved to top
        });
      }
    });
  });

  describe('Search History Dropdown', () => {
    test('should show history dropdown when input is focused', async () => {
      // Pre-populate history
      localStorage.setItem('searchHistory', JSON.stringify(['search 1', 'search 2']));

      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(() => {
          // Input should auto-focus, history should show
          expect(screen.getByText('search 1')).toBeInTheDocument();
          expect(screen.getByText('search 2')).toBeInTheDocument();
        });
      }
    });

    test('should NOT show dropdown if history is empty', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(() => {
          const searchInput = screen.getByPlaceholderText('Search by title...');
          fireEvent.focus(searchInput);
          
          // No history items should appear
          const dropdown = document.querySelector('.absolute.top-full');
          expect(dropdown).not.toBeInTheDocument();
        });
      }
    });

    test('dropdown should be 25% width and positioned on left', async () => {
      // Pre-populate history
      localStorage.setItem('searchHistory', JSON.stringify(['test search']));

      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(() => {
          const dropdown = document.querySelector('.absolute.top-full');
          expect(dropdown).toBeInTheDocument();
          expect(dropdown).toHaveClass('w-1/4'); // 25% width
          expect(dropdown).toHaveClass('left-0'); // Left aligned
        });
      }
    });

    test('dropdown should be scrollable with max-height', async () => {
      // Pre-populate with many items
      const manyItems = Array.from({ length: 20 }, (_, i) => `search ${i + 1}`);
      localStorage.setItem('searchHistory', JSON.stringify(manyItems.slice(0, 10)));

      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(() => {
          const dropdown = document.querySelector('.absolute.top-full');
          expect(dropdown).toHaveClass('max-h-[200px]');
          expect(dropdown).toHaveClass('overflow-y-auto');
        });
      }
    });

    test('clicking history item should populate search input', async () => {
      // Pre-populate history
      localStorage.setItem('searchHistory', JSON.stringify(['clicked search']));

      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          const historyItem = screen.getByText('clicked search');
          fireEvent.click(historyItem);
          
          const searchInput = screen.getByPlaceholderText('Search by title...') as HTMLInputElement;
          expect(searchInput.value).toBe('clicked search');
          expect(mockOnSearchChange).toHaveBeenCalledWith('clicked search');
        });
      }
    });

    test('clicking history item should close the dropdown', async () => {
      // Pre-populate history
      localStorage.setItem('searchHistory', JSON.stringify(['clicked search']));

      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          const historyItem = screen.getByText('clicked search');
          fireEvent.click(historyItem);
          
          // Dropdown should be hidden
          await waitFor(() => {
            const dropdown = document.querySelector('.absolute.top-full');
            expect(dropdown).not.toBeInTheDocument();
          });
        });
      }
    });
  });

  describe('Delete Button (X) in History Dropdown', () => {
    test('should show X button on hover for each history item', async () => {
      // Pre-populate history
      localStorage.setItem('searchHistory', JSON.stringify(['delete me']));

      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(() => {
          const historyItem = screen.getByText('delete me').parentElement;
          const deleteButton = historyItem?.querySelector('button[title="Delete from history"]');
          
          expect(deleteButton).toBeInTheDocument();
          // Should have opacity-0 initially (hidden until hover)
          expect(deleteButton).toHaveClass('opacity-0');
          expect(deleteButton).toHaveClass('group-hover:opacity-100');
        });
      }
    });

    test('X button should be on the RIGHT side of history item', async () => {
      // Pre-populate history
      localStorage.setItem('searchHistory', JSON.stringify(['test item']));

      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(() => {
          const historyText = screen.getByText('test item');
          const historyItem = historyText.parentElement;
          const deleteButton = historyItem?.querySelector('button[title="Delete from history"]');
          
          // Check that delete button comes after text
          const historyRect = historyText.getBoundingClientRect();
          const deleteRect = deleteButton?.getBoundingClientRect();
          
          if (deleteRect) {
            expect(deleteRect.left).toBeGreaterThan(historyRect.right);
          }
        });
      }
    });

    test('clicking X should delete item from history', async () => {
      // Pre-populate history
      localStorage.setItem('searchHistory', JSON.stringify(['keep this', 'delete this', 'keep this too']));

      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          // Find the delete button for 'delete this'
          const historyItem = screen.getByText('delete this').parentElement;
          const deleteButton = historyItem?.querySelector('button[title="Delete from history"]');
          
          if (deleteButton) {
            fireEvent.click(deleteButton);
            
            // Check localStorage
            await waitFor(() => {
              const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
              expect(history).not.toContain('delete this');
              expect(history).toContain('keep this');
              expect(history).toContain('keep this too');
              expect(history.length).toBe(2);
            });
          }
        });
      }
    });

    test('clicking X should remove item from UI immediately', async () => {
      // Pre-populate history
      localStorage.setItem('searchHistory', JSON.stringify(['item to remove']));

      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          const historyItem = screen.getByText('item to remove').parentElement;
          const deleteButton = historyItem?.querySelector('button[title="Delete from history"]');
          
          if (deleteButton) {
            fireEvent.click(deleteButton);
            
            // Item should be removed from UI
            await waitFor(() => {
              expect(screen.queryByText('item to remove')).not.toBeInTheDocument();
            });
          }
        });
      }
    });

    test('clicking X should NOT trigger the history item click', async () => {
      // Pre-populate history
      localStorage.setItem('searchHistory', JSON.stringify(['dont click me']));

      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          mockOnSearchChange.mockClear();
          
          const historyItem = screen.getByText('dont click me').parentElement;
          const deleteButton = historyItem?.querySelector('button[title="Delete from history"]');
          
          if (deleteButton) {
            fireEvent.click(deleteButton);
            
            // Search input should NOT be updated
            const searchInput = screen.getByPlaceholderText('Search by title...') as HTMLInputElement;
            expect(searchInput.value).toBe('');
            expect(mockOnSearchChange).not.toHaveBeenCalled();
          }
        });
      }
    });
  });

  describe('Clear Search Button', () => {
    test('should clear search query when Clear Search is clicked', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          const searchInput = screen.getByPlaceholderText('Search by title...') as HTMLInputElement;
          
          fireEvent.change(searchInput, { target: { value: 'clear this' } });
          expect(searchInput.value).toBe('clear this');
          
          const clearButton = screen.getByRole('button', { name: /clear search/i });
          fireEvent.click(clearButton);
          
          await waitFor(() => {
            expect(searchInput.value).toBe('');
            expect(mockOnSearchChange).toHaveBeenCalledWith('');
          });
        });
      }
    });

    test('should close dialog when Clear Search is clicked', async () => {
      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(async () => {
          const clearButton = screen.getByRole('button', { name: /clear search/i });
          fireEvent.click(clearButton);
          
          await waitFor(() => {
            expect(screen.queryByText('Search Posts')).not.toBeInTheDocument();
          });
        });
      }
    });

    test('Clear Search button should NOT be covered by history dropdown', async () => {
      // Pre-populate history
      localStorage.setItem('searchHistory', JSON.stringify(['item 1', 'item 2', 'item 3']));

      render(
        <FloatingMenu 
          currentSpaceId="test-space" 
          currentUserId="test-user" 
          onSearchChange={mockOnSearchChange}
        />
      );

      // Open search dialog
      const floatingButton = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(floatingButton);
      
      const searchButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('🔍')
      );
      
      if (searchButton) {
        fireEvent.click(searchButton);
        
        await waitFor(() => {
          const clearButton = screen.getByRole('button', { name: /clear search/i });
          const dropdown = document.querySelector('.absolute.top-full');
          
          // Both should be visible
          expect(clearButton).toBeVisible();
          expect(dropdown).toBeInTheDocument();
          
          // Dropdown should be narrow (25% width) and not cover button
          expect(dropdown).toHaveClass('w-1/4');
        });
      }
    });
  });
});
