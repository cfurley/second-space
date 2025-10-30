import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingMenu } from '../FloatingMenu';
import '@testing-library/jest-dom';

describe('FloatingMenu Component', () => {
  it('renders main floating buttons', () => {
    render(<FloatingMenu />);
    
    // Check if all main buttons are present
    expect(screen.getByText('✏️')).toBeInTheDocument(); // Note button
    expect(screen.getByText('+')).toBeInTheDocument(); // Add button
    expect(screen.getByText('🔍')).toBeInTheDocument(); // Search button
  });

  it('shows menu options when + button is clicked', () => {
    render(<FloatingMenu />);
    
    // Initially, menu options should not be visible
    expect(screen.queryByText('Create Space')).not.toBeInTheDocument();
    expect(screen.queryByText('Create Ad')).not.toBeInTheDocument();

    // Click the + button
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);

    // Now menu options should be visible
    expect(screen.getByText('Create Space')).toBeInTheDocument();
    expect(screen.getByText('Create Ad')).toBeInTheDocument();
  });

  it('opens Create Space dialog when Create Space is clicked', () => {
    render(<FloatingMenu />);
    
    // Open the menu
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);

    // Click Create Space
    const createSpaceButton = screen.getByText('Create Space');
    fireEvent.click(createSpaceButton);

    // Check if the dialog is opened with its form elements
    expect(screen.getByText('Create New Space')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Image')).toBeInTheDocument();
  });

  it('opens Create Ad dialog when Create Ad is clicked', () => {
    render(<FloatingMenu />);
    
    // Open the menu
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);

    // Click Create Ad
    const createAdButton = screen.getByText('Create Ad');
    fireEvent.click(createAdButton);

    // Check if the dialog is opened with its form elements
    expect(screen.getByText('Create New Ad')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Image')).toBeInTheDocument();
  });

  it('closes menu when an option is selected', async () => {
    render(<FloatingMenu />);
    
    // Open the menu
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);

    // Initially menu options should be visible
    expect(screen.getByText('Create Space')).toBeInTheDocument();

    // Click Create Space
    const createSpaceButton = screen.getByText('Create Space', { selector: 'button' });
    fireEvent.click(createSpaceButton);

    // Check if dialog opens and menu options disappear
    expect(screen.getByText('Create New Space')).toBeInTheDocument();
    expect(screen.queryByText('Create Space', { selector: 'button[style*="backgroundColor: transparent"]' })).not.toBeInTheDocument();
  });

  it('handles form submission for Create Space', async () => {
    render(<FloatingMenu />);
    
    // Open the menu and click Create Space
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('Create Space'));

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Test Space' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test Space Description' }
    });

    // Mock file input
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const imageInput = screen.getByLabelText('Image');
    fireEvent.change(imageInput, { target: { files: [file] } });

    // Submit the form
    const submitButton = screen.getByText('Create Space');
    fireEvent.click(submitButton);

    // Dialog should be closed
    expect(screen.queryByText('Create New Space')).not.toBeInTheDocument();
  });

  it('handles form submission for Create Ad', async () => {
    render(<FloatingMenu />);
    
    // Open the menu and click Create Ad
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('Create Ad'));

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Ad' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test Ad Description' }
    });

    // Mock file input
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const imageInput = screen.getByLabelText('Image');
    fireEvent.change(imageInput, { target: { files: [file] } });

    // Submit the form
    const submitButton = screen.getByText('Create Ad');
    fireEvent.click(submitButton);

    // Dialog should be closed
    expect(screen.queryByText('Create New Ad')).not.toBeInTheDocument();
  });
});