import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  // States for Categories
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  // States for Questions
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState('');

  // States for Scores/Telemetry
  const [scores, setScores] = useState([]);
  const [scoresLoading, setScoresLoading] = useState(true);

  // Form State: Forge New Category
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catIcon, setCatIcon] = useState('Cpu');
  const [catColor, setCatColor] = useState('#00F0FF');
  const [catFormLoading, setCatFormLoading] = useState(false);
  const [catFormSuccess, setCatFormSuccess] = useState(false);
  const [catFormError, setCatFormError] = useState('');

  // Form State: Forge New Question
  const [qCategory, setQCategory] = useState('');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrectIndex, setQCorrectIndex] = useState(0);
  const [qDifficulty, setQDifficulty] = useState('Medium');
  const [qFormLoading, setQFormLoading] = useState(false);
  const [qFormSuccess, setQFormSuccess] = useState(false);
  const [qFormError, setQFormError] = useState('');

  // Filter/Search states
  const [filterCategory, setFilterCategory] = useState('All');

  // Load Data
  const fetchData = async () => {
    try {
      setCategoriesLoading(true);
      const catRes = await axios.get('/api/categories');
      setCategories(catRes.data || []);
      if (catRes.data && catRes.data.length > 0) {
        setQCategory(catRes.data[0].slug);
      }
      setCategoriesLoading(false);
    } catch (err) {
      console.error(err);
      setCategoriesError('Failed to synchronize sector categories.');
      setCategoriesLoading(false);
    }

    try {
      setQuestionsLoading(true);
      const qRes = await axios.get('/api/questions');
      setQuestions(qRes.data || []);
      setQuestionsLoading(false);
    } catch (err) {
      console.error(err);
      setQuestionsError('Failed to access central database question matrix.');
      setQuestionsLoading(false);
    }

    try {
      const scoreRes = await axios.get('/api/scores');
      setScores(scoreRes.data || []);
      setScoresLoading(false);
    } catch (err) {
      console.error(err);
      setScoresLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Category Creation
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim() || !catDescription.trim()) {
      setCatFormError('All sector parameters must be declared.');
      return;
    }

    setCatFormLoading(true);
    setCatFormError('');
    setCatFormSuccess(false);

    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    try {
      const response = await axios.post('/api/categories', {
        name: catName,
        slug,
        description: catDescription,
        icon: catIcon,
        color: catColor
      });

      if (response.data) {
        setCatFormSuccess(true);
        setCatName('');
        setCatDescription('');
        // Refresh active list
        const updatedCats = await axios.get('/api/categories');
        setCategories(updatedCats.data || []);
      }
    } catch (err) {
      setCatFormError(err.response?.data?.message || 'Failed to inject new sector category into core database.');
    } finally {
      setCatFormLoading(false);
    }
  };

  // Handle Question Creation
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!qCategory) {
      setQFormError('Please select or configure an arena sector first.');
      return;
    }
    if (!qText.trim()) {
      setQFormError('The diagnostic inquiry query cannot be blank.');
      return;
    }
    if (qOptions.some(opt => !opt.trim())) {
      setQFormError('All four matrix responses must be specified.');
      return;
    }

    setQFormLoading(true);
    setQFormError('');
    setQFormSuccess(false);

    try {
      const response = await axios.post('/api/questions', {
        category: qCategory,
        questionText: qText,
        options: qOptions.join('|||'), // Serialized options
        correctOptionIndex: Number(qCorrectIndex),
        difficulty: qDifficulty
      });

      if (response.data) {
        setQFormSuccess(true);
        setQText('');
        setQOptions(['', '', '', '']);
        setQCorrectIndex(0);
        // Refresh questions list
        const updatedQs = await axios.get('/api/questions');
        setQuestions(updatedQs.data || []);
      }
    } catch (err) {
      setQFormError(err.response?.data?.message || 'Synaptic query rejection. Verification failed.');
    } finally {
      setQFormLoading(false);
    }
  };

  // Handle Deleting a Category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('WARNING: Deleting this arena sector will disrupt player synchronization. Proceed?')) return;
    try {
      await axios.delete(`/api/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert('Action blocked: Ensure the database sector is unlinked.');
    }
  };

  // Handle Deleting a Question
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Erase this synaptic node permanently from rotation?')) return;
    try {
      await axios.delete(`/api/questions/${id}`);
      setQuestions(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      alert('Failed to drop question node.');
    }
  };

  const filteredQuestions = filterCategory === 'All'
    ? questions
    : questions.filter(q => q.category === filterCategory);

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      {/* Compact Page Hero */}
      <section className="hero" style={{ padding: '3rem 2rem', marginBottom: '2rem', minHeight: 'auto', background: 'var(--surface)' }}>
        <div className="container" style={{ textAlign: 'left' }}>
          <span className="eyebrow" style={{ color: 'var(--secondary)' }}>SYSTEM LEVEL Access Enabled</span>
          <h1 style={{ margin: '0.5rem 0' }}>Central <span className="gradient-text">Command</span></h1>
          <p className="hero-subtitle" style={{ maxWidth: '600px' }}>
            Core database telemetry and content configuration modules. Calibrate arenas, forge new synaptic pathways, and inspect live feedback.
          </p>
        </div>
      </section>

      {/* SECTION 1: Platform Health Telemetry */}
      <section className="section" style={{ padding: '2rem 0' }}>
        <div className="section-head" style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1.5rem', marginBottom: '2rem' }}>
          <span className="eyebrow">DIAGNOSTICS</span>
          <h2>Platform Health</h2>
          <p>Real-time configuration load and cognitive test analytics</p>
        </div>

        <div className="grid grid-3">
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span className="eyebrow" style={{ color: 'var(--primary)' }}>DB CORES ACTIVE</span>
            <div className="stat-value" style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--text)', margin: '0.5rem 0' }}>
              {categories.length}
            </div>
            <div className="stat-label" style={{ color: 'var(--muted)' }}>Configured Trivia Sectors</div>
          </div>

          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span className="eyebrow" style={{ color: 'var(--secondary)' }}>SYNAPSE MATRIX</span>
            <div className="stat-value" style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--text)', margin: '0.5rem 0' }}>
              {questions.length}
            </div>
            <div className="stat-label" style={{ color: 'var(--muted)' }}>Active Question Nodes</div>
          </div>

          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span className="eyebrow" style={{ color: 'var(--accent)' }}>TELEMETRY SESSIONS</span>
            <div className="stat-value" style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--text)', margin: '0.5rem 0' }}>
              {scores.length}
            </div>
            <div className="stat-label" style={{ color: 'var(--muted)' }}>Completed BrainSnaps Recorded</div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Sector Management (Categories) */}
      <section className="section" style={{ padding: '2rem 0' }}>
        <div className="section-head" style={{ borderLeft: '3px solid var(--secondary)', paddingLeft: '1.5rem', marginBottom: '2rem' }}>
          <span className="eyebrow">ARENA SPACES</span>
          <h2>Sector Distribution</h2>
          <p>Create and destroy active tournament arenas in the live system</p>
        </div>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          {/* List existing categories */}
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Active Sectors</h3>
            
            {categoriesLoading ? (
              <div className="skeleton skeleton-card" style={{ height: '120px' }} />
            ) : categoriesError ? (
              <div className="alert alert-error">{categoriesError}</div>
            ) : categories.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>Zero active sectors registered in matrix.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {categories.map((cat) => (
                  <div key={cat._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--surface-2)',
                    padding: '1rem',
                    borderRadius: '6px',
                    borderLeft: `4px solid ${cat.color || 'var(--primary)'}`
                  }}>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{cat.name}</span>
                        <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', color: 'var(--muted)' }}>
                          {cat.slug}
                        </span>
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>{cat.description}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteCategory(cat._id)} 
                      className="btn" 
                      style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '4px' }}
                    >
                      Purge
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create category form */}
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Forge New Sector</h3>
            
            {catFormSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                ✓ Arena Sector successfully initialized into core telemetry network!
                <button 
                  onClick={() => setCatFormSuccess(false)} 
                  className="btn btn-ghost" 
                  style={{ float: 'right', padding: '0 5px', minHeight: 'auto' }}
                >
                  Dismiss
                </button>
              </div>
            )}

            {catFormError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{catFormError}</div>
            )}

            <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem' }}>Sector Name</label>
                <input 
                  type="text" 
                  value={catName} 
                  onChange={(e) => setCatName(e.target.value)} 
                  placeholder="e.g., Quantum Physics" 
                  style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem' }}>Sector Subtitle / Description</label>
                <textarea 
                  value={catDescription} 
                  onChange={(e) => setCatDescription(e.target.value)} 
                  placeholder="e.g., Extreme particle physics & relativistic space anomalies." 
                  rows="2"
                  style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem' }}>Icon Key</label>
                  <select 
                    value={catIcon} 
                    onChange={(e) => setCatIcon(e.target.value)} 
                    style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }}
                  >
                    <option value="Cpu">Microchips & Logic</option>
                    <option value="Globe">Global Empires</option>
                    <option value="Flask">Chemical Kinetics</option>
                    <option value="Tv">Digital Media</option>
                    <option value="Flame">Rapid Combat</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem' }}>Neon Color Tag</label>
                  <select 
                    value={catColor} 
                    onChange={(e) => setCatColor(e.target.value)} 
                    style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }}
                  >
                    <option value="#00F0FF">Electric Cyan</option>
                    <option value="#FF2E93">Pulse Pink</option>
                    <option value="#FFD200">Kinetic Gold</option>
                    <option value="#10B981">Matrix Green</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={catFormLoading} 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}
              >
                {catFormLoading ? 'Initializing Sector Core...' : 'Forge Arena Sector'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* SECTION 3: Question Matrix (Questions CRUD) */}
      <section className="section" style={{ padding: '2rem 0' }}>
        <div className="section-head" style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '1.5rem', marginBottom: '2rem' }}>
          <span className="eyebrow">SYNAPTIC LOAD</span>
          <h2>Global Question Inventory</h2>
          <p>Configure individual multiple choice modules to populate active quiz systems</p>
        </div>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          {/* Create Question Form */}
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Forge New Question</h3>

            {qFormSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                ✓ Synaptic node configured and broadcasted to tournament sequence rotation!
                <button 
                  onClick={() => setQFormSuccess(false)} 
                  className="btn btn-ghost" 
                  style={{ float: 'right', padding: '0 5px', minHeight: 'auto' }}
                >
                  Dismiss
                </button>
              </div>
            )}

            {qFormError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{qFormError}</div>
            )}

            <form onSubmit={handleCreateQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem' }}>Parent Sector Arena</label>
                <select 
                  value={qCategory} 
                  onChange={(e) => setQCategory(e.target.value)} 
                  style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }}
                >
                  {categories.map(c => (
                    <option key={c._id} value={c.slug}>{c.name}</option>
                  ))}
                  {categories.length === 0 && (
                    <option value="">(Create a sector first)</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem' }}>Diagnostic Query Text</label>
                <textarea 
                  value={qText} 
                  onChange={(e) => setQText(e.target.value)} 
                  placeholder="e.g., Which early computer architecture was designed using magnetic core memory?" 
                  rows="2"
                  style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem' }}>Matrix Options (Must define exactly 4)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {qOptions.map((opt, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{idx + 1}</span>
                      <input 
                        type="text" 
                        value={opt} 
                        onChange={(e) => {
                          const updated = [...qOptions];
                          updated[idx] = e.target.value;
                          setQOptions(updated);
                        }} 
                        placeholder={`Option ${idx + 1}`} 
                        style={{ flex: 1, padding: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }}
                      />
                      <input 
                        type="radio" 
                        name="correctIndex" 
                        checked={Number(qCorrectIndex) === idx}
                        onChange={() => setQCorrectIndex(idx)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                        title="Mark as correct answer"
                      />
                    </div>
                  ))}
                </div>
                <small style={{ color: 'var(--muted)', marginTop: '4px', display: 'block' }}>Select the bullet corresponding to the correct answer choice.</small>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem' }}>Speed Level / Difficulty Rating</label>
                <select 
                  value={qDifficulty} 
                  onChange={(e) => setQDifficulty(e.target.value)} 
                  style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }}
                >
                  <option value="Easy">Easy (15s limit is plenty)</option>
                  <option value="Medium">Medium (Moderate thinking load)</option>
                  <option value="Hard">Hard (Adrenaline spike zone)</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={qFormLoading} 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}
              >
                {qFormLoading ? 'Injecting Node...' : 'Forge Question Node'}
              </button>
            </form>
          </div>

          {/* Active Question List */}
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>Synaptic Database</h3>
              
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)} 
                style={{ padding: '6px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }}
              >
                <option value="All">All Arenas</option>
                {categories.map(c => (
                  <option key={c._id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {questionsLoading ? (
              <div className="skeleton skeleton-card" style={{ height: '140px' }} />
            ) : questionsError ? (
              <div className="alert alert-error">{questionsError}</div>
            ) : filteredQuestions.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>No questions match current category filter.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '5px' }}>
                {filteredQuestions.map((q, idx) => {
                  const optsArray = q.options ? q.options.split('|||') : [];
                  return (
                    <div key={q._id} style={{
                      background: 'var(--surface-2)',
                      padding: '1.2rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          background: 'rgba(0, 240, 255, 0.1)',
                          color: 'var(--primary)',
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {q.category} • {q.difficulty || 'Medium'}
                        </span>
                        <button 
                          onClick={() => handleDeleteQuestion(q._id)} 
                          className="btn btn-ghost" 
                          style={{ minHeight: 'auto', padding: '2px 8px', color: '#ff4b4b', fontSize: '0.8rem' }}
                        >
                          Delete Node
                        </button>
                      </div>

                      <p style={{ margin: '0.5rem 0', fontWeight: 'bold', color: 'var(--text)' }}>
                        {idx + 1}. {q.questionText}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.85rem', color: 'var(--muted)' }}>
                        {optsArray.map((opt, oIdx) => (
                          <div key={oIdx} style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: oIdx === q.correctOptionIndex ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                            color: oIdx === q.correctOptionIndex ? '#10B981' : 'var(--muted)',
                            border: oIdx === q.correctOptionIndex ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                            fontWeight: oIdx === q.correctOptionIndex ? 'bold' : 'normal'
                          }}>
                            {oIdx + 1}. {opt} {oIdx === q.correctOptionIndex && '✓'}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}