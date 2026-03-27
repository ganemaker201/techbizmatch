import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onPlayerCreated }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onPlayerCreated(data);
      navigate('/waiting');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col items-center justify-center p-6 overflow-x-hidden">
      <main className="w-full max-w-lg flex flex-col items-center space-y-10 relative">
        {/* Mascot Overlay */}
        <div className="relative w-full flex justify-center mb-4">
          <div className="absolute -top-12 -right-4 z-10 w-32 h-32 transform rotate-12">
            <img
              alt="Piggy Mascot"
              className="w-full h-full object-contain filter drop-shadow-xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6ad9SMDmgqCwEcJIWT_6O6lLKbY9HeJcxDWevhTBrS9r0Qdg381GgDH0fJEWg-abam8kBHdolQWgXvI1RIrleR7CVnq8WkaIvhAcvGRQ34chsLlSzYeZgxO6YkYDKdlbEEwftN1VohOLeCiWZD9UKKRTGtKu4YI1DzQqrNTjQAdMIjW63QPjuetPJcvF7cZs4Trqe9Y6WEkBHXrWeV18jnwVXHEzdL0XwCkgKPH-RAUCimpexfPYK7oq094Lm_3Gc6iBVvmpXuU8"
            />
          </div>
          <div className="text-center z-0">
            <h1 className="font-headline font-black italic text-6xl text-primary tracking-tighter mb-2">
              EconoKids
            </h1>
            <p className="font-body font-bold text-secondary text-lg">
              Where saving is a superpower! 🚀
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full bg-surface-container-lowest p-8 rounded-xl space-y-6 relative shadow-[0_8px_0_0_rgba(0,0,0,0.05)]"
        >
          <h2 className="font-headline font-extrabold text-3xl text-primary tracking-tight text-center">Welcome Back!</h2>

          <div className="space-y-2">
            <label className="block font-bold text-on-secondary-container ml-2" htmlFor="login-name">
              Player Name
            </label>
            <input
              id="login-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="SuperStar2024"
              required
              className="w-full h-16 px-6 rounded-xl bg-surface-container-low border-2 border-outline-variant/20 focus:border-primary focus:ring-4 focus:ring-primary-container/30 transition-all outline-none text-lg font-medium placeholder:text-outline-variant/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-on-secondary-container ml-2" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-16 px-6 rounded-xl bg-surface-container-low border-2 border-outline-variant/20 focus:border-primary focus:ring-4 focus:ring-primary-container/30 transition-all outline-none text-lg font-medium placeholder:text-outline-variant/50"
            />
          </div>

          {error && (
            <div className="bg-error/10 text-error px-4 py-3 rounded-xl font-bold text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim() || !password}
            className="w-full h-16 bg-primary text-on-primary font-headline font-extrabold text-xl rounded-xl chunky-shadow-primary transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'LOGGING IN...' : 'LOG IN!'} 🎮
          </button>
        </form>

        {/* Signup link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
          >
            Don't have an account? Sign up! 🚀
          </button>
        </div>

        <footer className="text-center space-y-4 pt-4">
          <div className="flex items-center justify-center space-x-2 text-outline">
            <span className="text-lg">🛡️</span>
            <span className="font-label text-xs font-bold">KID-SAFE & AD-FREE ENVIRONMENT</span>
          </div>
        </footer>
      </main>

      <div className="fixed -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="fixed -top-20 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}
