import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../services/api.js';
import { EmptyState, Loading } from '../components/Status.jsx';

export default function Progress() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { request('/decks/summary/dashboard').then(setData).catch((issue) => setError(issue.message)); }, []);
  if (!data && !error) return <div className="page-frame"><Loading label="Loading your progress" /></div>;
  const stats = data?.stats;
  return <section className="page-frame progress-page"><div className="page-heading"><div><p className="eyebrow eyebrow-dark">THE BIG PICTURE</p><h1>Your progress</h1><p>Notice what’s getting easier, one review at a time.</p></div><Link className="button button-dark" to="/study">Study due cards <span>→</span></Link></div>{error && <p className="form-error">{error}</p>}
    <section className="progress-overview"><div className="progress-ring" style={{ '--progress': `${stats?.progress || 0}%` }}><div><strong>{stats?.progress || 0}%</strong><span>mastered</span></div></div><div className="overview-copy"><p className="eyebrow eyebrow-dark">YOUR STUDY SNAPSHOT</p><h2>{stats?.mastered || 0} ideas are staying with you.</h2><p>Cards move through five boxes as they become familiar. A little repeat practice builds lasting recall.</p><div className="overview-stats"><span><strong>{stats?.totalCards || 0}</strong> total cards</span><span><strong>{stats?.dueToday || 0}</strong> due today</span><span><strong>{stats?.totalDecks || 0}</strong> decks</span></div></div></section>
    <div className="panel-heading progress-decks-heading"><div><p className="eyebrow eyebrow-dark">SUBJECT BY SUBJECT</p><h2>Deck progress</h2></div><Link className="text-link" to="/decks">Manage decks <span>↗</span></Link></div>{data?.recentDecks?.length ? <div className="progress-deck-list">{data.recentDecks.map((deck) => <Link className="progress-deck-row" to={`/decks/${deck._id}`} key={deck._id}><span className="progress-deck-title"><strong>{deck.title}</strong><small>{deck.cardCount} cards · {deck.dueCount} due today</small></span><span className="progress-line"><i style={{ width: `${deck.progress}%` }} /></span><strong className="progress-percent">{deck.progress}%</strong><span className="recent-arrow">↗</span></Link>)}</div> : <EmptyState title="Progress starts with your first card" detail="Create a deck to see your learning take shape." action={<Link className="text-link" to="/decks">Create a deck ↗</Link>} />}
  </section>;
}
