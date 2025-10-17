import React, { useState, useEffect } from 'react';
import {
  validateUsernameCharacters,
  validateUsernameLength,
  validateUsernameDoesNotContainProfanity,
} from '../utils/usernameValidator';
import {
  validatePasswordCharacters,
  validatePasswordLength,
  validatePasswordStrength,
} from '../utils/passwordValidator';
import ReactDOM from 'react-dom';

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Login({ isOpen, onClose }: LoginProps) {
  // All state variables (combining both versions)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'verify'>('login');
  const [verified, setVerified] = useState(false);
  const [verifyInput, setVerifyInput] = useState('');
  
  // validation state
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [firstNameValid, setFirstNameValid] = useState<boolean | null>(null);
  const [lastNameValid, setLastNameValid] = useState<boolean | null>(null);
  const [confirmValid, setConfirmValid] = useState<boolean | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setUsername('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setConfirmPassword('');
      setUsernameValid(null);
      setPasswordValid(null);
      setFirstNameValid(null);
      setLastNameValid(null);
      setConfirmValid(null);
      setVerified(false);
      setVerifyInput('');
      setMode('login');
    }
  }, [isOpen]);

  const computeUsernameValidity = (u: string) => {
    if (!u || u.trim() === '') return false;
    if (!validateUsernameCharacters(u)) return false;
    if (!validateUsernameLength(u)) return false;
    if (!validateUsernameDoesNotContainProfanity(u)) return false;
    if (/\s/.test(u)) return false;
    return true;
  };

  const usernameReqs = (u: string) => {
    return {
      hasValue: u.trim().length > 0,
      validChars: validateUsernameCharacters(u),
      validLength: validateUsernameLength(u),
      noProfanity: validateUsernameDoesNotContainProfanity(u),
      noWhitespace: !/\s/.test(u),
    };
  };

  const computePasswordValidity = (p: string) => {
    if (!p || p.trim() === '') return false;
    if (!validatePasswordCharacters(p)) return false;
    if (!validatePasswordLength(p)) return false;
    if (!validatePasswordStrength(p)) return false;
    if (/\s/.test(p)) return false;
    return true;
  };

  const passwordReqs = (p: string) => {
    return {
      hasValue: p.trim().length > 0,
      validChars: validatePasswordCharacters(p),
      validLength: validatePasswordLength(p),
      strong: validatePasswordStrength(p),
      noWhitespace: !/\s/.test(p),
    };
  };

  // API functionality from HEAD - Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { username, password };

    try {
      const response = await fetch('/api/user/authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        console.log('Login successful:', data);
        alert(`Welcome back, ${data.display_name || data.username}!`);
        // TODO: Store user data in state/context for app use
        onClose();
      } else {
        // Login failed
        alert(`Login failed: ${data.message || 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  // API functionality from HEAD - Signup handler
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) {
      alert('Please verify you are human before creating an account');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      username,
      password,
    };

    console.log('Attempting to create account with:', payload);

    try {
      const response = await fetch('/api/user/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Server response:', {
        status: response.status,
        data,
      });

      if (response.ok) {
        // Account created successfully
        console.log('Account created:', data);
        alert(`Account created successfully! Welcome, ${data.username}!`);
        onClose();
      } else {
        // Account creation failed
        console.error('Account creation failed:', data);
        alert(
          `Failed to create account: ${
            data.error || data.message || 'Unknown error'
          }`
        );
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  if (typeof document === 'undefined') return null;
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      onClick={onClose}
    >
      {/* Enhanced Backdrop with glass effect */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px) saturate(150%)',
        }}
        aria-hidden
      />

      {/* Modal with enhanced liquid glass effect */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-[10001] w-full max-w-[520px] rounded-3xl border p-12"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderColor: 'var(--ss-glass-border-active)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(40px) saturate(180%)',
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
        }}
      >
        {/* Login Mode */}
        {mode === 'login' && (
          <div>
            <h2 className="mb-8 text-center" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'white' }}>
              Second Space
            </h2>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label htmlFor="login-username" className="mb-2 block" style={{ fontSize: '0.9rem', color: 'var(--ss-text-secondary)' }}>
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-xl px-6 py-4 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--ss-glass-border)',
                    color: 'var(--ss-text-primary)',
                    fontSize: '1.05rem',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.borderColor = 'var(--ss-glass-border-active)';
                    e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.target.style.borderColor = 'var(--ss-glass-border)';
                    e.target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                  }}
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-2 block" style={{ fontSize: '0.9rem', color: 'var(--ss-text-secondary)' }}>
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl px-6 py-4 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--ss-glass-border)',
                    color: 'var(--ss-text-primary)',
                    fontSize: '1.05rem',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.borderColor = 'var(--ss-glass-border-active)';
                    e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.target.style.borderColor = 'var(--ss-glass-border)';
                    e.target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                  }}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(29, 29, 29, 0.8)',
                  color: 'var(--ss-text-primary)',
                  border: '1px solid var(--ss-glass-border-active)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 20px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  padding: '18px 60px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = 'rgba(29, 29, 29, 0.8)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                }}
              >
                Login
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setVerified(false);
                    setConfirmPassword('');
                  }}
                  className="transition-all duration-200"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ss-text-secondary)',
                    fontSize: '0.95rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--ss-text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--ss-text-secondary)';
                  }}
                >
                  Create Account →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Signup Mode */}
        {mode === 'signup' && (
          <div>
            <h2 className="mb-8 text-center" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'white' }}>
              Create Account
            </h2>

            <form
              onSubmit={handleSignupSubmit}
              className="space-y-5"
              onFocusCapture={(e) => {
                const t = e.target as HTMLElement;
                if (t?.id?.startsWith('signup-')) {
                  setFocusedField(t.id.replace('signup-', ''));
                }
              }}
              onBlurCapture={() => {
                setTimeout(() => {
                  const ae = document.activeElement as HTMLElement | null;
                  if (!ae?.id?.startsWith('signup-')) setFocusedField(null);
                }, 0);
              }}
            >
              {/* First Name */}
              <div>
                <label htmlFor="signup-first" className="mb-2 block" style={{ fontSize: '0.85rem', color: 'var(--ss-text-secondary)' }}>
                  First Name
                </label>
                <input
                  id="signup-first"
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFirstName(v);
                    setFirstNameValid(v.trim().length > 0);
                  }}
                  required
                  className="w-full rounded-lg px-4 py-2.5 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${
                      firstNameValid === null
                        ? 'var(--ss-glass-border)'
                        : firstNameValid
                        ? 'var(--ss-success)'
                        : 'var(--ss-error)'
                    }`,
                    color: 'var(--ss-text-primary)',
                    fontSize: '0.85rem',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                  }}
                />
                {focusedField === 'first' && (
                  <p
                    className="mt-1.5"
                    style={{
                      fontSize: '0.75rem',
                      color: firstNameValid ? 'var(--ss-success)' : 'var(--ss-error)',
                    }}
                  >
                    Must not be empty
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="signup-last" className="mb-2 block" style={{ fontSize: '0.85rem', color: 'var(--ss-text-secondary)' }}>
                  Last Name
                </label>
                <input
                  id="signup-last"
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLastName(v);
                    setLastNameValid(v.trim().length > 0);
                  }}
                  required
                  className="w-full rounded-lg px-4 py-2.5 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${
                      lastNameValid === null
                        ? 'var(--ss-glass-border)'
                        : lastNameValid
                        ? 'var(--ss-success)'
                        : 'var(--ss-error)'
                    }`,
                    color: 'var(--ss-text-primary)',
                    fontSize: '0.85rem',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                  }}
                />
                {focusedField === 'last' && (
                  <p
                    className="mt-1.5"
                    style={{
                      fontSize: '0.75rem',
                      color: lastNameValid ? 'var(--ss-success)' : 'var(--ss-error)',
                    }}
                  >
                    Must not be empty
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <label htmlFor="signup-username" className="mb-2 block" style={{ fontSize: '0.85rem', color: 'var(--ss-text-secondary)' }}>
                  Username
                </label>
                <input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const v = e.target.value;
                    setUsername(v);
                    setUsernameValid(computeUsernameValidity(v));
                  }}
                  required
                  className="w-full rounded-lg px-4 py-2.5 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${
                      usernameValid === null
                        ? 'var(--ss-glass-border)'
                        : usernameValid
                        ? 'var(--ss-success)'
                        : 'var(--ss-error)'
                    }`,
                    color: 'var(--ss-text-primary)',
                    fontSize: '0.85rem',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                  }}
                />
                {focusedField === 'username' && (() => {
                  const r = usernameReqs(username);
                  return (
                    <div className="mt-1.5 space-y-0.5" style={{ fontSize: '0.75rem' }}>
                      <p style={{ color: r.hasValue ? 'var(--ss-success)' : 'var(--ss-error)' }}>
                        {r.hasValue ? '✓' : '✗'} Must not be empty
                      </p>
                      <p style={{ color: r.validChars ? 'var(--ss-success)' : 'var(--ss-error)' }}>
                        {r.validChars ? '✓' : '✗'} Valid characters (letters, numbers, _, -)
                      </p>
                      <p style={{ color: r.validLength ? 'var(--ss-success)' : 'var(--ss-error)' }}>
                        {r.validLength ? '✓' : '✗'} 3-20 characters
                      </p>
                      <p style={{ color: r.noProfanity ? 'var(--ss-success)' : 'var(--ss-error)' }}>
                        {r.noProfanity ? '✓' : '✗'} No profanity
                      </p>
                      <p style={{ color: r.noWhitespace ? 'var(--ss-success)' : 'var(--ss-error)' }}>
                        {r.noWhitespace ? '✓' : '✗'} No whitespace
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="signup-password" className="mb-2 block" style={{ fontSize: '0.85rem', color: 'var(--ss-text-secondary)' }}>
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPassword(v);
                    setPasswordValid(computePasswordValidity(v));
                    if (confirmPassword) {
                      setConfirmValid(v === confirmPassword);
                    }
                  }}
                  required
                  className="w-full rounded-lg px-4 py-2.5 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${
                      passwordValid === null
                        ? 'var(--ss-glass-border)'
                        : passwordValid
                        ? 'var(--ss-success)'
                        : 'var(--ss-error)'
                    }`,
                    color: 'var(--ss-text-primary)',
                    fontSize: '0.85rem',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                  }}
                />
                {focusedField === 'password' && (() => {
                  const r = passwordReqs(password);
                  return (
                    <div className="mt-1.5 space-y-0.5" style={{ fontSize: '0.75rem' }}>
                      <p style={{ color: r.hasValue ? 'var(--ss-success)' : 'var(--ss-error)' }}>
                        {r.hasValue ? '✓' : '✗'} Must not be empty
                      </p>
                      <p style={{ color: r.validChars ? 'var(--ss-success)' : 'var(--ss-error)' }}>
                        {r.validChars ? '✓' : '✗'} Valid characters (letters, numbers, !@#$%^&*()-_+=)
                      </p>
                      <p style={{ color: r.validLength ? 'var(--ss-success)' : 'var(--ss-error)' }}>
                        {r.validLength ? '✓' : '✗'} 8-128 characters
                      </p>
                      <p style={{ color: r.strong ? 'var(--ss-success)' : 'var(--ss-error)' }}>
                        {r.strong ? '✓' : '✗'} Must contain uppercase, lowercase, and number
                      </p>
                      <p style={{ color: r.noWhitespace ? 'var(--ss-success)' : 'var(--ss-error)' }}>
                        {r.noWhitespace ? '✓' : '✗'} No whitespace
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="signup-confirm" className="mb-2 block" style={{ fontSize: '0.85rem', color: 'var(--ss-text-secondary)' }}>
                  Confirm Password
                </label>
                <input
                  id="signup-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    const v = e.target.value;
                    setConfirmPassword(v);
                    setConfirmValid(v === password);
                  }}
                  required
                  className="w-full rounded-lg px-4 py-2.5 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${
                      confirmValid === null
                        ? 'var(--ss-glass-border)'
                        : confirmValid
                        ? 'var(--ss-success)'
                        : 'var(--ss-error)'
                    }`,
                    color: 'var(--ss-text-primary)',
                    fontSize: '0.85rem',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                  }}
                />
                {focusedField === 'confirm' && (
                  <p
                    className="mt-1.5"
                    style={{
                      fontSize: '0.75rem',
                      color: confirmValid ? 'var(--ss-success)' : 'var(--ss-error)',
                    }}
                  >
                    {confirmValid ? '✓' : '✗'} Passwords must match
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMode('verify')}
                className="w-full rounded-lg py-3 transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(29, 29, 29, 0.8)',
                  border: '1px solid var(--ss-glass-border-active)',
                  color: 'var(--ss-text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 20px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = 'rgba(29, 29, 29, 0.8)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                }}
              >
                Continue {verified ? '✓' : '→'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="transition-all duration-200"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ss-text-secondary)',
                    fontSize: '0.85rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--ss-text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--ss-text-secondary)';
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Verify Mode */}
        {mode === 'verify' && (
          <div>
            <h2 className="mb-8 text-center" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'white' }}>
              Verify You're Human
            </h2>

            <p className="mb-6 text-center" style={{ fontSize: '1rem', color: 'var(--ss-text-secondary)' }}>
              What is 34 + 33?
            </p>

            <input
              type="text"
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              placeholder="Enter answer"
              className="mb-6 w-full rounded-lg px-4 py-3 transition-all duration-300"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--ss-glass-border)',
                color: 'var(--ss-text-primary)',
                fontSize: '0.9rem',
                backdropFilter: 'blur(10px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'var(--ss-glass-border-active)';
                e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'var(--ss-glass-border)';
                e.target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.05)';
              }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (verifyInput.trim() === '67') {
                    setVerified(true);
                    setMode('signup');
                    setVerifyInput('');
                  } else {
                    alert('Verification failed — please type 67');
                  }
                }}
                className="flex-1 rounded-lg py-3 transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(29, 29, 29, 0.8)',
                  border: '1px solid var(--ss-glass-border-active)',
                  color: 'var(--ss-text-primary)',
                  fontSize: '0.85rem',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 20px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = 'rgba(29, 29, 29, 0.8)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                }}
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setVerifyInput('');
                }}
                className="flex-1 rounded-lg py-3 transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--ss-glass-border)',
                  color: 'var(--ss-text-primary)',
                  fontSize: '0.85rem',
                  backdropFilter: 'blur(20px)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 transition-all duration-200"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--ss-text-secondary)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ss-glass-light)';
            e.currentTarget.style.color = 'var(--ss-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--ss-text-secondary)';
          }}
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  );
}
