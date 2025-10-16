import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Login({ isOpen, onClose }: LoginProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { username, password };
    // Alert with raw JSON data as requested
    alert(`Login attempted with data: ${JSON.stringify(payload)}`);
    // --- Where to send this data for implementing the API ---
    // Send a POST request with JSON body to your backend auth route.
    // Example endpoint (backend): POST /api/users/authenticate  or POST /api/auth/login
    // Payload shape: { username: string, password: string }
    // The server should return a session token / user object on success.
    // You can implement the route in: backend/src/routes/userRoutes.js (add a POST /authenticate)
    // and the handler in: backend/src/controllers/userControllers.js
    // Example fetch (uncomment and adapt):
    // fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    //   .then(r => r.json()).then(data => console.log('login response', data));
    // Close modal after submit
    onClose();
  };

  // Render the modal into document.body to avoid clipping by app containers that use overflow-hidden
  return ReactDOM.createPortal(
    // Backdrop
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 min-h-screen">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal box - larger and centered */}
      <div className="relative w-full max-w-4xl px-6">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-4xl p-14 text-white shadow-2xl flex flex-col items-center mx-auto" style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.85)' }}>
          <h2 className="text-3xl font-semibold mb-8 text-center">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div>
              <label htmlFor="modal-username" className="text-sm text-white/90 block mb-2">Username</label>
              <input
                id="modal-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-14 px-5 rounded bg-white/5 border border-white/10 text-white text-base"
                required
              />
            </div>

            <div>
              <label htmlFor="modal-password" className="text-sm text-white/90 block mb-2">Password</label>
              <input
                id="modal-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 px-5 rounded bg-white/5 border border-white/10 text-white text-base"
                required
              />
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl text-base font-medium"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
