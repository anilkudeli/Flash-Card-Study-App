import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { request, send } from '../services/api.js';
import { EmptyState, ErrorMessage, Loading } from '../components/Status.jsx';

export default function DeckDetail() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ front: '', back: '' });
  const [busy, setBusy] = useState(false);
  async function load() {
    const [deckResult, cardResult] = await Promise.all([request(`/decks/${deckId}`), request(`/cards?deckId=${deckId}&limit=100`)]);
    setDeck(deckResult.deck); setCards(cardResult.data);
  }
  useEffect(() => { load().catch((issue) => setError(issue.message)); }, [deckId]);
  function openCard(card = null) { setEditing(card || {}); setForm(card ? { front: card.front, back: card.back } : { front: '', back: '' }); setError(''); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (editing?._id) await request(`/cards/${editing._id}`, send('PUT', form));
      else await request('/cards', send('POST', { ...form, deckId }));
      await load(); setEditing(null);
    } catch (issue) { setError(issue.message); }
    finally { setBusy(false); }
  }
  async function deleteCard(card) {
    if (!window.confirm('Delete this flashcard?')) return;
    try { await request(`/cards/${card._id}`, { method: 'DELETE' }); await load(); }
    catch (issue) { setError(issue.message); }
  }
  async function deleteDeck() {
    if (!window.confirm(`Delete “${deck.title}” and all its cards?`)) return;
    try { await request(`/decks/${deckId}`, { method: 'DELETE' }); navigate('/decks'); }
    catch (issue) { setError(issue.message); }
  }

  if (!deck && !error) return <div className="page-frame"><Loading label="Opening your deck" /></div>;
  if (!deck) return <section className="page-frame"><p className="form-error">{error}</p><Link to="/decks" className="text-link">← Back to decks</Link></section>;
  return <section className="page-frame deck-detail-page"><Link className="back-link" to="/decks">← All decks</Link><div className="detail-heading"><div><p className="eyebrow eyebrow-dark">YOUR DECK · {deck.cardCount} CARDS</p><h1>{deck.title}</h1><p>{deck.description || 'A dedicated space for what you want to remember.'}</p></div><div className="heading-actions"><Link className="button button-dark" to={`/study/${deckId}`}>Study deck <span>→</span></Link><button className="button button-outline" onClick={deleteDeck}>Delete deck</button></div></div>
    <div className="detail-strip"><span><strong>{deck.cardCount}</strong> cards</span><span><strong>{deck.dueCount}</strong> due today</span><span><strong>{deck.progress}%</strong> mastered</span><div className="detail-progress"><span style={{ width: `${deck.progress}%` }} /></div></div>
    <div className="panel-heading cards-heading"><div><p className="eyebrow eyebrow-dark">THE MATERIAL</p><h2>Flashcards</h2></div><button className="button button-coral" onClick={() => openCard()}>＋ Add card</button></div>
    {error && <p className="form-error">{error}</p>}
    {!cards ? <Loading label="Loading cards" /> : cards.length === 0 ? <EmptyState title="Add your first question" detail="Write a prompt on the front and an answer on the back." action={<button className="button button-dark" onClick={() => openCard()}>Add a flashcard ↗</button>} /> : <div className="card-list">{cards.map((card, index) => <article className="manage-card" key={card._id}><span className="manage-card-index">{String(index + 1).padStart(2, '0')}</span><div className="manage-card-copy"><span className="card-face-label">FRONT</span><p>{card.front}</p></div><span className="manage-card-divider" /><div className="manage-card-copy"><span className="card-face-label">BACK</span><p>{card.back}</p></div><div className="manage-card-meta"><span className={`box-pill box-${card.box}`}>BOX {card.box}</span><span>{card.reviewCount} reviews</span></div><div className="manage-card-actions"><button className="icon-button" title="Edit card" aria-label="Edit card" onClick={() => openCard(card)}>✎</button><button className="icon-button icon-danger" title="Delete card" aria-label="Delete card" onClick={() => deleteCard(card)}>×</button></div></article>)}</div>}
    {editing !== null && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><form className="modal-form" onSubmit={submit}><button type="button" className="modal-close" aria-label="Close" onClick={() => setEditing(null)}>×</button><p className="eyebrow eyebrow-dark">{editing?._id ? 'REFINE YOUR CARD' : 'ADD TO THE DECK'}</p><h2>{editing?._id ? 'Edit flashcard' : 'New flashcard'}</h2><label>Front<input autoFocus maxLength="1000" value={form.front} onChange={(event) => setForm({ ...form, front: event.target.value })} placeholder="Write a question or prompt" required /></label><label>Back<textarea rows="4" maxLength="2000" value={form.back} onChange={(event) => setForm({ ...form, back: event.target.value })} placeholder="Add the answer" required /></label><ErrorMessage>{error}</ErrorMessage><button className="button button-coral auth-submit" disabled={busy}>{busy ? 'Saving…' : editing?._id ? 'Save card' : 'Add flashcard'} <span>↗</span></button></form></div>}
  </section>;
}
