import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request, send } from '../services/api.js';
import { EmptyState, ErrorMessage, Loading } from '../components/Status.jsx';

export default function Decks() {
  const [decks, setDecks] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function load() { const result = await request('/decks?limit=100'); setDecks(result.data); }
  useEffect(() => { load().catch((issue) => setError(issue.message)); }, []);
  function openCreate() { setEditing(null); setForm({ title: '', description: '' }); setError(''); setShowForm(true); }
  function openEdit(deck) { setEditing(deck); setForm({ title: deck.title, description: deck.description || '' }); setError(''); setShowForm(true); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (editing) await request(`/decks/${editing._id}`, send('PUT', form));
      else await request('/decks', send('POST', form));
      await load(); setShowForm(false);
    } catch (issue) { setError(issue.message); }
    finally { setBusy(false); }
  }
  async function remove(deck) {
    if (!window.confirm(`Delete “${deck.title}” and all its cards?`)) return;
    try { await request(`/decks/${deck._id}`, { method: 'DELETE' }); await load(); }
    catch (issue) { setError(issue.message); }
  }

  return <section className="page-frame"><div className="page-heading"><div><p className="eyebrow eyebrow-dark">YOUR COLLECTION</p><h1>My decks<span className="heading-count">{decks?.length ?? '—'}</span></h1><p>Give every subject its own place to grow.</p></div><button className="button button-coral" onClick={openCreate}>＋ New deck</button></div>
    {error && !showForm && <p className="form-error">{error}</p>}
    {!decks ? <Loading label="Loading your decks" /> : decks.length === 0 ? <EmptyState title="Start with a subject" detail="Create your first deck, then add a few questions you want to remember." action={<button className="button button-dark" onClick={openCreate}>Create a deck <span>↗</span></button>} /> : <div className="deck-grid">{decks.map((deck, index) => <article className="deck-card" key={deck._id}><div className={`deck-card-top deck-tone-${index % 4}`}><span className="deck-number">DECK {String(index + 1).padStart(2, '0')}</span><span className="deck-card-mark">✳</span><div className="deck-meter"><span style={{ width: `${deck.progress}%` }} /></div></div><div className="deck-card-body"><div className="deck-card-title"><Link to={`/decks/${deck._id}`}><h2>{deck.title}</h2></Link><div className="deck-actions"><button className="icon-button" title="Edit deck" aria-label={`Edit ${deck.title}`} onClick={() => openEdit(deck)}>✎</button><button className="icon-button icon-danger" title="Delete deck" aria-label={`Delete ${deck.title}`} onClick={() => remove(deck)}>×</button></div></div><p className="deck-description">{deck.description || 'A fresh space for the ideas you want to keep.'}</p><div className="deck-meta"><span>{deck.cardCount} cards</span><span>{deck.dueCount} due</span><span>{deck.progress}% mastered</span></div><div className="deck-card-footer"><Link className="underlined-link" to={`/decks/${deck._id}`}>Open deck <span>↗</span></Link><Link className="study-mini" to={`/study/${deck._id}`}>Study <span>→</span></Link></div></div></article>)}</div>}
    {showForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}><form className="modal-form" onSubmit={submit}><button type="button" className="modal-close" aria-label="Close" onClick={() => setShowForm(false)}>×</button><p className="eyebrow eyebrow-dark">{editing ? 'MAKE IT YOURS' : 'A NEW PLACE TO LEARN'}</p><h2>{editing ? 'Edit deck' : 'Create a deck'}</h2><label>Deck title<input autoFocus maxLength="100" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Spanish essentials" required /></label><label>Description <span className="optional-label">OPTIONAL</span><textarea maxLength="500" rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What are you working on?" /></label><ErrorMessage>{error}</ErrorMessage><button className="button button-coral auth-submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create deck'} <span>↗</span></button></form></div>}
  </section>;
}
