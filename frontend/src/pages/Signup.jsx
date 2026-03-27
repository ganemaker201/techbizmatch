import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AVATARS } from '../avatars.jsx';

export default function Signup({ onPlayerCreated }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('piggy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password, avatar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      onPlayerCreated(data);
      navigate('/waiting');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center px-6 h-20 bg-surface shadow-[0_4px_0_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="p-2 rounded-full hover:bg-white/50 transition-colors active:translate-y-0.5"
          >
            <span className="text-2xl">⬅️</span>
          </button>
          <h1 className="font-headline font-bold text-2xl tracking-tight text-primary">Start Your Adventure</h1>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center pt-28 pb-12 px-6">
        <div className="max-w-md w-full relative">
          {/* Mascot */}
          <div className="absolute -top-16 -right-8 w-24 h-24 z-10 hidden md:block">
            <img
              alt="EconoKids Mascot"
              className="w-full h-full drop-shadow-lg transform rotate-12"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3t486Wj3ujRX4K3umZH8QDbQctRdLNceeyqHXcOwm5Lav_OZMNlJeuEJSwcSPRo9ni2aRS8GarHM3eZeangHll-w7rrbMEQV6ZPsCOnhPEUQAYtm7UwpfAnY_sjOwLE7mRDn9Z_oYcArn1-cCbHuxofCsLOKPL__VoTQDMQwPh-s9WDheuVgZKoBQik-SlfMfe1A7iIAwH-WWtDrI_qp1UgPTuNEQIe843d7ZaRKpZ8DCEnW54q1LvQ5QoIVUojz5Z9sydjiMV-w"
            />
          </div>

          {/* Content Canvas */}
          <div className="bg-surface-container-low rounded-xl p-8 md:p-10 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="font-headline font-extrabold text-4xl text-primary tracking-tight">Create Your Account</h2>
              <p className="text-on-surface-variant font-medium">Join the fun and start earning XP!</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block font-bold text-on-secondary-container ml-2" htmlFor="player-name">
                  Choose a Player Name
                </label>
                <input
                  id="player-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="SuperStar2024"
                  required
                  className="w-full h-16 px-6 rounded-xl bg-surface-container-lowest border-2 border-outline-variant/20 focus:border-primary focus:ring-4 focus:ring-primary-container/30 transition-all outline-none text-lg font-medium placeholder:text-outline-variant/50"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-on-secondary-container ml-2" htmlFor="password">
                  Create a Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-16 px-6 rounded-xl bg-surface-container-lowest border-2 border-outline-variant/20 focus:border-primary focus:ring-4 focus:ring-primary-container/30 transition-all outline-none text-lg font-medium placeholder:text-outline-variant/50"
                />
              </div>

              {/* Avatar Selection */}
              <div className="space-y-3">
                <label className="block font-bold text-on-secondary-container ml-2">Pick your Hero!</label>
                <div className="grid grid-cols-4 gap-3">
                  {AVATARS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAvatar(a.id)}
                      className={`flex flex-col items-center p-3 rounded-lg border-b-4 transition-all active:translate-y-1 active:border-b-0 ${
                        avatar === a.id
                          ? 'bg-primary-container/20 border-primary ring-2 ring-primary'
                          : 'bg-surface border-surface-dim hover:bg-surface-container-low'
                      }`}
                    >
                      <div className={`w-14 h-14 mb-1 flex items-center justify-center ${a.bgColor} rounded-full shadow-inner border-2 ${a.borderColor}`}>
                        <span className="text-3xl">{a.emoji}</span>
                      </div>
                      <span className="font-headline font-bold text-xs text-on-surface">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-error/10 text-error px-4 py-3 rounded-xl font-bold text-center">
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !name.trim() || !password}
                  className="w-full h-16 bg-primary text-on-primary font-headline font-extrabold text-xl rounded-xl chunky-shadow-primary transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'CREATING...' : 'SIGN UP!'} 🚀
                </button>
              </div>
            </form>

            {/* Mobile mascot */}
            <div className="flex justify-center md:hidden pt-4">
              <div className="bg-secondary-container p-4 rounded-full">
                <span className="text-4xl">🐷</span>
              </div>
            </div>
          </div>

          {/* Login link */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
            >
              Already have an account? Log in ➡️
            </button>
          </div>
        </div>
      </main>

      {/* Bottom decoration */}
      <div className="h-24 w-full bg-surface-container-high flex items-end justify-center overflow-hidden">
        <div className="flex gap-4 opacity-10 mb-[-1rem] text-8xl">
          <span>💵</span><span>🪙</span><span>🏦</span><span>🛍️</span><span>⭐</span>
        </div>
      </div>

      <footer className="bg-transparent w-full py-8 flex justify-center items-center">
        <div className="text-secondary font-body text-sm opacity-80">
          © 2024 The Tactile Playground
        </div>
      </footer>
    </div>
  );
}
