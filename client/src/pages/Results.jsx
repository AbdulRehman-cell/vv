import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract results passed from the QuizArena component state
  // Fallbacks provided to guarantee no rendering crashes
  const {
    score = 8,
    totalQuestions = 10,
    categoryName = 'Retro-Futurism',
    categorySlug = 'retro-futurism',
    timeTaken = 42,
    answersLog = [] // array of { questionText, chosenOption, correctOption, correctText, chosenText, isCorrect, explanation }
  } = location.state || {};

  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [recentScores, setRecentScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(true);

  // Calculate high-fidelity performance metrics
  const accuracy = Math.round((score / totalQuestions) * 100);
  const avgTime = (timeTaken / totalQuestions).toFixed(1);
  
  // Assign a dynamic high-contrast cognitive tier
  let cognitiveTier = 'D-Tier (Synaptic Delay)';
  let tierColor = '#FF2E93';
  let tierDesc = 'Your neurons fired sluggishly. Train your cognitive reflexes and attempt to break the barrier again.';
  
  if (accuracy >= 90) {
    cognitiveTier = 'S-Tier (Chronos Conqueror)';
    tierColor = '#00F0FF';
    tierDesc = 'Godlike reaction times paired with perfect retrieval. Your synapses operate at absolute lightspeed.';
  } else if (accuracy >= 75) {
    cognitiveTier = 'A-Tier (Neural Striker)';
    tierColor = '#FFD200';
    tierDesc = 'Highly optimized processor. Barely any hesitation, crushing the clock under intense pressure.';
  } else if (accuracy >= 50) {
    cognitiveTier = 'B-Tier (Active Spark)';
    tierColor = '#38ef7d';
    tierDesc = 'Competent cognitive standard. With slightly faster pattern recognition you will reach elite tier.';
  } else if (accuracy >= 30) {
    cognitiveTier = 'C-Tier (System Warning)';
    tierColor = '#ff9f43';
    tierDesc = 'Inconsistent speed. The 15-second countdown fractured your composure. Re-enter the arena.';
  }

  // Fetch recent scores in this category to show competitive standing
  useEffect(() => {
    let active = true;
    const fetchScores = async () => {
      try {
        const res = await axios.get('/api/scores');
        if (active) {
          // Filter scores for the current category and sort high-to-low
          const filtered = res.data
            .filter(s => s.category === categorySlug)
            .sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken)
            .slice(0, 5);
          setRecentScores(filtered);
          setLoadingScores(false);
        }
      } catch (err) {
        console.error('Error fetching leaderboard scores:', err);
        if (active) setLoadingScores(false);
      }
    };
    fetchScores();
    return () => { active = false; };
  }, [categorySlug]);

  // Handle score submission to the Leaderboard database
  const handleSaveScore = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setSaveError('Please enter a username to claim your spot.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const payload = {
        username: username.trim(),
        category: categorySlug,
        score: score,
        timeTaken: timeTaken,
        date: new Date()
      };
      
      await axios.post('/api/scores', payload);
      setSaveSuccess(true);
      setIsSaving(false);
      
      // Refresh leaderboard listing dynamically
      const res = await axios.get('/api/scores');
      const filtered = res.data
        .filter(s => s.category === categorySlug)
        .sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken)
        .slice(0, 5);
      setRecentScores(filtered);
    } catch (err) {
      console.error('Failed to commit score to mainframe:', err);
      setSaveError('Mainframe submission failed. Try again or check connectivity.');
      setIsSaving(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '6rem' }}>
      
      {/* Session Terminated compact Hero */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden', padding: '3rem 2rem', marginBottom: '2.5rem' }}>
        <img className="hero-bg" src="https://picsum.photos/seed/resultshero/1200/400" alt="Cybernetic Interface Background" style={{ filter: 'brightness(0.2) contrast(1.2)' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <span className="eyebrow" style={{ color: 'var(--secondary)', letterSpacing: '2px', fontWeight: '700' }}>SESSION TERMINATED</span>
          <h1 style={{ marginTop: '0.5rem' }}>
            BrainSnap <span className="gradient-text">Complete</span>
          </h1>
          <p className="hero-subtitle" style={{ maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            Telemetry parsed. Your cognitive breakdown in {categoryName || 'Active Sector'} has been compiled below.
          </p>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
        
        {/* Section 1: Dynamic Performance Diagnostics */}
        <section className="section" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2.5rem' }}>
          <div className="section-head" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)', paddingLeft: '1rem' }}>
            <span className="eyebrow">DIAGNOSTIC TELEMETRY</span>
            <h2 style={{ fontSize: '1.8rem', margin: '0.2rem 0' }}>The Cognitive Diagnosis</h2>
          </div>

          {/* Big Score Board */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border)' }}>
              <span className="stat-label" style={{ color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>ACCURACY INDEX</span>
              <div className="stat-value" style={{ fontSize: '2.5rem', color: 'var(--primary)', fontWeight: '700', margin: '0.5rem 0' }}>{accuracy}%</div>
              <span className="pill" style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--primary)', fontSize: '0.8rem', padding: '4px 10px' }}>
                {score} / {totalQuestions} Correct
              </span>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border)' }}>
              <span className="stat-label" style={{ color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>COGNITIVE TIER</span>
              <div className="stat-value" style={{ fontSize: '1.5rem', color: tierColor, fontWeight: '700', margin: '1rem 0' }}>
                {cognitiveTier}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: 0 }}>{tierDesc}</p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border)' }}>
              <span className="stat-label" style={{ color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>VELOCITY METRIC</span>
              <div className="stat-value" style={{ fontSize: '2.5rem', color: 'var(--secondary)', fontWeight: '700', margin: '0.5rem 0' }}>{avgTime}s</div>
              <span className="pill" style={{ background: 'rgba(255, 46, 147, 0.1)', color: 'var(--secondary)', fontSize: '0.8rem', padding: '4px 10px' }}>
                Total: {timeTaken}s elapsed
              </span>
            </div>
          </div>

          {/* Leaderboard Submission Form */}
          <div style={{ background: 'var(--surface-2)', padding: '2rem', borderRadius: '8px', border: '1px solid rgba(255, 46, 147, 0.2)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--secondary)' }}>⚡</span> Lock In Your Score
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
              Upload your accuracy and response times to the persistent global sector mainframe.
            </p>

            {saveSuccess ? (
              <div className="alert alert-success" style={{ padding: '1.2rem', borderRadius: '6px', background: 'rgba(56, 239, 125, 0.1)', border: '1px solid #38ef7d', color: '#38ef7d' }}>
                <h4 style={{ margin: '0 0 0.3rem 0', fontWeight: '700' }}>✓ score registered in mainframe</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Your performance has been forever mapped to the {categoryName} leaderboards.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveScore} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 280px' }}>
                  <label htmlFor="username" style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', color: 'var(--muted)' }}>
                    SYNAPSE OPERATOR HANDLE
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter operator name (e.g. CYBER_STRIKER)"
                    maxLength={20}
                    style={{
                      width: '100%',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      padding: '12px',
                      borderRadius: '4px',
                      color: 'var(--text)',
                      fontFamily: '"Space Grotesk", sans-serif'
                    }}
                    disabled={isSaving}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                  style={{ height: '48px', padding: '0 2rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}
                >
                  {isSaving ? 'Uploading...' : 'Transmit Score'}
                </button>
              </form>
            )}

            {saveError && (
              <div className="alert alert-error" style={{ marginTop: '1rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                ⚠️ {saveError}
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Mistake Review (The Post-Mortem) */}
        {answersLog && answersLog.length > 0 && (
          <section className="section" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2.5rem' }}>
            <div className="section-head" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--secondary)', paddingLeft: '1rem' }}>
              <span className="eyebrow" style={{ color: 'var(--secondary)' }}>POST-MORTEM</span>
              <h2 style={{ fontSize: '1.8rem', margin: '0.2rem 0' }}>Where Your Synapses Fired</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                A direct breakdown of each choice under clock stress. Analyze the anomalies.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {answersLog.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--surface-2)',
                    borderLeft: `4px solid ${log.isCorrect ? '#38ef7d' : 'var(--secondary)'}`,
                    borderRadius: '0 8px 8px 0',
                    padding: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.8rem' }}>
                    <span style={{ fontWeight: '700', fontFamily: '"Space Grotesk", sans-serif', color: 'var(--muted)', fontSize: '0.9rem' }}>
                      QUESTION {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        background: log.isCorrect ? 'rgba(56, 239, 125, 0.15)' : 'rgba(255, 46, 147, 0.15)',
                        color: log.isCorrect ? '#38ef7d' : 'var(--secondary)'
                      }}
                    >
                      {log.isCorrect ? 'Correct' : 'Misfire'}
                    </span>
                  </div>
                  
                  <p style={{ margin: '0 0 1rem 0', fontWeight: '600', fontSize: '1.05rem', color: 'var(--text)' }}>
                    {log.questionText}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                    <div style={{ padding: '0.8rem', borderRadius: '4px', background: 'rgba(11, 14, 20, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>YOUR SELECTION</span>
                      <span style={{ color: log.isCorrect ? '#38ef7d' : 'var(--secondary)', fontWeight: '600' }}>
                        {log.chosenText || 'No Answer (Timed Out)'}
                      </span>
                    </div>

                    {!log.isCorrect && (
                      <div style={{ padding: '0.8rem', borderRadius: '4px', background: 'rgba(11, 14, 20, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>CORRECT ANSWER</span>
                        <span style={{ color: '#38ef7d', fontWeight: '600' }}>
                          {log.correctText}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Sector Standings & Arena Exit */}
        <section className="section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          
          {/* Column A: Sector Leaderboard Standings */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem' }}>
            <span className="eyebrow" style={{ color: 'var(--accent)' }}>SECTOR STANDINGS</span>
            <h3 style={{ marginTop: '0.2rem', marginBottom: '1.5rem', fontSize: '1.4rem' }}>{categoryName} Elite</h3>

            {loadingScores ? (
              <div className="skeleton-text" style={{ height: '120px' }}>Analyzing mainframe rankings...</div>
            ) : recentScores.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No scores filed for this sector yet. Be the first!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {recentScores.map((sc, index) => (
                  <div
                    key={sc._id || index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.8rem 1rem',
                      background: index === 0 ? 'rgba(0, 240, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                      border: index === 0 ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: index === 0 ? 'var(--primary)' : 'var(--surface-2)',
                        color: index === 0 ? 'var(--bg)' : 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '0.8rem'
                      }}>
                        {index + 1}
                      </span>
                      <span style={{ fontWeight: '600', color: 'var(--text)' }}>{sc.username}</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: '700', marginRight: '8px' }}>{sc.score}/10</span>
                      <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{sc.timeTaken}s</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column B: Next Destination Action Portal */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="eyebrow">RE-ENTRY GATEWAY</span>
              <h3 style={{ marginTop: '0.2rem', marginBottom: '1rem', fontSize: '1.4rem' }}>Defy the clock again?</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Composure and speed improve with exposure. Re-enter the {categoryName} arena instantly to burn your previous record, or retreat to selection matrix to test other vectors.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={() => navigate(`/quiz/${categorySlug}`)}
                className="btn btn-primary"
                style={{ width: '100%', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}
              >
                Defy the Clock Again
              </button>
              
              <Link
                to="/"
                className="btn btn-secondary"
                style={{ width: '100%', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', textAlign: 'center' }}
              >
                Select Different Arena
              </Link>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}