import React, { useState, useEffect } from 'react';
import {
  validateUsernameCharacters,
  validateUsernameLength,
  validateUsernameDoesNotContainProfanity,
} from '../utils/usernameValidator';
import { validatePasswordCharacters, validatePasswordLength, validatePasswordStrength } from '../utils/passwordValidator';
import ReactDOM from 'react-dom';

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Login({ isOpen, onClose }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // validation state
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null); // null = untouched
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
      setUsernameValid(null);
      setPasswordValid(null);
      setFirstNameValid(null);
      setLastNameValid(null);
      setConfirmPassword('');
      setConfirmValid(null);
    }
  }, [isOpen]);

  // helper to compute username validity from the validator functions
  const computeUsernameValidity = (u: string) => {
    if (!u || u.trim() === '') return false;
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
    if (!p || p.trim() === '') return false;
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

  if (typeof document === 'undefined') return null;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { username, password };
    
    try {
      const response = await fetch('/api/user/authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Login successful
        console.log('Login successful:', data.user);
        alert(`Welcome back, ${data.user.display_name || data.user.username}!`);
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

  // Local UI mode: login | signup | verify-human
  const [mode, setMode] = React.useState<'login' | 'signup' | 'verify'>('login');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [verified, setVerified] = React.useState(false);
  const [verifyInput, setVerifyInput] = React.useState('');
  const [currentTheme, setCurrentTheme] = React.useState<'westcoast' | 'scifi' | 'coffee'>('westcoast');
  const [isMusicPlaying, setIsMusicPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const oscillatorsRef = React.useRef<OscillatorNode[]>([]);

  // Create chill ambient beats using Web Audio API
  const createChillBeats = () => {
    if (!audioContextRef.current) {
      // @ts-ignore - AudioContext is available in browsers
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    
    // West Coast Lo-Fi chord progression: Am - F - C - G
    const chordProgression = [
      [220.00, 261.63, 329.63], // Am (A, C, E)
      [174.61, 220.00, 261.63], // F  (F, A, C)
      [261.63, 329.63, 392.00], // C  (C, E, G)
      [196.00, 246.94, 293.66], // G  (G, B, D)
    ];

    const baseLine = [220.00, 174.61, 261.63, 196.00]; // Bass notes
    const melody = [440.00, 523.25, 493.88, 392.00, 329.63]; // Melody notes

    let currentTime = ctx.currentTime;
    const beatDuration = 2; // 2 seconds per chord
    const totalDuration = beatDuration * chordProgression.length;

    // Create the song loop
    const playLoop = () => {
      currentTime = ctx.currentTime;

      // Play chord progression
      chordProgression.forEach((chord, chordIndex) => {
        const startTime = currentTime + (chordIndex * beatDuration);

        // Chord pads (soft, sustained)
        chord.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.04, startTime + 0.3);
          gain.gain.setValueAtTime(0.04, startTime + beatDuration - 0.5);
          gain.gain.linearRampToValueAtTime(0, startTime + beatDuration);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(startTime);
          osc.stop(startTime + beatDuration);
          oscillatorsRef.current.push(osc);
        });

        // Bass line (deeper, punchier)
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(baseLine[chordIndex], startTime);
        
        bassGain.gain.setValueAtTime(0, startTime);
        bassGain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
        bassGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
        
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        
        bassOsc.start(startTime);
        bassOsc.stop(startTime + beatDuration);
        oscillatorsRef.current.push(bassOsc);

        // Kick drum (sub bass hit)
        if (chordIndex % 2 === 0) {
          const kick = ctx.createOscillator();
          const kickGain = ctx.createGain();
          
          kick.type = 'sine';
          kick.frequency.setValueAtTime(60, startTime);
          kick.frequency.exponentialRampToValueAtTime(0.01, startTime + 0.3);
          
          kickGain.gain.setValueAtTime(0.3, startTime);
          kickGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
          
          kick.connect(kickGain);
          kickGain.connect(ctx.destination);
          
          kick.start(startTime);
          kick.stop(startTime + 0.3);
          oscillatorsRef.current.push(kick);
        }

        // Hi-hat (noise-ish sound using high frequency)
        for (let i = 0; i < 4; i++) {
          const hihat = ctx.createOscillator();
          const hihatGain = ctx.createGain();
          const hihatTime = startTime + (i * beatDuration / 4);
          
          hihat.type = 'square';
          hihat.frequency.setValueAtTime(8000 + Math.random() * 2000, hihatTime);
          
          hihatGain.gain.setValueAtTime(0.008, hihatTime);
          hihatGain.gain.exponentialRampToValueAtTime(0.001, hihatTime + 0.05);
          
          hihat.connect(hihatGain);
          hihatGain.connect(ctx.destination);
          
          hihat.start(hihatTime);
          hihat.stop(hihatTime + 0.05);
          oscillatorsRef.current.push(hihat);
        }
      });

      // Melody line (plays occasionally for variety)
      melody.forEach((freq, index) => {
        const melodyTime = currentTime + (index * 1.6);
        const melOsc = ctx.createOscillator();
        const melGain = ctx.createGain();
        
        melOsc.type = 'sine';
        melOsc.frequency.setValueAtTime(freq, melodyTime);
        
        melGain.gain.setValueAtTime(0, melodyTime);
        melGain.gain.linearRampToValueAtTime(0.06, melodyTime + 0.1);
        melGain.gain.linearRampToValueAtTime(0, melodyTime + 0.6);
        
        melOsc.connect(melGain);
        melGain.connect(ctx.destination);
        
        melOsc.start(melodyTime);
        melOsc.stop(melodyTime + 0.6);
        oscillatorsRef.current.push(melOsc);
      });

      // Schedule next loop
      setTimeout(() => {
        if (audioContextRef.current && oscillatorsRef.current.length > 0) {
          playLoop();
        }
      }, totalDuration * 1000);
    };

    playLoop();
  };

  const stopChillBeats = () => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Already stopped
      }
    });
    oscillatorsRef.current = [];
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  // Initialize audio element (for future use with actual audio files)
  React.useEffect(() => {
    return () => {
      stopChillBeats();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Toggle music playback
  const toggleMusic = () => {
    if (isMusicPlaying) {
      stopChillBeats();
      setIsMusicPlaying(false);
    } else {
      createChillBeats();
      setIsMusicPlaying(true);
    }
  };

  // Theme definitions
  const themes = {
    westcoast: {
      name: '🌴 West Coast',
      background: '#87CEEB',
      primary: '#FF6B35',
      accent: '#FFD700',
      surface: '#F4A460',
      hover: '#FF8C42',
      text: '#2C3E50',
      textLight: '#5D6D7E',
      textSuccess: '#27AE60',
      textError: '#E74C3C',
      gradient: 'linear-gradient(135deg, #87CEEB 0%, #B0E0E6 40%, #FFE4B5 100%)',
      borderColor: '#FF6B35',
      emoji: '🌴',
      tagline: '🌊 West Coast Vibes - Catch Your Wave 🏄',
      signupTagline: '🏄 Ride the wave to paradise 🌴',
      buttonText: '🌊 Dive In',
      createButtonText: '🏄 Catch Your Wave',
      floatingElements: ['🌴', '🌊', '☀️', '🏄', '🌅', '🏖️']
    },
    scifi: {
      name: '🚀 Sci-Fi',
      background: '#0a0e27',
      primary: '#00d4ff',
      accent: '#b026ff',
      surface: '#1a1f3a',
      hover: '#00fff7',
      text: '#e0e0e0',
      textLight: '#a0a0a0',
      textSuccess: '#00ff88',
      textError: '#ff3366',
      gradient: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2d1b69 100%)',
      borderColor: '#00d4ff',
      emoji: '🚀',
      tagline: '🛸 Enter The Future - Space Awaits 🌌',
      signupTagline: '👾 Join the galactic crew 🌠',
      buttonText: '🚀 Launch',
      createButtonText: '👽 Beam Up',
      floatingElements: ['🚀', '🛸', '👾', '🌌', '⭐', '🌠', '🔮', '💫']
    },
    coffee: {
      name: '☕ Coffee',
      background: '#ceb18d',
      primary: '#14120f',
      accent: '#bba180',
      surface: '#d4d2d1',
      hover: '#a66b00',
      text: '#14120f',
      textLight: '#4a4542',
      textSuccess: '#795200',
      textError: '#6d1f1f',
      gradient: 'linear-gradient(135deg, #ceb18d 0%, #d9c4a8 100%)',
      borderColor: '#a68b6d',
      emoji: '☕',
      tagline: 'Brewing your perfect workspace...',
      signupTagline: 'Your perfect blend awaits',
      buttonText: '☕ Sign In',
      createButtonText: '☕ Create Account',
      floatingElements: ['🫘', '☕', '☕']
    }
  };

  const coffeeTheme = themes[currentTheme];

  // Add CSS animation for floating coffee beans
  React.useEffect(() => {
    const styleId = 'coffee-bean-animation';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -40px) rotate(90deg); }
          50% { transform: translate(-20px, -80px) rotate(180deg); }
          75% { transform: translate(-40px, -40px) rotate(270deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-50px, 60px) rotate(120deg); }
          66% { transform: translate(40px, 30px) rotate(240deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(60px, -50px) rotate(180deg); }
        }
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-30px, -30px) rotate(-90deg); }
          50% { transform: translate(40px, -60px) rotate(-180deg); }
          75% { transform: translate(20px, -30px) rotate(-270deg); }
        }
        @keyframes float5 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(25px, 45px) rotate(60deg); }
          66% { transform: translate(-35px, 20px) rotate(120deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Render modal via portal: full-viewport flex centering
  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(8px)' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundColor: currentTheme === 'scifi' ? 'rgba(10,14,39,0.85)' : 'rgba(20,18,15,0.75)', zIndex: 10000 }} />
      
      {/* Theme Switcher Button */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10002, display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Music Control */}
        <button
          onClick={toggleMusic}
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            border: '2px solid rgba(255,255,255,0.4)',
            background: isMusicPlaying 
              ? 'linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)'
              : 'rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: 20,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: isMusicPlaying ? '0 4px 12px rgba(255,107,53,0.5)' : 'none',
            transition: 'all 0.3s',
            backdropFilter: 'blur(10px)',
            animation: isMusicPlaying ? 'pulse 2s ease-in-out infinite' : 'none'
          }}
          title={isMusicPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isMusicPlaying ? '🔊' : '🔇'}
        </button>

        <button
          onClick={() => setCurrentTheme('westcoast')}
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            border: currentTheme === 'westcoast' ? `3px solid ${themes.westcoast.primary}` : '2px solid rgba(255,255,255,0.3)',
            background: currentTheme === 'westcoast' ? themes.westcoast.gradient : 'rgba(255,255,255,0.1)',
            color: currentTheme === 'westcoast' ? themes.westcoast.text : '#fff',
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: currentTheme === 'westcoast' ? '0 4px 12px rgba(255,107,53,0.4)' : 'none',
            transition: 'all 0.3s',
            backdropFilter: 'blur(10px)'
          }}
          title="West Coast Theme"
        >
          🌴
        </button>
        <button
          onClick={() => setCurrentTheme('scifi')}
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            border: currentTheme === 'scifi' ? `3px solid ${themes.scifi.primary}` : '2px solid rgba(255,255,255,0.3)',
            background: currentTheme === 'scifi' ? themes.scifi.gradient : 'rgba(255,255,255,0.1)',
            color: currentTheme === 'scifi' ? themes.scifi.text : '#fff',
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: currentTheme === 'scifi' ? '0 4px 12px rgba(0,212,255,0.6), 0 0 20px rgba(176,38,255,0.4)' : 'none',
            transition: 'all 0.3s',
            backdropFilter: 'blur(10px)'
          }}
          title="Sci-Fi Theme"
        >
          🚀
        </button>
        <button
          onClick={() => setCurrentTheme('coffee')}
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            border: currentTheme === 'coffee' ? `3px solid ${themes.coffee.primary}` : '2px solid rgba(255,255,255,0.3)',
            background: currentTheme === 'coffee' ? themes.coffee.gradient : 'rgba(255,255,255,0.1)',
            color: currentTheme === 'coffee' ? themes.coffee.text : '#fff',
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: currentTheme === 'coffee' ? '0 4px 12px rgba(20,18,15,0.4)' : 'none',
            transition: 'all 0.3s',
            backdropFilter: 'blur(10px)'
          }}
          title="Coffee Theme"
        >
          ☕
        </button>
      </div>
      
      {/* Dynamic Floating Elements based on theme */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10000, pointerEvents: 'none', overflow: 'hidden' }}>
        {coffeeTheme.floatingElements.map((emoji, idx) => {
          const positions = [
            { top: '10%', left: '15%', fontSize: 40, animation: 'float1 20s ease-in-out infinite' },
            { top: '25%', right: '20%', fontSize: 44, animation: 'float2 25s ease-in-out infinite' },
            { top: '60%', left: '10%', fontSize: 36, animation: 'float3 18s ease-in-out infinite' },
            { top: '45%', right: '12%', fontSize: 38, animation: 'float4 22s ease-in-out infinite' },
            { top: '75%', left: '25%', fontSize: 42, animation: 'float5 19s ease-in-out infinite' },
            { top: '35%', left: '40%', fontSize: 34, animation: 'float1 24s ease-in-out infinite 2s' },
            { top: '80%', right: '30%', fontSize: 40, animation: 'float2 21s ease-in-out infinite 3s' },
            { top: '15%', right: '45%', fontSize: 36, animation: 'float3 23s ease-in-out infinite 1s' },
            { top: '50%', left: '5%', fontSize: 38, animation: 'float4 26s ease-in-out infinite 4s' },
            { top: '20%', left: '50%', fontSize: 42, animation: 'float5 20s ease-in-out infinite 2.5s' },
            { top: '70%', right: '15%', fontSize: 36, animation: 'float1 22s ease-in-out infinite 3.5s' },
            { top: '40%', left: '30%', fontSize: 40, animation: 'float2 24s ease-in-out infinite 1.5s' },
            { top: '5%', left: '35%', fontSize: 34, animation: 'float3 21s ease-in-out infinite 4.5s' },
            { top: '55%', right: '40%', fontSize: 38, animation: 'float4 19s ease-in-out infinite 2.8s' },
            { top: '85%', left: '45%', fontSize: 36, animation: 'float5 23s ease-in-out infinite 3.2s' },
            { top: '30%', right: '5%', fontSize: 42, animation: 'float1 25s ease-in-out infinite 4.2s' },
            { top: '12%', left: '60%', fontSize: 36, animation: 'float2 20s ease-in-out infinite 1.8s' },
            { top: '65%', right: '50%', fontSize: 40, animation: 'float3 22s ease-in-out infinite 3.7s' },
            { top: '90%', left: '12%', fontSize: 34, animation: 'float4 24s ease-in-out infinite 2.3s' },
            { top: '38%', left: '70%', fontSize: 38, animation: 'float5 21s ease-in-out infinite 4.8s' },
          ];
          
          const glowColor = currentTheme === 'scifi' 
            ? 'rgba(0,212,255,0.8)' 
            : currentTheme === 'westcoast' 
            ? 'rgba(255,215,0,0.6)' 
            : 'rgba(187,161,128,0.5)';
          
          return (
            <div 
              key={idx}
              style={{ 
                position: 'absolute', 
                ...positions[idx % positions.length],
                opacity: currentTheme === 'scifi' ? 0.6 : 0.5,
                filter: currentTheme === 'scifi' 
                  ? `brightness(1.4) contrast(1.5) drop-shadow(0 0 12px ${glowColor})`
                  : `brightness(1.2) contrast(1.3) drop-shadow(0 0 8px ${glowColor})`
              }}
            >
              {emoji}
            </div>
          );
        })}
      </div>

      <div onClick={(e) => e.stopPropagation()} style={{ 
        width: 'min(1200px, 96vw)', 
        background: coffeeTheme.gradient,
        border: `4px solid ${coffeeTheme.borderColor}`, 
        borderRadius: 32, 
        padding: 56, 
        color: coffeeTheme.text,
        boxShadow: currentTheme === 'scifi' 
          ? `0 30px 90px rgba(0,212,255,0.5), inset 0 1px 0 rgba(0,212,255,0.3), 0 0 80px rgba(176,38,255,0.4)`
          : currentTheme === 'westcoast'
          ? '0 30px 90px rgba(255,107,53,0.4), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 60px rgba(255,215,0,0.3)'
          : '0 30px 90px rgba(20,18,15,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
        zIndex: 10001,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Dynamic decorative corner elements */}
        <div style={{ 
          position: 'absolute', 
          top: 20, 
          right: 80, 
          fontSize: 52, 
          opacity: 0.25, 
          transform: 'rotate(15deg)', 
          filter: currentTheme === 'scifi' 
            ? 'drop-shadow(0 0 15px rgba(0,212,255,0.9))' 
            : currentTheme === 'westcoast'
            ? 'drop-shadow(0 0 10px rgba(255,215,0,0.8))'
            : 'brightness(0.6) sepia(1) saturate(2) hue-rotate(15deg)'
        }}>
          {currentTheme === 'scifi' ? '�' : currentTheme === 'westcoast' ? '�🌅' : '☕'}
        </div>
        <div style={{ 
          position: 'absolute', 
          bottom: 30, 
          left: 30, 
          fontSize: 44, 
          opacity: 0.22, 
          transform: 'rotate(-20deg)', 
          filter: currentTheme === 'scifi' 
            ? 'drop-shadow(0 0 15px rgba(176,38,255,0.9))' 
            : currentTheme === 'westcoast'
            ? 'drop-shadow(0 0 10px rgba(135,206,235,0.8))'
            : 'brightness(0.6) sepia(1) saturate(2) hue-rotate(15deg)'
        }}>
          {currentTheme === 'scifi' ? '🛸' : currentTheme === 'westcoast' ? '🏖️' : '🫘'}
        </div>
        
        {mode === 'login' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ 
                fontSize: 56, 
                marginBottom: 8, 
                filter: currentTheme === 'scifi' 
                  ? 'drop-shadow(0 0 15px rgba(0,212,255,0.9))' 
                  : currentTheme === 'westcoast'
                  ? 'drop-shadow(0 0 12px rgba(255,215,0,0.9))'
                  : 'brightness(0.6) sepia(1) saturate(2) hue-rotate(15deg)'
              }}>
                {coffeeTheme.emoji}
              </div>
              <h2 style={{ 
                fontSize: 42, 
                fontWeight: 900, 
                marginBottom: 8, 
                color: coffeeTheme.primary, 
                textShadow: currentTheme === 'scifi'
                  ? `0 0 20px rgba(0,212,255,0.8), 0 0 40px rgba(176,38,255,0.5)`
                  : currentTheme === 'westcoast'
                  ? `0 3px 8px rgba(255,215,0,0.5), 0 0 20px rgba(255,107,53,0.3)`
                  : '0 2px 4px rgba(255,255,255,0.3)',
                letterSpacing: '1px' 
              }}>
                Second Space
              </h2>
              <p style={{ fontSize: 17, color: coffeeTheme.textLight, fontStyle: 'italic', fontWeight: 500 }}>
                {coffeeTheme.tagline}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'block', width: 'min(900px, 88vw)', margin: '0 auto' }}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="modal-username" style={{ display: 'block', marginBottom: 8, color: coffeeTheme.text, fontSize: 15, fontWeight: 600 }}>
                  Username
                </label>
                <input 
                  id="modal-username" 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  style={{ 
                    width: '100%', 
                    height: 56, 
                    padding: '0 20px', 
                    borderRadius: 12, 
                    background: 'rgba(255,255,255,0.85)', 
                    border: `2px solid ${coffeeTheme.accent}`, 
                    color: coffeeTheme.text, 
                    fontSize: 16,
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = coffeeTheme.primary}
                  onBlur={(e) => e.target.style.borderColor = coffeeTheme.accent}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label htmlFor="modal-password" style={{ display: 'block', marginBottom: 8, color: coffeeTheme.text, fontSize: 15, fontWeight: 600 }}>
                  Password
                </label>
                <input 
                  id="modal-password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  style={{ 
                    width: '100%', 
                    height: 56, 
                    padding: '0 20px', 
                    borderRadius: 12, 
                    background: 'rgba(255,255,255,0.85)', 
                    border: `2px solid ${coffeeTheme.accent}`, 
                    color: coffeeTheme.text, 
                    fontSize: 16,
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = coffeeTheme.primary}
                  onBlur={(e) => e.target.style.borderColor = coffeeTheme.accent}
                />
              </div>

              <div style={{ marginTop: 24 }}>
                <button 
                  type="submit" 
                  style={{ 
                    width: '100%', 
                    height: 58, 
                    borderRadius: 14, 
                    background: `linear-gradient(135deg, ${coffeeTheme.primary} 0%, #2a2420 100%)`, 
                    border: 'none', 
                    color: coffeeTheme.background, 
                    fontSize: 17, 
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(20,18,15,0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(20,18,15,0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(20,18,15,0.3)';
                  }}
                >
                  {coffeeTheme.buttonText}
                </button>
              </div>

              <div style={{ marginTop: 18, textAlign: 'center' }}>
                <button 
                  type="button" 
                  onClick={() => { setMode('signup'); setVerified(false); setConfirmPassword(''); }} 
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: coffeeTheme.textLight, 
                    textDecoration: 'underline', 
                    cursor: 'pointer', 
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  {currentTheme === 'scifi' ? '🛸 New recruit? Join the space force!' : currentTheme === 'westcoast' ? '🌴 New here? Join the West Coast crew!' : '☕ Or Create Account'}
                </button>
              </div>
            </form>
          </>
        )}

        {mode === 'signup' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ 
                fontSize: 52, 
                marginBottom: 8, 
                filter: currentTheme === 'scifi' 
                  ? 'drop-shadow(0 0 15px rgba(0,212,255,0.9))' 
                  : currentTheme === 'westcoast'
                  ? 'drop-shadow(0 0 12px rgba(255,215,0,0.9))'
                  : 'brightness(0.6) sepia(1) saturate(2) hue-rotate(15deg)'
              }}>
                {coffeeTheme.emoji}
              </div>
              <h2 style={{ 
                fontSize: 36, 
                fontWeight: 900, 
                marginBottom: 6, 
                color: coffeeTheme.primary, 
                textShadow: currentTheme === 'scifi'
                  ? `0 0 20px rgba(0,212,255,0.8), 0 0 40px rgba(176,38,255,0.5)`
                  : currentTheme === 'westcoast'
                  ? `0 3px 8px rgba(255,215,0,0.5), 0 0 20px rgba(255,107,53,0.3)`
                  : '0 2px 4px rgba(255,255,255,0.3)',
                letterSpacing: '1px' 
              }}>
                Join Second Space
              </h2>
              <p style={{ fontSize: 16, color: coffeeTheme.textLight, fontStyle: 'italic', fontWeight: 500 }}>
                {coffeeTheme.signupTagline}
              </p>
            </div>
            <form
              onFocusCapture={(e) => {
                const t = e.target as HTMLElement;
                if (!t || !t.id) return;
                if (t.id.startsWith('signup-')) {
                  setFocusedField(t.id.replace('signup-', ''));
                }
              }}
              onBlurCapture={() => {
                // clear focus when focus leaves inputs
                setTimeout(() => {
                  const ae = document.activeElement as HTMLElement | null;
                  if (!ae || !ae.id || !ae.id.startsWith('signup-')) setFocusedField(null);
                }, 0);
              }}
              onSubmit={async (e) => {
              e.preventDefault();
              if (!verified) { alert('Please verify you are human before creating an account'); return; }
              if (password !== confirmPassword) { alert('Passwords do not match'); return; }
              
              const payload = {
                first_name: firstName,
                last_name: lastName,
                username,
                password
              };
              
              console.log('Attempting to create account with:', payload);
              
              try {
                const response = await fetch('/api/user/', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                
                const data = await response.json();
                console.log('Server response:', { status: response.status, data });
                
                if (response.ok) {
                  // Account created successfully
                  console.log('Account created:', data);
                  alert(`Account created successfully! Welcome, ${data.username}!`);
                  onClose();
                } else {
                  // Account creation failed
                  console.error('Account creation failed:', data);
                  alert(`Failed to create account: ${data.error || data.message || 'Unknown error'}`);
                }
              } catch (error) {
                console.error('Signup error:', error);
                alert('Network error. Please check your connection and try again.');
              }
            }} style={{ display: 'block', width: 'min(900px, 88vw)', margin: '0 auto' }}>
              <div style={{ marginBottom: 14 }}>
                <label htmlFor="signup-first" style={{ display: 'block', marginBottom: 8, color: coffeeTheme.text, fontSize: 14, fontWeight: 600 }}>First name</label>
                <input
                  id="signup-first"
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFirstName(v);
                    setFirstNameValid(v.trim().length > 0);
                  }}
                  onFocus={() => setFocusedField('first')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{ 
                    width: '100%', 
                    height: 52, 
                    padding: '0 18px', 
                    borderRadius: 10, 
                    background: 'rgba(255,255,255,0.85)', 
                    border: `2px solid ${firstNameValid === null ? coffeeTheme.accent : firstNameValid ? coffeeTheme.textSuccess : coffeeTheme.textError}`, 
                    color: coffeeTheme.text, 
                    fontSize: 15,
                    outline: 'none'
                  }}
                />
                {focusedField === 'first' && (
                  <div style={{ marginTop: 6 }}>
                    <span style={{ color: firstNameValid ? coffeeTheme.textSuccess : coffeeTheme.textError, fontSize: 12, fontWeight: 500 }}>Must not be empty</span>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label htmlFor="signup-last" style={{ display: 'block', marginBottom: 8, color: coffeeTheme.text, fontSize: 14, fontWeight: 600 }}>Last name</label>
                <input
                  id="signup-last"
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLastName(v);
                    setLastNameValid(v.trim().length > 0);
                  }}
                  onFocus={() => setFocusedField('last')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{ 
                    width: '100%', 
                    height: 52, 
                    padding: '0 18px', 
                    borderRadius: 10, 
                    background: 'rgba(255,255,255,0.85)', 
                    border: `2px solid ${lastNameValid === null ? coffeeTheme.accent : lastNameValid ? coffeeTheme.textSuccess : coffeeTheme.textError}`, 
                    color: coffeeTheme.text, 
                    fontSize: 15,
                    outline: 'none'
                  }}
                />
                {focusedField === 'last' && (
                  <div style={{ marginTop: 6 }}>
                    <span style={{ color: lastNameValid ? coffeeTheme.textSuccess : coffeeTheme.textError, fontSize: 12, fontWeight: 500 }}>Must not be empty</span>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label htmlFor="signup-username" style={{ display: 'block', marginBottom: 8, color: coffeeTheme.text, fontSize: 14, fontWeight: 600 }}>Username</label>
                <input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const v = e.target.value;
                    setUsername(v);
                    setUsernameValid(computeUsernameValidity(v));
                  }}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{ 
                    width: '100%', 
                    height: 52, 
                    padding: '0 18px', 
                    borderRadius: 10, 
                    background: 'rgba(255,255,255,0.85)', 
                    border: `2px solid ${usernameValid === null ? coffeeTheme.accent : usernameValid ? coffeeTheme.textSuccess : coffeeTheme.textError}`, 
                    color: coffeeTheme.text, 
                    fontSize: 15,
                    outline: 'none'
                  }}
                />
                {/* Username requirements */}
                {focusedField === 'username' && (() => {
                  const r = usernameReqs(username);
                  return (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, padding: 12, background: 'rgba(255,255,255,0.5)', borderRadius: 8 }}>
                      <span style={{ color: r.hasValue ? coffeeTheme.textSuccess : coffeeTheme.textError, fontSize: 12, fontWeight: 500 }}>✓ Must not be empty</span>
                      <span style={{ color: r.validChars ? coffeeTheme.textSuccess : coffeeTheme.textError, fontSize: 12, fontWeight: 500 }}>✓ Only letters, digits, underscores, hyphens</span>
                      <span style={{ color: r.validLength ? coffeeTheme.textSuccess : coffeeTheme.textError, fontSize: 12, fontWeight: 500 }}>✓ Less than 16 characters</span>
                      <span style={{ color: r.noProfanity ? coffeeTheme.textSuccess : coffeeTheme.textError, fontSize: 12, fontWeight: 500 }}>✓ Must not contain profanity</span>
                      <span style={{ color: r.noWhitespace ? coffeeTheme.textSuccess : coffeeTheme.textError, fontSize: 12, fontWeight: 500 }}>✓ No whitespace</span>
                    </div>
                  );
                })()}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label htmlFor="signup-password" style={{ display: 'block', marginBottom: 8, color: coffeeTheme.text, fontSize: 14, fontWeight: 600 }}>Password</label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPassword(v);
                    setPasswordValid(computePasswordValidity(v));
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{ 
                    width: '100%', 
                    height: 52, 
                    padding: '0 18px', 
                    borderRadius: 10, 
                    background: 'rgba(255,255,255,0.85)', 
                    border: `2px solid ${passwordValid === null ? coffeeTheme.accent : passwordValid ? coffeeTheme.textSuccess : coffeeTheme.textError}`, 
                    color: coffeeTheme.text, 
                    fontSize: 15,
                    outline: 'none'
                  }}
                />
                {/* Password requirements */}
                {focusedField === 'password' && (() => {
                  const r = passwordReqs(password);
                  return (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, padding: 12, background: 'rgba(255,255,255,0.5)', borderRadius: 8 }}>
                      <span style={{ color: r.hasValue ? coffeeTheme.textSuccess : coffeeTheme.textError, fontSize: 12, fontWeight: 500 }}>✓ Must not be empty</span>
                      <span style={{ color: r.validLength ? coffeeTheme.textSuccess : coffeeTheme.textError, fontSize: 12, fontWeight: 500 }}>✓ 8 to 64 characters</span>
                      <span style={{ color: r.strong ? coffeeTheme.textSuccess : coffeeTheme.textError, fontSize: 12, fontWeight: 500 }}>✓ Must contain uppercase, lowercase, digit, and symbol</span>
                      <span style={{ color: r.noWhitespace ? coffeeTheme.textSuccess : coffeeTheme.textError, fontSize: 12, fontWeight: 500 }}>✓ No whitespace</span>
                      <span style={{ color: r.validChars ? coffeeTheme.textSuccess : coffeeTheme.textError, fontSize: 12, fontWeight: 500 }}>✓ Allowed characters only (no control chars/newlines)</span>
                    </div>
                  );
                })()}
              </div>

              <div style={{ marginBottom: 18 }}>
                <label htmlFor="signup-confirm" style={{ display: 'block', marginBottom: 8, color: coffeeTheme.text, fontSize: 14, fontWeight: 600 }}>Confirm Password</label>
                <input 
                  id="signup-confirm" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => { 
                    const v = e.target.value; 
                    setConfirmPassword(v); 
                    setConfirmValid(v === password); 
                  }} 
                  onFocus={() => setFocusedField('confirm')} 
                  onBlur={() => setFocusedField(null)} 
                  required 
                  style={{ 
                    width: '100%', 
                    height: 52, 
                    padding: '0 18px', 
                    borderRadius: 10, 
                    background: 'rgba(255,255,255,0.85)', 
                    border: `2px solid ${confirmValid === null ? coffeeTheme.accent : confirmValid ? coffeeTheme.textSuccess : coffeeTheme.textError}`, 
                    color: coffeeTheme.text, 
                    fontSize: 15,
                    outline: 'none'
                  }} 
                />
                {focusedField === 'confirm' && (
                  <div style={{ marginTop: 6 }}>
                    <span style={{ color: confirmValid ? coffeeTheme.textSuccess : coffeeTheme.textError, fontSize: 12, fontWeight: 500 }}>
                      {confirmValid ? '✓ Matches password' : 'Must match password'}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setMode('verify')}
                  style={{
                    flex: 1,
                    height: 54,
                    borderRadius: 12,
                    border: '2px solid ' + coffeeTheme.accent,
                    color: verified ? '#fff' : coffeeTheme.text,
                    background: verified ? coffeeTheme.textSuccess : 'rgba(255,255,255,0.6)',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {verified ? '✓ Verified' : '🤖 Verify human'}
                </button>
                <button
                  type="submit"
                  disabled={!(usernameValid && passwordValid && firstNameValid && lastNameValid && confirmValid && verified)}
                  style={{ 
                    flex: 1, 
                    height: 54, 
                    borderRadius: 12, 
                    background: `linear-gradient(135deg, ${coffeeTheme.primary} 0%, #2a2420 100%)`, 
                    border: 'none', 
                    color: coffeeTheme.background, 
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: !(usernameValid && passwordValid && firstNameValid && lastNameValid && confirmValid && verified) ? 'not-allowed' : 'pointer',
                    opacity: !(usernameValid && passwordValid && firstNameValid && lastNameValid && confirmValid && verified) ? 0.5 : 1,
                    boxShadow: '0 4px 12px rgba(20,18,15,0.3)'
                  }}
                >
                  {coffeeTheme.createButtonText}
                </button>
              </div>

              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <button 
                  type="button" 
                  onClick={() => setMode('login')} 
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: coffeeTheme.textLight, 
                    textDecoration: 'underline', 
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  {currentTheme === 'scifi' ? '🚀 Already onboard? Return to base' : currentTheme === 'westcoast' ? '🌅 Already cruising? Head back to the beach' : '☕ Back to Login'}
                </button>
              </div>
            </form>
          </>
        )}

        {mode === 'verify' && (
          <div style={{ 
            width: '100%', 
            maxWidth: 500, 
            margin: '0 auto', 
            padding: 32, 
            background: 'rgba(255,255,255,0.6)', 
            border: `3px solid ${coffeeTheme.accent}`, 
            borderRadius: 20,
            boxShadow: '0 8px 24px rgba(20,18,15,0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🤖</div>
              <h3 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 6, color: coffeeTheme.primary }}>
                Human Verification
              </h3>
              <p style={{ textAlign: 'center', color: coffeeTheme.textLight, fontSize: 15, fontStyle: 'italic' }}>
                Prove you're not a robot (even though we love robots ☕)
              </p>
            </div>
            
            <div style={{ 
              background: `linear-gradient(135deg, ${coffeeTheme.primary} 0%, #2a2420 100%)`, 
              padding: 20, 
              borderRadius: 12, 
              marginBottom: 16,
              textAlign: 'center'
            }}>
              <p style={{ color: coffeeTheme.background, fontSize: 18, fontWeight: 600 }}>Type: 67</p>
            </div>
            
            <input
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              placeholder="Enter 67"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (verifyInput.trim() === '67') {
                    setVerified(true);
                    setMode('signup');
                    setVerifyInput('');
                  } else {
                    alert('Verification failed — please type 67');
                  }
                }
              }}
              style={{ 
                width: '100%', 
                height: 52, 
                padding: '0 18px', 
                borderRadius: 10, 
                background: 'rgba(255,255,255,0.9)', 
                border: `2px solid ${coffeeTheme.accent}`, 
                color: coffeeTheme.text, 
                fontSize: 16,
                marginBottom: 16,
                textAlign: 'center',
                fontWeight: 600,
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
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
                style={{ 
                  flex: 1, 
                  height: 52, 
                  borderRadius: 10, 
                  background: `linear-gradient(135deg, ${coffeeTheme.primary} 0%, #2a2420 100%)`, 
                  color: coffeeTheme.background,
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(20,18,15,0.3)'
                }}
              >
                ✓ Submit
              </button>
              <button 
                type="button" 
                onClick={() => { setMode('signup'); setVerifyInput(''); }} 
                style={{ 
                  flex: 1, 
                  height: 52, 
                  borderRadius: 10, 
                  background: 'rgba(255,255,255,0.7)', 
                  color: coffeeTheme.text, 
                  border: `2px solid ${coffeeTheme.accent}`,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer'
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
