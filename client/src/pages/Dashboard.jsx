import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EmptyState, Loading } from '../components/Status.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { request('/decks/summary/dashboard').then(setData).catch((issue) => setError(issue.message)); }, []);
  if (!data && !error) return <div className="page-frame"><Loading label="Preparing your study space" /></div>;
  const stats = data?.stats || { totalDecks: 0, totalCards: 0, dueToday: 0, mastered: 0, progress: 0 };

  return <section className="page-frame dashboard-page">
    <div className="page-heading dashboard-heading"><div><p className="eyebrow eyebrow-dark">YOUR STUDY SPACE</p><h1>Good to see you, {user?.name.split(' ')[0]}.</h1><p>One good review is a good place to begin.</p></div><div className="heading-actions"><Link className="button button-coral" to="/decks">＋ Create deck</Link><Link className="button button-dark" to="/study">Start studying <span>→</span></Link></div></div>
    {error && <p className="form-error">{error}</p>}
    <div className="stats-grid"><article className="stat-card stat-coral"><span className="stat-label">DECKS</span><strong>{stats.totalDecks}</strong><span className="stat-foot">A home for each subject</span><span className="stat-symbol">▤</span></article><article className="stat-card stat-blue"><span className="stat-label">FLASHCARDS</span><strong>{stats.totalCards}</strong><span className="stat-foot">Ideas in your collection</span><span className="stat-symbol">▱</span></article><article className="stat-card stat-white"><span className="stat-label">DUE TODAY</span><strong>{stats.dueToday}</strong><span className="stat-foot">Ready for a quick review</span><span className="stat-symbol">◷</span></article><article className="stat-card stat-dark"><span className="stat-label">MASTERED</span><strong>{stats.mastered}</strong><span className="stat-foot">Cards in your fifth box</span><span className="stat-symbol">✳</span></article></div>
    <div className="dashboard-lower"><section className="panel progress-panel"><div className="panel-heading"><div><p className="eyebrow eyebrow-dark">YOUR LEARNING</p><h2>Progress so far</h2></div><Link className="text-link" to="/progress">See all <span>↗</span></Link></div><div className="progress-track"><span style={{ width: `${stats.progress}%` }} /></div><div className="progress-meta"><span>{stats.progress}% of cards mastered</span><span>{stats.mastered} / {stats.totalCards}</span></div><div className="progress-note"><span className="note-mark">✳</span><span>Keep your sessions short and steady. Every card you review is a step forward.</span></div></section>
      <section className="panel recent-panel"><div className="panel-heading"><div><p className="eyebrow eyebrow-dark">PICK UP A DECK</p><h2>Recently updated</h2></div><Link className="text-link" to="/decks">All decks <span>↗</span></Link></div>{data?.recentDecks?.length ? <div className="recent-list">{data.recentDecks.map((deck) => <Link className="recent-row" to={`/decks/${deck._id}`} key={deck._id}><span className="recent-icon">✳</span><span className="recent-title"><strong>{deck.title}</strong><small>{deck.cardCount} cards · {deck.dueCount} due</small></span><span className="recent-arrow">↗</span></Link>)}</div> : <EmptyState title="Your first deck is waiting" detail="Give a subject its own space and add your first card." action={<Link className="text-link" to="/decks">Create a deck ↗</Link>} />}</section></div>
  </section>;
}
