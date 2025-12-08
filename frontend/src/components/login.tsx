import React, { useState, useEffect } from "react";
import {
  validateUsernameCharacters,
  validateUsernameLength,
  validateUsernameDoesNotContainProfanity,
} from "../utils/usernameValidator";
import {
  validatePasswordCharacters,
  validatePasswordLength,
  validatePasswordStrength,
} from "../utils/passwordValidator";
import ReactDOM from "react-dom";
import { api } from "../utils/api";
import CaptchaType67 from "./CaptchaType67";
import {
  checkTimeout,
  recordFailedAttempt,
  resetAttempts,
  formatTimeRemaining,
  getTimeoutMinutes,
  getNextTimeoutMinutes,
} from "../utils/loginTimeout";

interface LoginProps {
  isOpen: boolean;
  onClose: (authenticated?: boolean) => void;
}

export default function Login({ isOpen, onClose }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // validation state
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null); // null = untouched
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [firstNameValid, setFirstNameValid] = useState<boolean | null>(null);
  const [lastNameValid, setLastNameValid] = useState<boolean | null>(null);
  const [confirmValid, setConfirmValid] = useState<boolean | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Local UI mode: login | signup | verify-human
  const [mode, setMode] = useState<"login" | "signup" | "verify">("login");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verified, setVerified] = useState(false);
  // Remember-me state: persist username to localStorage when true
  const [remember, setRemember] = useState(false);
  
  // Login timeout state
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [timeoutRemaining, setTimeoutRemaining] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Clear form when the modal closes
      setUsername("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setUsernameValid(null);
      setPasswordValid(null);
      setFirstNameValid(null);
      setLastNameValid(null);
      setConfirmPassword("");
      setConfirmValid(null);
      setRemember(false);
      setShowWarning(false);
    } else {
      // When opening, populate username from localStorage if available
      try {
        const saved = localStorage.getItem("ss_remembered_username");
        if (saved) {
          setUsername(saved);
          setRemember(true);
        }
      } catch (e) {
        // localStorage may be unavailable (private mode); ignore
      }
      
      // Check timeout status
      const timeoutStatus = checkTimeout();
      setIsTimedOut(timeoutStatus.isTimedOut);
      setTimeoutRemaining(timeoutStatus.remainingSeconds);
    }
  }, [isOpen]);
  
  // Countdown timer for timeout
  useEffect(() => {
    if (!isTimedOut || timeoutRemaining <= 0) {
      return;
    }
    
    const timer = setInterval(() => {
      const timeoutStatus = checkTimeout();
      setTimeoutRemaining(timeoutStatus.remainingSeconds);
      
      if (!timeoutStatus.isTimedOut) {
        setIsTimedOut(false);
        setTimeoutRemaining(0);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isTimedOut, timeoutRemaining]);

  // helper to compute username validity from the validator functions
  const computeUsernameValidity = (u: string) => {
    if (!u || u.trim() === "") return false;
    if (!validateUsernameCharacters(u)) return false;
    if (!validateUsernameLength(u)) return false;
    if (!validateUsernameDoesNotContainProfanity(u)) return false;
    // no whitespace allowed
    if (/\s/.test(u)) return false;
    return true;
  };

  // Username requirement flags for UI hints
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
    if (!p || p.trim() === "") return false;
    if (!validatePasswordCharacters(p)) return false;
    if (!validatePasswordLength(p)) return false;
    if (!validatePasswordStrength(p)) return false;
    // no whitespace
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

  if (typeof document === "undefined") return null;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is in timeout
    const timeoutStatus = checkTimeout();
    if (timeoutStatus.isTimedOut) {
      alert(`Too many failed attempts. Please wait ${formatTimeRemaining(timeoutStatus.remainingSeconds)} before trying again.`);
      return;
    }

    try {
      const data = await api.login(username, password);
      
      // Login successful - reset attempts
      resetAttempts();
      setShowWarning(false);
      setIsTimedOut(false);
      
      console.log("Login successful:", data);
      alert(`Welcome back, ${data.display_name || data.username}!`);
      // Persist or remove remembered username according to the checkbox
      try {
        if (remember && username && username.trim().length > 0) {
          localStorage.setItem("ss_remembered_username", username.trim());
        } else {
          localStorage.removeItem("ss_remembered_username");
        }
      } catch (e) {
        // Ignore storage errors
      }
      // TODO: Store user data in state/context for app use
      onClose(true); // Pass true to indicate successful authentication
    } catch (error) {
      console.error("Login error:", error);
      
      // Record failed attempt
      const attemptResult = recordFailedAttempt();
      
      if (attemptResult.shouldTimeout) {
        // Get the timeout duration (progressive)
        const timeoutMinutes = getTimeoutMinutes();
        const timeoutSeconds = timeoutMinutes * 60;
        
        // Start timeout
        setIsTimedOut(true);
        setTimeoutRemaining(timeoutSeconds);
        
        if (timeoutMinutes === 1) {
          alert(`Too many failed attempts. You are locked out for 1 minute.`);
        } else {
          alert(`Too many failed attempts. You are locked out for ${timeoutMinutes} minutes.`);
        }
      } else if (attemptResult.shouldShowWarning) {
        // Show warning on 4th attempt
        setShowWarning(true);
        const nextTimeoutMinutes = getNextTimeoutMinutes();
        const minuteText = nextTimeoutMinutes === 1 ? '1 minute' : `${nextTimeoutMinutes} minutes`;
        alert(`Warning: This is your ${attemptResult.attemptCount}th failed attempt. After ${attemptResult.remainingAttempts} more failed attempt(s), you will be locked out for ${minuteText}.`);
      } else {
        alert("Login failed. Please check your credentials and try again.");
      }
    }
  };

  // Render modal via portal: full-viewport flex centering
  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
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
        className="relative z-[10001] w-full"
        style={{
          maxWidth: '480px',
          minHeight: '500px',
          padding: '48px 40px',
          borderRadius: '32px',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--ss-glass-border-active)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(40px) saturate(180%)',
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
        }}
      >
        {/* Login Mode */}
        {mode === "login" && (
          <div>
            <h2 className="mb-8 text-center" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'white' }}>
              Second Space
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Timeout Warning */}
              {isTimedOut && (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ color: '#fca5a5', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                    🔒 Account Temporarily Locked
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>
                    Too many failed login attempts. Please wait {formatTimeRemaining(timeoutRemaining)} before trying again.
                  </div>
                </div>
              )}
              
              {/* Warning on 4th attempt */}
              {showWarning && !isTimedOut && (() => {
                const nextTimeoutMinutes = getTimeoutMinutes();
                const minuteText = nextTimeoutMinutes === 1 ? '1 minute' : `${nextTimeoutMinutes} minutes`;
                return (
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(251, 191, 36, 0.15)',
                      border: '1px solid rgba(251, 191, 36, 0.5)',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ color: '#fcd34d', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                      ⚠️ Warning
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>
                      One more failed attempt will lock you out for {minuteText}.
                    </div>
                  </div>
                );
              })()}
              
              <div style={{ marginBottom: 12 }}>
                <label
                  htmlFor="modal-username"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 14,
                  }}
                >
                  Username
                </label>
                <input
                  id="modal-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    height: 56,
                    padding: "0 20px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "white",
                    fontSize: 16,
                  }}
                />
              </div>

              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  id="modal-remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <label
                  htmlFor="modal-remember"
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  Remember username
                </label>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label
                  htmlFor="modal-password"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 14,
                  }}
                >
                  Password
                </label>
                <input
                  id="modal-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    height: 56,
                    padding: "0 20px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "white",
                    fontSize: 16,
                  }}
                />
              </div>
              <div style={{ marginTop: 20 }}>
                <button
                  type="submit"
                  disabled={isTimedOut}
                  style={{
                    width: "100%",
                    height: 56,
                    borderRadius: 12,
                    background: isTimedOut ? "#6b7280" : "#2563eb",
                    border: "none",
                    color: "white",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: isTimedOut ? "not-allowed" : "pointer",
                    opacity: isTimedOut ? 0.6 : 1,
                  }}
                >
                  {isTimedOut ? `Locked (${formatTimeRemaining(timeoutRemaining)})` : "Submit"}
                </button>
              </div>

              <div style={{ marginTop: 14, textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setVerified(false);
                    setConfirmPassword("");
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.85)",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Or Create Account
                </button>
              </div>
            </form>
          </div>
        )}

        {mode === "signup" && (
          <div>
            <h2 className="mb-8 text-center" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'white' }}>
              Create Account
            </h2>
            <form
              onFocusCapture={(e) => {
                const t = e.target as HTMLElement;
                if (!t || !t.id) return;
                if (t.id.startsWith("signup-")) {
                  setFocusedField(t.id.replace("signup-", ""));
                }
              }}
              onBlurCapture={() => {
                // clear focus when focus leaves inputs
                setTimeout(() => {
                  const ae = document.activeElement as HTMLElement | null;
                  if (!ae || !ae.id || !ae.id.startsWith("signup-"))
                    setFocusedField(null);
                }, 0);
              }}
              onSubmit={async (e) => {
                e.preventDefault();
                if (!verified) {
                  // Open the verification step so user can confirm humanness.
                  setMode('verify');
                  return;
                }
                if (password !== confirmPassword) {
                  alert("Passwords do not match");
                  return;
                }

                const payload = {
                  firstName: firstName,
                  lastName: lastName,
                  username,
                  password,
                };

                console.log("Attempting to create account with:", payload);

                try {
                  const data = await api.createUser(payload);
                  console.log("Account created:", data);
                  alert(
                    `Account created successfully! Welcome, ${data.username}!`
                  );
                  onClose(true); // Pass true to indicate successful authentication
                } catch (error) {
                  console.error("Signup error:", error);
                  alert(
                    `Failed to create account: ${error instanceof Error ? error.message : "Unknown error"}`
                  );
                }
              }}
              style={{
                display: "block",
                width: "100%",
                margin: "0 auto",
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <label
                  htmlFor="signup-first"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 14,
                  }}
                >
                  First name
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
                  onFocus={() => setFocusedField("first")}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{
                    width: "100%",
                    height: 56,
                    padding: "0 20px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      firstNameValid === null
                        ? "rgba(255,255,255,0.08)"
                        : firstNameValid
                        ? "#16a34a"
                        : "#dc2626"
                    }`,
                    color: "white",
                    fontSize: 16,
                  }}
                />
                {focusedField === "first" && (
                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        color: firstNameValid ? "#16a34a" : "#dc2626",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Must not be empty
                    </span>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  htmlFor="signup-last"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 14,
                  }}
                >
                  Last name
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
                  onFocus={() => setFocusedField("last")}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{
                    width: "100%",
                    height: 56,
                    padding: "0 20px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      lastNameValid === null
                        ? "rgba(255,255,255,0.08)"
                        : lastNameValid
                        ? "#16a34a"
                        : "#dc2626"
                    }`,
                    color: "white",
                    fontSize: 16,
                  }}
                />
                {focusedField === "last" && (
                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        color: lastNameValid ? "#16a34a" : "#dc2626",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Must not be empty
                    </span>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label
                  htmlFor="signup-username"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 14,
                  }}
                >
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
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{
                    width: "100%",
                    height: 56,
                    padding: "0 20px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      usernameValid === null
                        ? "rgba(255,255,255,0.08)"
                        : usernameValid
                        ? "#16a34a"
                        : "#dc2626"
                    }`,
                    color: "white",
                    fontSize: 16,
                  }}
                />
                {/* Username requirements */}
                {focusedField === "username" &&
                  (() => {
                    const r = usernameReqs(username);
                    return (
                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            color: r.validLength ? "#16a34a" : "#dc2626",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          6 to 15 characters
                        </span>
                        <span
                          style={{
                            color: r.validChars ? "#16a34a" : "#dc2626",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          Only letters, digits, underscores, hyphens
                        </span>
                        <span
                          style={{
                            color: r.noProfanity ? "#16a34a" : "#dc2626",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          Must not contain profanity
                        </span>
                        <span
                          style={{
                            color: r.noWhitespace ? "#16a34a" : "#dc2626",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          No whitespace
                        </span>
                      </div>
                    );
                  })()}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  htmlFor="signup-password"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 14,
                  }}
                >
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
                  }}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{
                    width: "100%",
                    height: 56,
                    padding: "0 20px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      passwordValid === null
                        ? "rgba(255,255,255,0.08)"
                        : passwordValid
                        ? "#16a34a"
                        : "#dc2626"
                    }`,
                    color: "white",
                    fontSize: 16,
                  }}
                />
                {/* Password requirements */}
                {focusedField === "password" &&
                  (() => {
                    const r = passwordReqs(password);
                    return (
                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            color: r.hasValue ? "#16a34a" : "#dc2626",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          Must not be empty
                        </span>
                        <span
                          style={{
                            color: r.validLength ? "#16a34a" : "#dc2626",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          8 to 64 characters
                        </span>
                        <span
                          style={{
                            color: r.strong ? "#16a34a" : "#dc2626",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          Must contain uppercase, lowercase, digit, and symbol
                        </span>
                        <span
                          style={{
                            color: r.noWhitespace ? "#16a34a" : "#dc2626",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          No whitespace
                        </span>
                        <span
                          style={{
                            color: r.validChars ? "#16a34a" : "#dc2626",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          Allowed characters only (no control chars/newlines)
                        </span>
                      </div>
                    );
                  })()}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  htmlFor="signup-confirm"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 14,
                  }}
                >
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
                  onFocus={() => setFocusedField("confirm")}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{
                    width: "100%",
                    height: 56,
                    padding: "0 20px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      confirmValid === null
                        ? "rgba(255,255,255,0.08)"
                        : confirmValid
                        ? "#16a34a"
                        : "#dc2626"
                    }`,
                    color: "white",
                    fontSize: 16,
                  }}
                />
                {focusedField === "confirm" && (
                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        color: confirmValid ? "#16a34a" : "#dc2626",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {confirmValid
                        ? "Matches password"
                        : "Must match password"}
                    </span>
                  </div>
                )}
              </div>

              {/* Debug: Show validation states */}
              <div style={{ marginBottom: 12, fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                firstName={String(firstNameValid)} | lastName={String(lastNameValid)} | 
                username={String(usernameValid)} | password={String(passwordValid)} | 
                confirm={String(confirmValid)} | verified={String(verified)}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setMode("verify")}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "white",
                    background: verified ? "#16a34a" : "#dc2626",
                  }}
                >
                  {verified ? "Verified" : "Verify human"}
                </button>
                <button
                  type="submit"
                  disabled={
                    !(
                      usernameValid &&
                      passwordValid &&
                      firstNameValid &&
                      lastNameValid &&
                      confirmValid &&
                      verified
                    )
                  }
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 10,
                    background: "#2563eb",
                    border: "none",
                    color: "white",
                    cursor: !(
                      usernameValid &&
                      passwordValid &&
                      firstNameValid &&
                      lastNameValid &&
                      confirmValid &&
                      verified
                    )
                      ? "not-allowed"
                      : "pointer",
                    opacity: !(
                      usernameValid &&
                      passwordValid &&
                      firstNameValid &&
                      lastNameValid &&
                      confirmValid &&
                      verified
                    )
                      ? 0.6
                      : 1,
                    pointerEvents: "auto",
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = "#1d4ed8";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = "#2563eb";
                    }
                  }}
                >
                  Create Account
                </button>
              </div>

              <div style={{ marginTop: 12, textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.85)",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        )}

        {mode === "verify" && (
          <CaptchaType67
            onSuccess={() => {
              setVerified(true);
              setMode("signup");
            }}
            onCancel={() => {
              setMode("signup");
            }}
          />
        )}
      </div>
    </div>,
    document.body
  );
}