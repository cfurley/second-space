import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../login';

// Mock ReactDOM.createPortal to render in place for testing
vi.mock('react-dom', async () => {
  const actual = await vi.importActual<any>('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('Login signup captcha (Type 67) integration', () => {
  const onClose = vi.fn();
  const alertMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    window.alert = alertMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens captcha from signup and verifies to set Verified state', async () => {
    render(<Login isOpen={true} onClose={onClose} />);

    // Go to signup
    fireEvent.click(screen.getByRole('button', { name: /or create account/i }));

    // Verify initial state shows Verify human button
    const verifyBtn = await screen.findByRole('button', { name: /verify human/i });
    expect(verifyBtn).toBeInTheDocument();

    // Open captcha
    fireEvent.click(verifyBtn);

    // Captcha component appears
    await waitFor(() => {
      expect(screen.getByText('Verify human')).toBeInTheDocument();
      expect(screen.getByText('Type 67')).toBeInTheDocument();
    });

    // Enter 67 and submit
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '67' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Back in signup, button should now show Verified
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verified/i })).toBeInTheDocument();
    });
  });

  it('cancel closes captcha and keeps unverified state', async () => {
    render(<Login isOpen={true} onClose={onClose} />);

    // Go to signup
    fireEvent.click(screen.getByRole('button', { name: /or create account/i }));

    // Open captcha
    const verifyBtn = await screen.findByRole('button', { name: /verify human/i });
    fireEvent.click(verifyBtn);

    // Click Cancel in captcha
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Should return to signup, still unverified
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verify human/i })).toBeInTheDocument();
    });
  });
});
