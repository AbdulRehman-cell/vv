import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function QuizArena() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  // State Management
  const [category, setCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Quiz Lifecycle
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [startTime, setStartTime] = useState(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [username, setUsername] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  // Answers tracker for diagnostic results post-mortem review
  const [answersLog, setAnswersLog] = useState([]);

  // Audio / Sound placeholder trigger indicator
  const [sparkTrigger, setSparkTrigger] = useState(false);

  // Ref for the 1-second countdown timer
  const timerRef = useRef(null);

  // Fetch Category and Questions
  useEffect(() => {
    const fetchArenaData = async () => {
      try {
        setLoading(true);
        // Fetch categories to match slug
        const categoryResponse = await axios.get('/api/categories');
        const activeCat = categoryResponse.data.find(c => c.slug === categorySlug);
        
        if (activeCat) {
          setCategory(activeCat);
        } else {
          // Fallback static category properties if not created yet
          setCategory({
            name: categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : 'General Matrix',
            slug: categorySlug || 'general',
            description: 'The ultimate digital proving ground for rapid reflexes.',
            color: '#00F0FF'
          });
        }

        // Fetch questions for this category
        const questionsResponse = await axios.get('/api/questions');
        // Filter by category slug or name (case-insensitive)
        const matchedQuestions = questionsResponse.data.filter(q => {
          return q.category && (
            q.category.toLowerCase() === categorySlug?.toLowerCase() ||
            q.category.toLowerCase() === activeCat?.name?.toLowerCase()
          );
        });

        if (matchedQuestions.length > 0) {
          // Take max 10 questions for the premium BrainSnap format
          setQuestions(matchedQuestions.slice(0, 10));
        } else {
          // Provide highly thematic emergency fallback questions to ensure uninterrupted gameplay
          const fallbackQuestions = [
            {
              _id: 'fallback_1',
              questionText: 'Which computer network technology was standard for connecting retro arcade units?',
              options: 'Ethernet Star|||Token Ring Bus|||RS-232 Serial|||Direct Fiber-Optic',
              correctOptionIndex: 2,
              category: categorySlug,
              difficulty: 'hard'
            },
            {
              _id: 'fallback_2',
              questionText: 'What was the first commercially successful video game that launched in 1972?',
              options: 'Computer Space|||Pong|||Space Invaders|||Asteroids',
              correctOptionIndex: 1,
              category: categorySlug,
              difficulty: 'medium'
            },
            {
              _id: 'fallback_3',
              questionText: 'Which vacuum-tube behemoth built in 1945 is recognized as the first general-purpose digital computer?',
              options: 'ENIAC|||UNIVAC I|||Colossus Mark 1|||Harvard Mark I',
              correctOptionIndex: 0,
              category: categorySlug,
              difficulty: 'hard'
            },
            {
              _id: 'fallback_4',
              questionText: 'In cybernetic science, what term describes the science of communications and automatic control systems?',
              options: 'Heuristics|||Cybernetics|||Quantum Telemetry|||Bionic Systems',
              correctOptionIndex: 1,
              category: categorySlug,
              difficulty: 'medium'
            },
            {
              _id: 'fallback_5',
              questionText: 'Which high-level programming language was designed by John Backus in 1957 for scientific computing?',
              options: 'COBOL|||LISP|||FORTRAN|||ALGOL 60',
              correctOptionIndex: 2,
              category: categorySlug,
              difficulty: 'hard'
            }
          ];
          setQuestions(fallbackQuestions);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error initiating Arena parameters:', err);
        setError('Systems failure during synaptic calibration. Please restart.');
        setLoading(false);
      }
    };

    fetchArenaData();
  }, [categorySlug]);

  // Handle countdown timer once the game starts
  useEffect(() => {
    if (!gameStarted || isAnswered || questions.length === 0) return;

    // Reset countdown and start ticking
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Time is up! Force check answer as incorrect
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex, gameStarted, isAnswered, questions]);

  // Triggered when the timer runs out
  const handleTimeOut = () => {
    setSelectedOptionIndex(-1); // Represents no selection / timed out
    setIsAnswered(true);
    setTotalTimeSpent(prev => prev + 15);
    setSparkTrigger(true);

    const currentQuestion = questions[currentQuestionIndex];
    const optsArray = typeof currentQuestion.options === 'string' ? currentQuestion.options.split('|||') : currentQuestion.options;
    
    setAnswersLog(prev => [...prev, {
      questionText: currentQuestion.questionText,
      chosenOption: -1,
      correctOption: currentQuestion.correctOptionIndex,
      correctText: optsArray[currentQuestion.correctOptionIndex],
      chosenText: 'No Answer (Timed Out)',
      isCorrect: false
    }]);

    setTimeout(() => setSparkTrigger(false), 300);
  };

  // Start the actual timed experience
  const handleStartGame = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('Please state your alias to record your terminal session.');
      return;
    }
    setGameStarted(true);
    setStartTime(Date.now());
    setSecondsLeft(15);
  };

  // User selects an option
  const handleOptionSelect = (index) => {
    if (isAnswered) return; // Prevent double clicking

    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOptionIndex(index);
    setIsAnswered(true);

    const currentQuestion = questions[currentQuestionIndex];
    const secondsElapsed = 15 - secondsLeft;
    setTotalTimeSpent(prev => prev + secondsElapsed);

    const isCorrect = index === currentQuestion.correctOptionIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    const optsArray = typeof currentQuestion.options === 'string' ? currentQuestion.options.split('|||') : currentQuestion.options;
    setAnswersLog(prev => [...prev, {
      questionText: currentQuestion.questionText,
      chosenOption: index,
      correctOption: currentQuestion.correctOptionIndex,
      correctText: optsArray[currentQuestion.correctOptionIndex],
      chosenText: optsArray[index],
      isCorrect: isCorrect
    }]);
    
    // Quick flash effect
    setSparkTrigger(true);
    setTimeout(() => setSparkTrigger(false), 200);
  };

  // Advance to the next question or complete quiz
  const handleNextQuestion = async () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
      setSecondsLeft(15);
    } else {
      // Quiz complete! Persist result & navigate to Results page
      try {
        const finalTime = Math.round(totalTimeSpent || ((Date.now() - startTime) / 1000));
        
        // Save score via POST API
        await axios.post('/api/scores', {
          username: username || 'Anonymous Thinker',
          category: category?.slug || categorySlug,
          score: score,
          timeTaken: finalTime,
          date: new Date()
        });

        // Redirect with payload state
        navigate('/results', {
          state: {
            username: username,
            categoryName: category?.name || categorySlug,
            categorySlug: category?.slug || categorySlug,
            score: score,
            totalQuestions: questions.length,
            timeTaken: finalTime,
            answersLog: answersLog
          }
        });
      } catch (err) {
        console.error('Failed to register score telemetry:', err);
        // Fallback redirection even if score transmission failed
        navigate('/results', {
          state: {
            username: username || 'Guest Challenger',
            categoryName: category?.name || categorySlug,
            categorySlug: category?.slug || categorySlug,
            score: score,
            totalQuestions: questions.length,
            timeTaken: 60,
            answersLog: answersLog
          }
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div className="section-head">
          <span className="eyebrow">Initializing Synaptic Uplink</span>
          <h2>Loading <span className="gradient-text">Arena Matrix</span></h2>
        </div>
        <div className="skeleton skeleton-card" style={{ height: '300px', margin: '2rem auto', maxWidth: '600px' }}></div>
        <div className="skeleton skeleton-text" style={{ maxWidth: '400px', margin: '0 auto' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div className="alert alert-error">{error}</div>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>Return to Control</Link>
      </div>
    );
  }

  // Pre-game Setup Screen: Get username first
  if (!gameStarted) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <div className="section-head" style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem', marginBottom: '2.5rem' }}>
          <span className="eyebrow" style={{ color: 'var(--primary)' }}>ARENA SECTOR: {category?.name}</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)' }}>
            The Arena is <span className="gradient-text">Primed</span>
          </h1>
          <p className="hero-subtitle" style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
            {category?.description || 'Your cognitive playground has a 15-second fuse.'}
          </p>
        </div>

        <section className="section card" style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: '2.5rem',
          borderRadius: '8px',
          boxShadow: '0 8px 32px -8px rgba(0,0,0,0.5)'
        }}>
          <h3 style={{ color: 'var(--text)', marginBottom: '1.5rem' }}>Synaptic Identity Initialization</h3>
          
          <div className="alert alert-info" style={{ marginBottom: '1.5rem', background: 'rgba(0, 240, 255, 0.05)', borderColor: 'var(--border)' }}>
            <strong>Rules of Engagement:</strong> You will face {questions.length} rapid-fire questions. You have exactly <strong>15 seconds</strong> per question. High speed yields maximum prestige.
          </div>

          <form onSubmit={handleStartGame}>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Enter Your Competitive Alias
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. CYBER_PUNK_99"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.35)',
                  border: 'none',
                  color: 'var(--bg)',
                  fontWeight: '700',
                  padding: '12px 24px'
                }}
              >
                Initiate BrainSnap
              </button>
              <Link to="/" className="btn btn-ghost" style={{ color: 'var(--muted)' }}>
                Retreat to Lobby
              </Link>
            </div>
          </form>
        </section>

        {/* Dynamic Sandbox Informative Column */}
        <section className="section" style={{ marginTop: '4rem' }}>
          <div className="grid grid-3">
            <div className="card" style={{ padding: '1.5rem', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>⚡ 15s Timer</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>The fuse burns constantly. Stalling is fatal to your cognitive index score.</p>
            </div>
            <div className="card" style={{ padding: '1.5rem', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>🔥 10 Synapses</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>No fluff. Every question is designed to separate elite thinkers from generalists.</p>
            </div>
            <div className="card" style={{ padding: '1.5rem', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>🏆 Global Rank</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Your precise completion time and correct responses feed directly into the Hall of Sparks.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Active Gameplay UI
  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Determine color theme for countdown
  const timerColor = secondsLeft <= 4 ? 'var(--secondary)' : 'var(--primary)';

  // Safely parse options array from server serialization if needed
  const currentOptions = currentQuestion?.options 
    ? (typeof currentQuestion.options === 'string' ? currentQuestion.options.split('|||') : currentQuestion.options)
    : [];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Dynamic Pulse-Rate Arena Header */}
      <div className="booking-card" style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>ACTIVE TERMINAL SESSION</span>
          <h3 style={{ margin: 0, fontSize: '1.3rem' }}>
            Arena: <span style={{ color: 'var(--primary)' }}>{category?.name}</span>
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>COGNITIVE PROGRESS</div>
            <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text)' }}>
              Question {String(currentQuestionIndex + 1).padStart(2, '0')} <span style={{ color: 'var(--muted)', fontWeight: '400' }}>/ {questions.length}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>SYNAPTIC SCORE</div>
            <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--accent)' }}>
              {score} / {questions.length} Correct
            </div>
          </div>
        </div>
      </div>

      {/* High-Velocity Progress Track */}
      <div className="progress-bar" style={{ background: 'var(--surface-2)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '2.5rem' }}>
        <div className="progress-bar-fill" style={{
          width: `${progressPercent}%`,
          background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
          height: '100%',
          transition: 'width 0.4s ease-out'
        }}></div>
      </div>

      {/* Main Chamber - Question and Answers */}
      <section className="section" style={{ position: 'relative' }}>
        <div className={`card ${sparkTrigger ? 'reveal' : ''}`} style={{
          background: 'var(--surface)',
          border: `1px solid ${isAnswered ? 'var(--primary)' : 'var(--border)'}`,
          padding: '2.5rem',
          borderRadius: '12px',
          boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.7)',
          transition: 'border-color 0.2s ease, transform 0.2s ease'
        }}>
          
          {/* Top Row: Difficulty Tag & The Countdown Fuse */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <span className="pill" style={{
              background: 'rgba(0, 240, 255, 0.1)',
              color: 'var(--primary)',
              border: '1px solid var(--border)',
              padding: '4px 12px',
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {currentQuestion?.difficulty || 'Standard'} Mode
            </span>

            {/* Countdown Fuse Meter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }}>FUSE TIME:</span>
              <div style={{
                background: timerColor,
                color: 'var(--bg)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '1.1rem',
                boxShadow: `0 0 15px ${timerColor}4d`,
                transition: 'background-color 0.3s ease'
              }}>
                {secondsLeft}
              </div>
            </div>
          </div>

          {/* Core Question Query */}
          <h2 style={{
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            lineHeight: '1.3',
            color: 'var(--text)',
            marginBottom: '2.5rem',
            fontFamily: '"Space Grotesk", sans-serif'
          }}>
            {currentQuestion?.questionText}
          </h2>

          {/* Keyboard-responsive Option Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentOptions.map((option, idx) => {
              // Styling states based on user interaction
              let optionStyle = {
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text)'
              };

              if (isAnswered) {
                if (idx === currentQuestion.correctOptionIndex) {
                  // Correct answer highlights green
                  optionStyle = {
                    background: 'rgba(0, 240, 255, 0.15)',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)'
                  };
                } else if (idx === selectedOptionIndex) {
                  // Wrong choice chosen by user highlights pink
                  optionStyle = {
                    background: 'rgba(255, 46, 147, 0.15)',
                    border: '1px solid var(--secondary)',
                    color: 'var(--secondary)'
                  };
                } else {
                  // Neutral unselected options fade
                  optionStyle = {
                    background: 'var(--surface-2)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    color: 'rgba(243, 245, 249, 0.4)'
                  };
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={isAnswered}
                  style={{
                    width: '100%',
                    padding: '1.2rem 1.5rem',
                    textAlign: 'left',
                    borderRadius: '6px',
                    fontSize: '1.05rem',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    cursor: isAnswered ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    ...optionStyle
                  }}
                  className="quiz-option-btn"
                >
                  <span>
                    <strong style={{ marginRight: '12px', color: 'var(--muted)' }}>
                      {String.fromCharCode(65 + idx)}.
                    </strong>
                    {option}
                  </span>

                  {isAnswered && idx === currentQuestion.correctOptionIndex && (
                    <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>✓ CORRECT VECTOR</span>
                  )}
                  {isAnswered && idx === selectedOptionIndex && idx !== currentQuestion.correctOptionIndex && (
                    <span style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '0.85rem' }}>✗ MISSED MATCH</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Time Limit Out of Bounds Message */}
          {isAnswered && selectedOptionIndex === -1 && (
            <div className="alert alert-error" style={{ marginTop: '2rem' }}>
              ⚡ FUSE EXPIRED: Your response took more than 15 seconds. Advancing is required.
            </div>
          )}

          {/* Bottom Action Drawer for quiz control flow */}
          {isAnswered && (
            <div style={{
              marginTop: '2.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border)',
              paddingTop: '1.5rem'
            }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>
                {currentQuestionIndex + 1 === questions.length 
                  ? 'All 10 synapses tested. Finalizing telemetry...' 
                  : 'Lock in selection and prepare for the next query.'}
              </p>
              <button
                onClick={handleNextQuestion}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  color: 'var(--bg)',
                  fontWeight: '700',
                  padding: '10px 20px',
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
                }}
              >
                {currentQuestionIndex + 1 === questions.length ? 'Secure Results' : 'Next Synapse →'}
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Safety Information Section */}
      <section className="section" style={{ marginTop: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          Terminal Session: <code>{username || 'GUEST_USER'}</code> | Host connection secured. Do not refresh or back out.
        </p>
      </section>

    </div>
  );
}