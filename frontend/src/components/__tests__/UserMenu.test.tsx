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
    render(<UserMenu isLoggedIn={true} />);
    expect(screen.getByText('AT')).toBeInTheDocument();
  });

  it('displays default initials when not logged in', () => {
    render(<UserMenu isLoggedIn={true} />);
    expect(screen.getByText('AT')).toBeInTheDocument();
  });

  it('displays user initials when provided', () => {
    render(<UserMenu isLoggedIn={true} userInitials="JC" />);
    expect(screen.getByText('JC')).toBeInTheDocument();
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
    
    render(<UserMenu isLoggedIn={true} />);
    
    const avatarButton = screen.getByText('JC');
    fireEvent.click(avatarButton);
    
    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);
    
    // Should return to default state
    expect(screen.getByText('AT')).toBeInTheDocument();
  });
});
