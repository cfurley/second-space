// Login modal used by AuthGate. It provides login and create-account flows.
// Uses the AuthContext (useAuth) for actual authentication calls.
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Login({ isOpen }: LoginProps) {
  const auth = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setUsername('');
      setPassword('');
    }
  }, [isOpen]);

  if (typeof document === 'undefined') return null;
  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await auth.login(username, password);
    // auth.login will flip isAuthenticated in the provider
  };

  // Local UI mode: login | signup | verify-human
  const [mode, setMode] = React.useState<'login' | 'signup' | 'verify'>('login');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [verified, setVerified] = React.useState(false);
  const [verifyInput, setVerifyInput] = React.useState('');
  const [createErrors, setCreateErrors] = useState<string[] | null>(null);

  const handleCreateAccount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!verified) { setCreateErrors(['Please verify you are human']); return; }
    if (password !== confirmPassword) { setCreateErrors(['Passwords do not match']); return; }
    const result = await auth.createAccount(username.trim(), password);
    if (!result.success) {
      setCreateErrors(result.errors);
      return;
    }
    setCreateErrors(null);
    // successful; provider already sets authenticated
  };

  // Render modal via portal: full-viewport flex centering
  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => { /* clicking backdrop should not auto-auth; keep modal open */ }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000 }} />

      <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(1200px, 96vw)', backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 32, padding: 56, color: 'white', boxShadow: '0 60px 150px rgba(0,0,0,0.95)', zIndex: 10001 }}>
        {mode === 'login' && (
          <>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Second Space Login</h2>

            <form onSubmit={handleLogin} style={{ display: 'block', width: 'min(900px, 88vw)', margin: '0 auto' }}>
              <div style={{ marginBottom: 12 }}>
                <label htmlFor="modal-username" style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Username</label>
                <input id="modal-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', height: 56, padding: '0 20px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 16 }} />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label htmlFor="modal-password" style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Password</label>
                <input id="modal-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', height: 56, padding: '0 20px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 16 }} />
              </div>

              <div style={{ marginTop: 20 }}>
                <button type="submit" style={{ width: '100%', height: 56, borderRadius: 12, background: '#2563eb', border: 'none', color: 'white', fontSize: 16, fontWeight: 600 }}>Submit</button>
              </div>

              <div style={{ marginTop: 14, textAlign: 'center' }}>
                <button type="button" onClick={() => { setMode('signup'); setVerified(false); setConfirmPassword(''); setCreateErrors(null); }} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.85)', textDecoration: 'underline', cursor: 'pointer', fontSize: 14 }}>Or Create Account</button>
              </div>
            </form>
          </>
        )}

        {mode === 'signup' && (
          <>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 18, textAlign: 'center' }}>Create Account</h2>
            <form onSubmit={handleCreateAccount} style={{ display: 'block', width: 'min(900px, 88vw)', margin: '0 auto' }}>
              <div style={{ marginBottom: 12 }}>
                <label htmlFor="signup-username" style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Username</label>
                <input id="signup-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', height: 56, padding: '0 20px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 16 }} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label htmlFor="signup-password" style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Password</label>
                <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', height: 56, padding: '0 20px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 16 }} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label htmlFor="signup-confirm" style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Confirm Password</label>
                <input id="signup-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', height: 56, padding: '0 20px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 16 }} />
              </div>

              {createErrors && createErrors.length > 0 && (
                <div style={{ marginBottom: 12, color: '#f87171' }}>
                  {createErrors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setMode('verify')}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                    background: verified ? '#16a34a' : '#dc2626',
                  }}
                >
                  {verified ? 'Verified' : 'Verify human'}
                </button>
                <button type="submit" style={{ flex: 1, height: 48, borderRadius: 10, background: '#2563eb', border: 'none', color: 'white' }}>Create Account</button>
              </div>

              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <button type="button" onClick={() => setMode('login')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.85)', textDecoration: 'underline', cursor: 'pointer' }}>Back to Login</button>
              </div>
            </form>
          </>
        )}

        {mode === 'verify' && (
          <div style={{ width: '100%', maxWidth: 460, margin: '0 auto', padding: 18, background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>Verify human</h3>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.72)', marginBottom: 12 }}>Type 67</p>
            <input
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // perform same verification logic as the Submit button
                  if (verifyInput.trim() === '67') {
                    setVerified(true);
                    setMode('signup');
                    setVerifyInput('');
                  } else {
                    setCreateErrors(['Verification failed  please type 67']);
                  }
                }
              }}
              style={{ width: '100%', height: 44, padding: '0 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => { if (verifyInput.trim() === '67') { setVerified(true); setMode('signup'); setVerifyInput(''); } else { setCreateErrors(['Verification failed  please type 67']); } }} style={{ flex: 1, height: 44, borderRadius: 8, background: '#2563eb', color: 'white' }}>Submit</button>
              <button type="button" onClick={() => { setMode('signup'); setVerifyInput(''); }} style={{ flex: 1, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: 'white', border: '1px solid rgba(255,255,255,0.08)' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
