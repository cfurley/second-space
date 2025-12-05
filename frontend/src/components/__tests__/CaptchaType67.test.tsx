import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CaptchaType67 from '../CaptchaType67';

// Mock ReactDOM.createPortal to render in place (if any portal usage happens upstream)
vi.mock('react-dom', async () => {
  const actual = await vi.importActual<any>('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('CaptchaType67 component', () => {
  const onSuccess = vi.fn();
  const onCancel = vi.fn();
  const alertMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    window.alert = alertMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('verifies successfully when user types 67 and clicks Submit', () => {
    render(<CaptchaType67 onSuccess={onSuccess} onCancel={onCancel} />);

    // Ensure UI renders
    expect(screen.getByText('Verify human')).toBeInTheDocument();
    expect(screen.getByText('Type 67')).toBeInTheDocument();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '67' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
    expect(alertMock).not.toHaveBeenCalled();
  });

  it('shows alert and does not verify for incorrect value', () => {
    render(<CaptchaType67 onSuccess={onSuccess} onCancel={onCancel} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '66' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSuccess).not.toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith('Verification failed — please type 67');
  });

  it('Enter key triggers verification', () => {
    render(<CaptchaType67 onSuccess={onSuccess} onCancel={onCancel} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '67' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('Cancel calls onCancel', () => {
    render(<CaptchaType67 onSuccess={onSuccess} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
