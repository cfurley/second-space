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

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
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

  useEffect(() => {
    if (!isOpen) {
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
    }
  }, [isOpen]);

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
    const payload = { username, password };

    try {
      const response = await fetch("/api/user/authentication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        console.log("Login successful:", data);
        alert(`Welcome back, ${data.display_name || data.username}!`);
        // TODO: Store user data in state/context for app use
        onClose();
      } else {
        // Login failed
        alert(`Login failed: ${data.message || "Invalid credentials"}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Network error. Please check your connection and try again.");
    }
  };

  // Local UI mode: login | signup | verify-human
  const [mode, setMode] = React.useState<"login" | "signup" | "verify">(
    "login"
  );
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [verified, setVerified] = React.useState(false);
  const [verifyInput, setVerifyInput] = React.useState("");

  // Render modal via portal: full-viewport flex centering
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.85)",
          zIndex: 10000,
        }}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(1200px, 96vw)",
          backgroundColor: "#eab308",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 32,
          padding: 56,
          color: "white",
          boxShadow: "0 60px 150px rgba(0,0,0,0.95)",
          zIndex: 10001,
        }}
      >
        {mode === "login" && (
          <>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 700,
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              Second Space Login
            </h2>

            <form
              onSubmit={handleSubmit}
              style={{
                display: "block",
                width: "min(900px, 88vw)",
                margin: "0 auto",
              }}
            >
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
                  style={{
                    width: "100%",
                    height: 56,
                    borderRadius: 12,
                    background: "#2563eb",
                    border: "none",
                    color: "white",
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  Submit
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
          </>
        )}

        {mode === "signup" && (
          <>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 18,
                textAlign: "center",
              }}
            >
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
                  alert(
                    "Please verify you are human before creating an account"
                  );
                  return;
                }
                if (password !== confirmPassword) {
                  alert("Passwords do not match");
                  return;
                }

                const payload = {
                  first_name: firstName,
                  last_name: lastName,
                  username,
                  password,
                };

                console.log("Attempting to create account with:", payload);

                try {
                  const response = await fetch("/api/user/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });

                  const data = await response.json();
                  console.log("Server response:", {
                    status: response.status,
                    data,
                  });

                  if (response.ok) {
                    // Account created successfully
                    console.log("Account created:", data);
                    alert(
                      `Account created successfully! Welcome, ${data.username}!`
                    );
                    onClose();
                  } else {
                    // Account creation failed
                    console.error("Account creation failed:", data);
                    alert(
                      `Failed to create account: ${
                        data.error || data.message || "Unknown error"
                      }`
                    );
                  }
                } catch (error) {
                  console.error("Signup error:", error);
                  alert(
                    "Network error. Please check your connection and try again."
                  );
                }
              }}
              style={{
                display: "block",
                width: "min(900px, 88vw)",
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
                {focusedField === 'username' && (() => {
                  const r = usernameReqs(username);
                  return (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ color: r.validLength ? '#16a34a' : '#dc2626', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>6 to 15 characters</span>
                      <span style={{ color: r.validChars ? '#16a34a' : '#dc2626', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Only letters, digits, underscores, hyphens</span>
                      <span style={{ color: r.noProfanity ? '#16a34a' : '#dc2626', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Must not contain profanity</span>
                      <span style={{ color: r.noWhitespace ? '#16a34a' : '#dc2626', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>No whitespace</span>
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
          </>
        )}

        {mode === "verify" && (
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              margin: "0 auto",
              padding: 18,
              background: "rgba(13, 71, 161, 0.9)", // Slightly lighter blue
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 16,
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Verify human
            </h3>
            <p
              style={{
                textAlign: "center",
                color: "rgba(255,255,255,0.72)",
                marginBottom: 12,
              }}
            >
              Type 67
            </p>
            <input
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  // perform same verification logic as the Submit button
                  if (verifyInput.trim() === "67") {
                    setVerified(true);
                    setMode("signup");
                    setVerifyInput("");
                  } else {
                    alert("Verification failed — please type 67");
                  }
                }
              }}
              style={{
                width: "100%",
                height: 44,
                padding: "0 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "white",
                marginBottom: 12,
              }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => {
                  if (verifyInput.trim() === "67") {
                    setVerified(true);
                    setMode("signup");
                    setVerifyInput("");
                  } else {
                    alert("Verification failed — please type 67");
                  }
                }}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 8,
                  background: "#2563eb",
                  color: "white",
                }}
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setVerifyInput("");
                }}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.03)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
