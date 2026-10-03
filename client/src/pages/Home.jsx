import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const navigate = useNavigate();
  
  // State variables
  const [categories, setCategories] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  
  // Interactive Warmup Sandbox State
  const [warmupStep, setWarmupStep] = useState(0); // 0: start, 1: Q1, 2: Q2, 3: Q3, 4: score
  const [warmupAnswers, setWarmupAnswers] = useState([]);
  const [warmupTimer, setWarmupTimer] = useState(15);
  const [usernameInput, setUsernameInput] = useState('');
  const [fastPlayCategory, setFastPlayCategory] = useState('');

  // Sandbox Hardcoded Questions
  const warmupQuestions = [
    {
      text: "Which early computer used vacuum tubes and weighed over 27 tons?",
      options: ["UNIVAC I", "ENIAC", "IBM 701", "Colossus"],
      correct: 1,
      explanation: "ENIAC (Electronic Numerical Integrator and Computer) was completed in 1945 and was the first programmable, electronic, general-purpose digital computer."
    },
    {
      text: "In cyberpunk lore, what term is commonly used for the global information network?",
      options: ["The Grid", "The Matrix", "The Ether", "Netspace"],
      correct: 1,
      explanation: "Popularized by William Gibson's Neuromancer, 'The Matrix' is the original consensual hallucination of cyberspace."
    },
    {
      text: "Which physical particle is often referred to as the 'God Particle'?",
      options: ["Higgs Boson", "Neutrino", "Quark", "Muon"],
      correct: 0,
      explanation: "The Higgs Boson grants mass to other particles, hence its sensationalist nickname."
    }
  ];

  // Fetch real data from server with fallback seeds
  useEffect(() => {
    async function fetchData() {
      try {
        const catRes = await axios.get('/api/categories');
        if (catRes.data && catRes.data.length > 0) {
          setCategories(catRes.data);
          setFastPlayCategory(catRes.data[0].slug);
        } else {
          // Fallbacks if DB is empty initially
          const mockCategories = [
            { name: "Science & Cybernetics", slug: "science", description: "Quantum states, bio-hacking, and deep space telemetry.", icon: "science", color: "#00F0FF" },
            { name: "Retro-Futurism", slug: "retro-futurism", description: "Neon nostalgia, vintage computing, and 80s arcade lore.", icon: "videogame_asset", color: "#FF2E93" },
            { name: "Global Chronicles", slug: "history", description: "Epochs of human struggle, tactical warfare, and lost civilizations.", icon: "history", color: "#FFD200" },
            { name: "Pop Tech & Gaming", slug: "pop-culture", description: "Meme history, legendary source code, and esports trivia.", icon: "terminal", color: "#00FF66" }
          ];
          setCategories(mockCategories);
          setFastPlayCategory("retro-futurism");
        }
      } catch (err) {
        console.error("Failed to fetch categories, using default presets", err);
        setCategories([
          { name: "Science & Cybernetics", slug: "science", description: "Quantum states, bio-hacking, and deep space telemetry.", icon: "science", color: "#00F0FF" },
          { name: "Retro-Futurism", slug: "retro-futurism", description: "Neon nostalgia, vintage computing, and 80s arcade lore.", icon: "videogame_asset", color: "#FF2E93" }
        ]);
        setFastPlayCategory("retro-futurism");
      } finally {
        setLoadingCategories(false);
      }

      try {
        const scoresRes = await axios.get('/api/scores');
        if (scoresRes.data && scoresRes.data.length > 0) {
          // Sort by score high-to-low, then time low-to-high
          const sorted = [...scoresRes.data].sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.timeTaken - b.timeTaken;
          });
          setLeaderboard(sorted.slice(0, 5));
        } else {
          setLeaderboard([]);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard scores", err);
        setLeaderboard([]);
      } finally {
        setLoadingLeaderboard(false);
      }
    }
    fetchData();
  }, []);

  // Sandbox Countdown Timer Effect
  useEffect(() => {
    let timerId;
    if (warmupStep >= 1 && warmupStep <= 3) {
      setWarmupTimer(15);
      timerId = setInterval(() => {
        setWarmupTimer((prev) => {
          if (prev <= 1) {
            // Auto force-answer wrong when timer hits 0
            handleWarmupAnswer(-1);
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [warmupStep]);

  // Handle a warm-up click response
  const handleWarmupAnswer = (optionIdx) => {
    setWarmupAnswers((prev) => [...prev, optionIdx]);
    setWarmupStep((prev) => prev + 1);
  };

  const resetWarmup = () => {
    setWarmupAnswers([]);
    setWarmupStep(0);
    setWarmupTimer(15);
  };

  const startActualQuiz = (slug) => {
    const finalUsername = usernameInput.trim() || "GuestPlayer";
    localStorage.setItem("brainsnap_username", finalUsername);
    navigate(`/quiz/${slug}`);
  };

  const scoreCount = warmupAnswers.filter(
    (ans, idx) => ans === warmupQuestions[idx].correct
  ).length;

  return (
    <div className="home-page">
      {/* SECTION 1: HERO (Synaptic Ignition) */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <img 
          className="hero-bg" 
          src="https://picsum.photos/seed/cyberneon77/1600/900" 
          alt="Neon cyber terminal" 
          style={{ opacity: 0.25, filter: 'grayscale(30%) contrast(120%)' }}
        />
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <span className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 700, letterSpacing: '2px' }}>
            ⚡ SYNAPTIC ARCADE ACTIVE
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, margin: '1rem 0 1.5rem' }}>
            Your cognitive playground has a <span className="gradient-text">15-second fuse.</span>
          </h1>
          <p className="hero-subtitle" style={{ color: 'var(--text)', opacity: 0.9, maxWidth: '750px', marginBottom: '2.5rem', fontSize: '1.2rem' }}>
            An electric, high-velocity trivia arena designed to stress-test your cognitive reflexes and crown the ultra-intellectual. Shock your system. Dominate the clock.
          </p>

          <div className="booking-card" style={{ 
            background: 'var(--surface-2)', 
            border: '2px solid var(--primary)', 
            boxShadow: '0 0 25px rgba(0, 240, 255, 0.2)',
            padding: '2rem', 
            borderRadius: '12px',
            maxWidth: '650px',
            marginBottom: '3rem'
          }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', marginTop: 0 }}>Instant Entry Terminal</h3>
            <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                  Choose Your Codex Name
                </label>
                <input 
                  type="text" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. NeoThinker99" 
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    borderRadius: '4px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                  Select Arena Sector
                </label>
                <select 
                  value={fastPlayCategory}
                  onChange={(e) => setFastPlayCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    borderRadius: '4px',
                    fontFamily: 'inherit'
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={() => startActualQuiz(fastPlayCategory)}
              className="btn btn-primary" 
              style={{ width: '100%', display: 'block', textAlign: 'center', fontSize: '1.1rem', padding: '1rem' }}
            >
              🚀 INITIATE BRAINSNAP
            </button>
          </div>

          <div className="hero-actions" style={{ display: 'flex', gap: '1rem' }}>
            <a href="#arenas" className="btn btn-secondary">Explore Sectors</a>
            <a href="#sandbox" className="btn btn-ghost">Warm-up Sandbox ↓</a>
          </div>
        </div>
      </section>

      {/* SECTION 2: LIVE STATS DASHBOARD (The Pulse) */}
      <section className="section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '3rem 0' }}>
        <div className="container">
          <div className="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            <div className="stat-card" style={{ textAlign: 'center', padding: '1.5rem', borderLeft: '3px solid var(--primary)' }}>
              <div className="stat-value" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--primary)' }}>342,912+</div>
              <div className="stat-label" style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Snaps Completed Today</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center', padding: '1.5rem', borderLeft: '3px solid var(--secondary)' }}>
              <div className="stat-value" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--secondary)' }}>41.2%</div>
              <div className="stat-label" style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Average Survival Rate</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center', padding: '1.5rem', borderLeft: '3px solid var(--accent)' }}>
              <div className="stat-value" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent)' }}>15.0s</div>
              <div className="stat-label" style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Strict Fuse Duration</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center', padding: '1.5rem', borderLeft: '3px solid #00FF66' }}>
              <div className="stat-value" style={{ fontSize: '3rem', fontWeight: 700, color: '#00FF66' }}>$0.00</div>
              <div className="stat-label" style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Always Free to Dominate</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CATEGORY MATRIX (Select Your Arena) */}
      <section id="arenas" className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-head" style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1.5rem', marginBottom: '3rem' }}>
            <span className="eyebrow" style={{ color: 'var(--secondary)' }}>CHOOSE YOUR BATTLEGROUND</span>
            <h2 style={{ marginTop: '0.5rem' }}>Active Sectors</h2>
            <p style={{ color: 'var(--muted)', maxWidth: '600px' }}>
              Every sector contains rapid-fire 10-question gauntlets. Zero filler. Pure, unadulterated trivia adrenaline.
            </p>
          </div>

          {loadingCategories ? (
            <div className="skeleton skeleton-card" style={{ height: '300px' }}></div>
          ) : (
            <div className="grid grid-3" style={{ gap: '2rem' }}>
              {categories.map((cat, idx) => (
                <div 
                  key={cat.slug || idx} 
                  className="card reveal" 
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: `rgba(${cat.color === '#FF2E93' ? '255, 46, 147' : '0, 240, 255'}, 0.1)`,
                      border: `1px solid ${cat.color || 'var(--primary)'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      marginBottom: '1.5rem',
                      color: cat.color || 'var(--primary)'
                    }}>
                      ⚡
                    </div>
                    <h3 style={{ marginTop: 0, color: 'var(--text)' }}>{cat.name}</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.95rem', minHeight: '60px' }}>
                      {cat.description || "Synthesizing deep knowledge queries under intense clock pressure."}
                    </p>
                  </div>

                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Questions: <strong style={{ color: 'var(--text)' }}>10</strong></span>
                    <button 
                      onClick={() => startActualQuiz(cat.slug)}
                      className="btn btn-ghost" 
                      style={{ padding: '4px 12px', fontSize: '0.85rem', color: cat.color || 'var(--primary)', borderColor: cat.color || 'var(--primary)' }}
                    >
                      Connect Arena →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: INTERACTIVE SANDBOX (The Warmup) */}
      <section id="sandbox" className="section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="section-head" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="eyebrow" style={{ color: 'var(--accent)' }}>ZERO PREP DIRECT TRIAL</span>
            <h2>Reflex Warm-up Sandbox</h2>
            <p style={{ color: 'var(--muted)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Prove you belong on the main stage. Try our interactive 3-question sandbox directly below.
            </p>
          </div>

          <div className="card" style={{ 
            background: 'var(--bg)', 
            border: '2px dashed var(--border)', 
            padding: '2.5rem', 
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            position: 'relative'
          }}>
            {/* Countdown bar if active */}
            {warmupStep >= 1 && warmupStep <= 3 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '4px',
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                width: `${(warmupTimer / 15) * 100}%`,
                transition: 'width 1s linear'
              }} />
            )}

            {warmupStep === 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👾</div>
                <h3 style={{ marginTop: 0 }}>Synaptic Probe Active</h3>
                <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
                  You have exactly 15 seconds per question. Once you lock in an answer, you advance immediately. No going back.
                </p>
                <button 
                  onClick={() => setWarmupStep(1)} 
                  className="btn btn-primary"
                  style={{ minWidth: '200px' }}
                >
                  ⚡ Start Warmup (3 Qs)
                </button>
              </div>
            )}

            {warmupStep >= 1 && warmupStep <= 3 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Warm-up Phase Q{warmupStep} of 3
                  </span>
                  <span style={{ 
                    fontFamily: '"Space Grotesk", sans-serif', 
                    fontWeight: 700, 
                    color: warmupTimer <= 5 ? 'var(--secondary)' : 'var(--primary)',
                    background: 'rgba(0,0,0,0.4)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid currentColor'
                  }}>
                    ⏱️ {warmupTimer}s
                  </span>
                </div>

                <h3 style={{ marginBottom: '2rem', minHeight: '60px', color: 'var(--text)' }}>
                  {warmupQuestions[warmupStep - 1].text}
                </h3>

                <div className="grid grid-2" style={{ gap: '1rem' }}>
                  {warmupQuestions[warmupStep - 1].options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleWarmupAnswer(oIdx)}
                      className="btn btn-ghost"
                      style={{
                        textAlign: 'left',
                        padding: '1rem 1.5rem',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        justifyContent: 'flex-start',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ color: 'var(--primary)', marginRight: '10px', fontWeight: 'bold' }}>
                        [{String.fromCharCode(65 + oIdx)}]
                      </span> {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {warmupStep > 3 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ marginTop: 0 }}>Warmup Terminated</h3>
                <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
                  You got <strong style={{ color: 'var(--primary)' }}>{scoreCount} of 3</strong> correct! 
                </p>

                <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '6px', textAlign: 'left', marginBottom: '2rem', fontSize: '0.9rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent)' }}>Post-Mortem Analysis:</h4>
                  {warmupQuestions.map((q, idx) => {
                    const wasCorrect = warmupAnswers[idx] === q.correct;
                    return (
                      <div key={idx} style={{ marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <div style={{ fontWeight: '600' }}>Q{idx+1}: {wasCorrect ? '✅ Correct' : '❌ Missed'}</div>
                        <div style={{ color: 'var(--muted)' }}>{q.explanation}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={resetWarmup} className="btn btn-ghost">Restart Warmup</button>
                  <button onClick={() => startActualQuiz(fastPlayCategory)} className="btn btn-primary">Enter Main Arena →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 5: THE HALL OF SPARKS (Leaderboard Showcase) */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-head" style={{ borderLeft: '3px solid var(--secondary)', paddingLeft: '1.5rem', marginBottom: '3rem' }}>
            <span className="eyebrow" style={{ color: 'var(--accent)' }}>THE APEX THINKERS</span>
            <h2>Hall of Sparks</h2>
            <p style={{ color: 'var(--muted)' }}>
              Live global leaderboard. Speed and flawless accuracy decide the digital crown.
            </p>
          </div>

          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            {loadingLeaderboard ? (
              <div className="skeleton skeleton-text" style={{ padding: '3rem' }}></div>
            ) : leaderboard.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                No scores recorded yet. Be the first to secure a spot!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(0, 240, 255, 0.04)' }}>
                      <th style={{ padding: '1.2rem 1.5rem', color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.85rem' }}>Rank</th>
                      <th style={{ padding: '1.2rem 1.5rem', color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.85rem' }}>Thinker</th>
                      <th style={{ padding: '1.2rem 1.5rem', color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.85rem' }}>Arena Sector</th>
                      <th style={{ padding: '1.2rem 1.5rem', color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.85rem' }}>Score</th>
                      <th style={{ padding: '1.2rem 1.5rem', color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.85rem' }}>Total Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((player, index) => (
                      <tr 
                        key={index} 
                        style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.05)', 
                          background: index === 0 ? 'rgba(255, 46, 147, 0.05)' : 'none',
                          transition: 'background 0.2s'
                        }}
                      >
                        <td style={{ padding: '1.2rem 1.5rem', fontWeight: 'bold' }}>
                          {index === 0 ? "👑 #1" : `#${index + 1}`}
                        </td>
                        <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img 
                              src={`https://i.pravatar.cc/100?img=${(index * 11) % 70}`} 
                              alt="Avatar" 
                              style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--primary)' }}
                            />
                            {player.username}
                          </div>
                        </td>
                        <td style={{ padding: '1.2rem 1.5rem', textTransform: 'capitalize', color: 'var(--muted)' }}>
                          {player.category?.replace('-', ' ') || 'General'}
                        </td>
                        <td style={{ padding: '1.2rem 1.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                          {player.score} / 10
                        </td>
                        <td style={{ padding: '1.2rem 1.5rem' }}>
                          {player.timeTaken ? `${player.timeTaken.toFixed(1)}s` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 6: HIGH-ENERGY PHOTO TESTIMONIALS */}
      <section className="section" style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="eyebrow" style={{ color: 'var(--primary)' }}>TESTED BY THE CHRONICALLY INTELLECTUAL</span>
            <h2>What BrainSnappers Say</h2>
          </div>

          <div className="grid grid-3" style={{ gap: '2rem' }}>
            <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', position: 'relative' }}>
              <p style={{ fontStyle: 'italic', color: 'var(--text)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: '1.6' }}>
                "The 15-second timer changes everything. It's no longer just about knowing the facts; it's absolute pure cognitive adrenaline!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  className="avatar avatar-md" 
                  src="https://picsum.photos/seed/userface1/150/150" 
                  alt="Player Face" 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Devin Vance</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Rank S-Tier Cyber Warrior</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', position: 'relative' }}>
              <p style={{ fontStyle: 'italic', color: 'var(--text)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: '1.6' }}>
                "I hosted a live tournament with my dev team yesterday using BrainSnap. Fun, hyper-competitive, and absolutely addictive."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  className="avatar avatar-md" 
                  src="https://picsum.photos/seed/userface2/150/150" 
                  alt="Player Face" 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Elysia Thorne</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Software Architect</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', position: 'relative' }}>
              <p style={{ fontStyle: 'italic', color: 'var(--text)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: '1.6' }}>
                "Finally a trivia engine that rewards lightning fast speed instead of endless reading. The interface is stunning retro-cyberpunk."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  className="avatar avatar-md" 
                  src="https://picsum.photos/seed/userface3/150/150" 
                  alt="Player Face" 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Keanu Sterling</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Esports Enthusiast</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: MEDIA GALLERY / SHOWCASE */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="eyebrow" style={{ color: 'var(--secondary)' }}>VISUAL IMMERSION</span>
            <h2>The BrainSnap Culture</h2>
          </div>
          
          <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="gallery-item" style={{ overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--border)', position: 'relative', height: '240px' }}>
              <img src="https://picsum.photos/seed/tabletop1/600/400" alt="Trivia players laughing around neon tabletop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="gallery-item" style={{ overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--border)', position: 'relative', height: '240px' }}>
              <img src="https://picsum.photos/seed/esports2/600/400" alt="High tech esports tournament stage" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="gallery-item" style={{ overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--border)', position: 'relative', height: '240px' }}>
              <img src="https://picsum.photos/seed/arcade3/600/400" alt="Retro arcade machines glowing" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: BOTTOM CTA BANNER */}
      <div className="cta-section" style={{ background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)', borderTop: '1px solid var(--primary)', padding: '5rem 0', position: 'relative' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Ready to defy the clock?</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            No subscription. No downloads. Just 10 quick-fire questions that will verify your true neural performance score.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Initiate BrainSnap Now
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '4rem 0 2rem' }}>
        <div className="container">
          <div className="grid grid-3" style={{ gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text)' }}>Brain<span style={{ color: 'var(--primary)' }}>Snap</span></h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
                High-velocity cerebral validation arena. Powered by lightning-fast APIs and strict countdown mechanics.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Quick Sectors</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0 0', lineHeight: '2' }}>
                {categories.map((c, i) => (
                  <li key={i}>
                    <span onClick={() => startActualQuiz(c.slug)} style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: '0.9rem' }}>
                      ⚡ {c.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--secondary)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Portal Command</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0 0', lineHeight: '2' }}>
                <li><a href="#sandbox" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Warmup Sandbox</a></li>
                <li><a href="#arenas" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Sector Map</a></li>
              </ul>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              &copy; {new Date().getFullYear()} BrainSnap vv. All synapses firing.
            </span>
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              Vibe: Electric, high-velocity, retro-futuristic.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}