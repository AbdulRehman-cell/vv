import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import QuizArena from './pages/QuizArena';
import Results from './pages/Results';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [liveTicker, setLiveTicker] = useState({
    activePlayers: 124,
    totalSnapsToday: 342912,
    survivalRate: '41.2%'
  });

  const location = useLocation();

  // Simulate subtle real-time updates for the high-velocity vibe
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTicker(prev => ({
        activePlayers: prev.activePlayers + (Math.random() > 0.5 ? 1 : -1),
        totalSnapsToday: prev.totalSnapsToday + Math.floor(Math.random() * 3) + 1,
        survivalRate: prev.survivalRate
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Premium Navigation Header */}
      <header className="header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(11, 14, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem 2rem'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Brand Logo with Electric Theme */}
          <Link to="/" className="brand" style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              color: 'var(--bg)',
              fontWeight: 700,
              fontSize: '1.2rem',
              padding: '4px 10px',
              borderRadius: '4px',
              fontFamily: '"Space Grotesk", sans-serif',
              letterSpacing: '1px',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
            }}>
              vv
            </span>
            <span style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'var(--text)',
              letterSpacing: '-0.5px'
            }}>
              Brain<span style={{ color: 'var(--primary)' }}>Snap</span>
            </span>
          </Link>

          {/* Live Status Ticker Pill */}
          <div className="ticker-pill" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: '"Space Grotesk", sans-serif'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-dot" style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--primary)',
                boxShadow: '0 0 8px var(--primary)'
              }}></span>
              {liveTicker.activePlayers} ONLINE
            </span>
            <span style={{ color: 'var(--muted)' }}>|</span>
            <span>{liveTicker.totalSnapsToday.toLocaleString()} SNAPS TODAY</span>
          </div>

          {/* Navigation Links (Admin Command Link Hidden per Requirements) */}
          <nav className="nav" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link 
              to="/" 
              style={{
                color: location.pathname === '/' ? 'var(--primary)' : 'var(--text)',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                borderBottom: location.pathname === '/' ? '2px solid var(--primary)' : '2px solid transparent',
                paddingBottom: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              Arena Gate
            </Link>
            <Link to="/" className="btn btn-primary" style={{
              padding: '6px 16px',
              fontSize: '0.85rem',
              borderRadius: '4px',
              boxShadow: '0 0 10px rgba(0, 240, 255, 0.25)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Initiate Snap
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz/:categorySlug" element={<QuizArena />} />
          <Route path="/results" element={<Results />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      {/* Retro-Futuristic Footer */}
      <footer style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '3rem 0',
        marginTop: 'auto'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="grid grid-3" style={{ gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--text)', marginBottom: '1rem' }}>
                Brain<span style={{ color: 'var(--primary)' }}>Snap</span>
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                The high-velocity cognitive arena where trivia is a full-contact intellectual sport. Defy the clock. Dominate the leaderboard.
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem' }}>
                Sectors Active
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><Link to="/quiz/pop-culture" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Pop Culture</Link></li>
                <li><Link to="/quiz/science" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Science & Tech</Link></li>
                <li><Link to="/quiz/history" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Alternate History</Link></li>
                <li><Link to="/quiz/gaming" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Cyber Gaming</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--secondary)', marginBottom: '1rem', fontSize: '1rem' }}>
                Telemetry Info
              </h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Average network latency: <span style={{ color: 'var(--primary)' }}>12ms</span><br />
                Cognitive database health: <span style={{ color: 'var(--accent)' }}>99.98%</span><br />
                System version: <span style={{ color: 'var(--text)' }}>vv-1.2.0-stable</span>
              </p>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--muted)'
          }}>
            <span>© {new Date().getFullYear()} BRAINSNAP. All synapses intact.</span>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span style={{ cursor: 'pointer' }}>Terminal Protocol</span>
              <span style={{ cursor: 'pointer' }}>Reflex Standard</span>
              <span style={{ color: 'var(--primary)' }}>Secure Connection Active [AES-256]</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}