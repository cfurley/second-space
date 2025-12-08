import React, { useState } from "react";

interface CaptchaType67Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CaptchaType67({ onSuccess, onCancel }: CaptchaType67Props) {
  const [value, setValue] = useState("");

  const tryVerify = () => {
    if (value.trim() === "67") {
      onSuccess();
      setValue("");
    } else {
      alert("Verification failed — please type 67");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 460,
        margin: "0 auto",
        padding: 18,
        background: "#0f0f0f",
        border: "1px solid rgba(255,255,255,0.06)",
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
      <label htmlFor="captcha67" style={{ display: "none" }}>Captcha</label>
      <input
        id="captcha67"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            tryVerify();
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
          onClick={tryVerify}
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
            setValue("");
            onCancel();
          }}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 8,
            background: "rgba(239, 68, 68, 0.1)",
            color: "rgb(252, 165, 165)",
            border: "2px solid rgba(239, 68, 68, 0.4)",
            fontWeight: 500,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
