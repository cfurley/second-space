import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../login';
import { api } from '../../utils/api';

// Mock the api module
vi.mock('../../utils/api', () => ({
  api: {
    login: vi.fn(),
  },
}));

// Mock ReactDOM.createPortal to render in place for testing
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('Login Component - Authentication Tests', () => {
  const mockOnClose = vi.fn();
  const mockAlert = vi.fn();
  const mockConsoleLog = vi.fn();
  const mockConsoleError = vi.fn();

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Mock window.alert
    window.alert = mockAlert;
    
    // Mock console methods
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test Case 1: User login with correct username and correct password
   * Expected: The user will successfully login to the system
   * Date Tested: 10/18/2025
   */
  describe('Test 1: Login with correct username and correct password', () => {
    it('should successfully login the user with valid credentials', async () => {
      // Arrange - Setup test data
      const validUsername = 'testuser';
      const validPassword = 'ValidPass123!';
      const mockUserData = {
        id: '123',
        username: validUsername,
        display_name: 'Test User',
      };

      // Mock successful API response
      (api.login as any).mockResolvedValueOnce(mockUserData);

      // Act - Render component and simulate user interaction
      render(<Login isOpen={true} onClose={mockOnClose} />);

      // Find and fill username field
  const usernameInput = screen.getByLabelText((content) => content.trim().toLowerCase() === 'username');
  fireEvent.change(usernameInput, { target: { value: validUsername } });

      // Find and fill password field
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: validPassword } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      // Assert - Verify expected behavior
      await waitFor(() => {
        // Verify API was called with correct credentials
        expect(api.login).toHaveBeenCalledWith(validUsername, validPassword);
        expect(api.login).toHaveBeenCalledTimes(1);

        // Verify success message
        expect(mockAlert).toHaveBeenCalledWith(
          expect.stringContaining('Welcome back')
        );

        // Verify modal closes on successful login
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should display welcome message with display name after successful login', async () => {
      // Arrange
      const mockUserData = {
        id: '456',
        username: 'johndoe',
        display_name: 'John Doe',
      };
      (api.login as any).mockResolvedValueOnce(mockUserData);

      // Act
      render(<Login isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.change(screen.getByLabelText((content) => content.trim().toLowerCase() === 'username'), {
        target: { value: 'johndoe' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'CorrectPass456!' },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      // Assert
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Welcome back, John Doe!');
      });
    });
  });

  /**
   * Test Case 2: User login with incorrect username and incorrect password
   * Expected: The user will not login to the system
   * Date Tested: 10/18/2025
   */
  describe('Test 2: Login with incorrect username and incorrect password', () => {
    it('should fail to login with both invalid username and password', async () => {
      // Arrange - Setup invalid credentials
      const invalidUsername = 'wronguser';
      const invalidPassword = 'wrongpass';

      // Mock API error response for authentication failure
      (api.login as any).mockRejectedValueOnce(
        new Error('Invalid credentials')
      );

      // Act - Render and attempt login
      render(<Login isOpen={true} onClose={mockOnClose} />);

      fireEvent.change(screen.getByLabelText((content) => content.trim().toLowerCase() === 'username'), {
        target: { value: invalidUsername },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: invalidPassword },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      // Assert - Verify login failure
      await waitFor(() => {
        // Verify API was called
        expect(api.login).toHaveBeenCalledWith(invalidUsername, invalidPassword);

        // Verify error message displayed
        expect(mockAlert).toHaveBeenCalledWith(
          'Login failed. Please check your credentials and try again.'
        );

        // Verify modal does NOT close on failed login
        expect(mockOnClose).not.toHaveBeenCalled();
      });
    });

    it('should log error details to console on authentication failure', async () => {
      // Arrange
      const errorMessage = 'User not found';
      (api.login as any).mockRejectedValueOnce(new Error(errorMessage));

      // Act
      render(<Login isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.change(screen.getByLabelText((content) => content.trim().toLowerCase() === 'username'), {
        target: { value: 'nonexistent' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'invalidpass' },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      // Assert
      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          'Login error:',
          expect.any(Error)
        );
      });
    });
  });

  /**
   * Test Case 3: User login with correct username but bad password
   * Expected: The user will not login to the system
   * Date Tested: 10/18/2025
   */
  describe('Test 3: Login with correct username but incorrect password', () => {
    it('should fail to login with valid username but wrong password', async () => {
      // Arrange
      const correctUsername = 'validuser';
      const wrongPassword = 'WrongPassword123!';

      // Mock authentication failure
      (api.login as any).mockRejectedValueOnce(
        new Error('Incorrect password')
      );

      // Act
      render(<Login isOpen={true} onClose={mockOnClose} />);

      fireEvent.change(screen.getByLabelText((content) => content.trim().toLowerCase() === 'username'), {
        target: { value: correctUsername },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: wrongPassword },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      // Assert
      await waitFor(() => {
        // Verify API was called with provided credentials
        expect(api.login).toHaveBeenCalledWith(correctUsername, wrongPassword);

        // Verify error alert shown
        expect(mockAlert).toHaveBeenCalledWith(
          'Login failed. Please check your credentials and try again.'
        );

        // Verify user remains on login screen
        expect(mockOnClose).not.toHaveBeenCalled();
      });
    });

    it('should not reveal whether username exists when password is wrong', async () => {
      // Arrange - Security test: ensure consistent error message
      (api.login as any).mockRejectedValueOnce(
        new Error('Invalid credentials')
      );

      // Act
      render(<Login isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.change(screen.getByLabelText((content) => content.trim().toLowerCase() === 'username'), {
        target: { value: 'existinguser' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'BadPass!' },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      // Assert - Should show generic error, not revealing user existence
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Login failed. Please check your credentials and try again.'
        );
      });
    });
  });

  /**
   * Test Case 4: User login with incorrect username but correct password
   * Expected: The user will not login to the system
   * Date Tested: 10/18/2025
   */
  describe('Test 4: Login with incorrect username but correct password', () => {
    it('should fail to login with wrong username but valid password', async () => {
      // Arrange
      const wrongUsername = 'nonexistentuser';
      const correctPassword = 'CorrectPassword123!';

      // Mock user not found error
      (api.login as any).mockRejectedValueOnce(
        new Error('User not found')
      );

      // Act
      render(<Login isOpen={true} onClose={mockOnClose} />);

      fireEvent.change(screen.getByLabelText((content) => content.trim().toLowerCase() === 'username'), {
        target: { value: wrongUsername },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: correctPassword },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      // Assert
      await waitFor(() => {
        // Verify API call made
        expect(api.login).toHaveBeenCalledWith(wrongUsername, correctPassword);

        // Verify error displayed
        expect(mockAlert).toHaveBeenCalledWith(
          'Login failed. Please check your credentials and try again.'
        );

        // Verify no successful login
        expect(mockOnClose).not.toHaveBeenCalled();
      });
    });

    it('should handle user not found error gracefully', async () => {
      // Arrange
      const error = new Error('User does not exist');
      (api.login as any).mockRejectedValueOnce(error);

      // Act
      render(<Login isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.change(screen.getByLabelText((content) => content.trim().toLowerCase() === 'username'), {
        target: { value: 'ghost_user' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'AnyPassword123!' },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      // Assert
      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalled();
        expect(mockAlert).toHaveBeenCalledWith(
          'Login failed. Please check your credentials and try again.'
        );
      });
    });
  });

  /**
   * Additional Edge Cases and Security Tests
   */
  describe('Additional Security and Edge Case Tests', () => {
    it('should prevent login when username field is empty', async () => {
      // Arrange
      render(<Login isOpen={true} onClose={mockOnClose} />);

      // Act - Try to submit with empty username
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' },
      });
      
      const form = screen.getByRole('button', { name: /submit/i }).closest('form');
      
      // Assert - HTML5 validation should prevent submission
  expect(screen.getByLabelText((content) => content.trim().toLowerCase() === 'username')).toBeRequired();
    });

    it('should prevent login when password field is empty', async () => {
      // Arrange
      render(<Login isOpen={true} onClose={mockOnClose} />);

      // Act
      fireEvent.change(screen.getByLabelText((content) => content.trim().toLowerCase() === 'username'), {
        target: { value: 'testuser' },
      });

      // Assert
      expect(screen.getByLabelText(/password/i)).toBeRequired();
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      (api.login as any).mockRejectedValueOnce(
        new Error('Network request failed')
      );

      // Act
      render(<Login isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.change(screen.getByLabelText((content) => content.trim().toLowerCase() === 'username'), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Pass123!' },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      // Assert
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Login failed. Please check your credentials and try again.'
        );
      });
    });

    it('should not make API call if form validation fails', () => {
      // Arrange
      render(<Login isOpen={true} onClose={mockOnClose} />);

      // Act - Try to submit without filling fields
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      // Assert - API should not be called with empty credentials
      expect(api.login).not.toHaveBeenCalled();
    });
  });

  /**
   * UI Rendering Tests
   */
  describe('Component Rendering Tests', () => {
    it('should render login form when modal is open', () => {
      // Act
      render(<Login isOpen={true} onClose={mockOnClose} />);

      // Assert
      expect(screen.getByText(/Second Space/i)).toBeInTheDocument();
  expect(screen.getByLabelText((content) => content.trim().toLowerCase() === 'username')).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should have proper form inputs with correct types', () => {
      // Act
      render(<Login isOpen={true} onClose={mockOnClose} />);

      // Assert
  const usernameInput = screen.getByLabelText((content) => content.trim().toLowerCase() === 'username');
  const passwordInput = screen.getByLabelText(/password/i);

      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(usernameInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });
  });
});
