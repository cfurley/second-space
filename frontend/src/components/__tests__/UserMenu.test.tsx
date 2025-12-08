import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserMenu } from '../UserMenu';
import { clearUserCache, setUserCache } from '../../utils/userCache';

describe('UserMenu Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    clearUserCache();
  });

  it('renders without crashing', () => {
    render(<UserMenu />);
    expect(screen.getByText('AT')).toBeInTheDocument();
  });

  it('displays default initials when not logged in', () => {
    render(<UserMenu />);
    expect(screen.getByText('AT')).toBeInTheDocument();
  });

  it('displays user initials when provided', () => {
    render(<UserMenu userInitials="JC" />);
    expect(screen.getByText('JC')).toBeInTheDocument();
  });

  it('opens dropdown menu when clicked', () => {
    render(<UserMenu />);
    
    const avatarButton = screen.getByText('AT');
    fireEvent.click(avatarButton);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows login form when Login is clicked', () => {
    render(<UserMenu />);
    
    const avatarButton = screen.getByText('AT');
    fireEvent.click(avatarButton);
    
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows signup form when Sign Up is clicked', () => {
    render(<UserMenu />);
    
    const avatarButton = screen.getByText('AT');
    fireEvent.click(avatarButton);
    
    const signupButton = screen.getByText('Sign Up');
    fireEvent.click(signupButton);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('handles login form submission', async () => {
    render(<UserMenu />);
    
    const avatarButton = screen.getByText('AT');
    fireEvent.click(avatarButton);
    
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Menu should close after successful login
      expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
    });
  });

  it('handles signup form submission', async () => {
    render(<UserMenu />);
    
    const avatarButton = screen.getByText('AT');
    fireEvent.click(avatarButton);
    
    const signupButton = screen.getByText('Sign Up');
    fireEvent.click(signupButton);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Menu should close after successful signup
      expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
    });
  });

  it('closes dropdown when clicking outside', () => {
    const { container } = render(
      <div>
        <UserMenu />
        <div data-testid="outside">Outside element</div>
      </div>
    );
    
    const avatarButton = screen.getByText('AT');
    fireEvent.click(avatarButton);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    
    const outsideElement = screen.getByTestId('outside');
    fireEvent.mouseDown(outsideElement);
    
    // Menu should close
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('displays user info when logged in', () => {
    const userData = {
      id: '1',
      username: 'jackiechen',
      first_name: 'Jackie',
      last_name: 'Chen',
      email: 'jackie@example.com'
    };
    
    setUserCache(userData as any);
    
    render(<UserMenu />);
    
    const avatarButton = screen.getByText('JC');
    fireEvent.click(avatarButton);
    
    expect(screen.getByText('jackiechen')).toBeInTheDocument();
  });

  it('shows logout option when logged in', () => {
    const userData = {
      id: '1',
      username: 'jackiechen',
      first_name: 'Jackie',
      last_name: 'Chen',
      email: 'jackie@example.com'
    };
    
    setUserCache(userData as any);
    
    render(<UserMenu />);
    
    const avatarButton = screen.getByText('JC');
    fireEvent.click(avatarButton);
    
    expect(screen.getByText(/🚪 Logout/)).toBeInTheDocument();
  });

  it('handles logout', () => {
    const userData = {
      id: '1',
      username: 'jackiechen',
      first_name: 'Jackie',
      last_name: 'Chen',
      email: 'jackie@example.com'
    };
    
    setUserCache(userData as any);
    
    render(<UserMenu />);
    
    const avatarButton = screen.getByText('JC');
    fireEvent.click(avatarButton);
    
    const logoutButton = screen.getByText(/🚪 Logout/);
    fireEvent.click(logoutButton);
    
    // Should return to default state
    expect(screen.getByText('AT')).toBeInTheDocument();
  });
});
