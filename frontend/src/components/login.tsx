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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal box */}
      <div className="relative w-full max-w-lg mx-auto">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 text-white shadow-2xl">
          <h2 className="text-lg font-semibold mb-2">Login</h2>
          <p className="text-sm text-white/70 mb-4">Enter your credentials</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="modal-username" className="text-xs text-white/90 block mb-1">Username</label>
              <input
                id="modal-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 px-3 rounded bg-white/5 border border-white/10 text-white text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="modal-password" className="text-xs text-white/90 block mb-1">Password</label>
              <input
                id="modal-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 rounded bg-white/5 border border-white/10 text-white text-sm"
                required
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 h-10 rounded text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10 rounded text-sm"
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
