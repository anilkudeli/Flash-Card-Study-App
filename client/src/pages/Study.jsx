import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { request, send } from '../services/api.js';
import { Loading } from '../components/Status.jsx';

export default function Study() {
  const { deckId } = useParams();
  const [cards, setCards] = useState(null);
  const [deckTitle, setDeckTitle] = useState('All due cards');
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [easyCount, setEasyCount] = useState(0);
  const [hardCount, setHardCount] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const hardReturned = useRef(new Set());
  useEffect(() => {
    setCards(null); setRevealed(false); setReviewed(0); setEasyCount(0); setHardCount(0); setSessionTotal(0); setEnded(false); setError(''); hardReturned.current.clear();
    const path = deckId ? `/decks/${deckId}/study` : '/cards/due?limit=100';
    request(path).then((data) => { const loadedCards = data.cards || data.data || []; setCards(loadedCards); setSessionTotal(loadedCards.length); if (data.deck?.title) setDeckTitle(data.deck.title); })
      .catch((issue) => { setCards([]); setError(issue.message); });
  }, [deckId]);
  async function rate(rating) {
    if (!cards?.length || busy) return;
    setBusy(true); setError('');
    try {
      const currentCard = cards[0];
      const { card: updatedCard } = await request(`/cards/${currentCard._id}/review`, send('POST', { result: rating }));
      const returnToQueue = rating === 'hard' && !hardReturned.current.has(currentCard._id);
      if (returnToQueue) hardReturned.current.add(currentCard._id);
      setCards((current) => returnToQueue ? [...current.slice(1), updatedCard] : current.slice(1));
      setReviewed((count) => count + 1);
      if (returnToQueue) setSessionTotal((count) => count + 1);
      if (rating === 'easy') setEasyCount((count) => count + 1);
      else setHardCount((count) => count + 1);
      setRevealed(false);
    } catch (issue) { setError(issue.message); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    function onKeyDown(event) {
      if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
      if (event.code === 'Space' && cards?.length) { event.preventDefault(); setRevealed((value) => !value); }
      if (revealed && !busy && event.key === 'ArrowLeft') { event.preventDefault(); rate('hard'); }
      if (revealed && !busy && event.key === 'ArrowRight') { event.preventDefault(); rate('easy'); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cards, revealed, busy]);
  if (cards === null) return <div className="page-frame"><Loading label="Gathering your cards" /></div>;
  const complete = ended || cards.length === 0;
  return <section className="study-page"><div className="study-top"><Link className="back-link" to={deckId ? `/decks/${deckId}` : '/dashboard'}>← Leave study</Link><span className="study-deck-name">{deckTitle}</span><span className="study-session-count">{reviewed} reviewed</span></div>
    {error && <p className="form-error study-error">{error}</p>}
    {!complete ? <div className="study-content"><div className="study-progress-row"><span>{cards.length} LEFT <span className="keyboard-hint">← HARD &nbsp; → EASY</span></span><span>{reviewed} <i>/</i> {sessionTotal}</span></div><div className="study-progress-track"><span style={{ width: `${sessionTotal ? reviewed / sessionTotal * 100 : 0}%` }} /></div><article className={`study-card${revealed ? ' is-revealed' : ''}`} role="button" tabIndex="0" aria-label={revealed ? 'Flashcard answer. Activate to show the front' : 'Flashcard question. Activate to reveal the answer'} onClick={() => setRevealed((value) => !value)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setRevealed((value) => !value); } }}><div className="study-card-meta"><span>{(cards[0].deck?.title || deckTitle).toUpperCase()}</span><span className={`box-pill box-${cards[0].box}`}>BOX {cards[0].box}</span></div><span className="study-face-label">{revealed ? 'BACK' : 'FRONT'}</span><p className="study-card-text">{revealed ? cards[0].back : cards[0].front}</p><div className="study-card-bottom"><span>{revealed ? 'Take a moment to recall it.' : 'Click the card or press Space to reveal.'}</span><span>✳</span></div></article>{!revealed ? <button className="button button-dark reveal-button" onClick={() => setRevealed(true)}>Reveal answer <span>↓</span></button> : <div className="rating-area"><p>How did that feel?</p><div className="rating-buttons"><button className="rating-button hard-button" onClick={() => rate('hard')} disabled={busy}><span>↻</span><strong>Hard</strong><small>Again in 10 min</small></button><button className="rating-button easy-button" onClick={() => rate('easy')} disabled={busy}><span>↗</span><strong>Easy</strong><small>Move to next box</small></button></div></div>}<button className="end-session-button" onClick={() => setEnded(true)}>End session</button></div> : <div className="study-complete"><div className="complete-mark">✳</div><p className="eyebrow eyebrow-dark">{error ? 'STUDY SESSION' : reviewed ? 'SESSION COMPLETE' : 'STUDY SESSION'}</p><h1>{error ? 'Study session unavailable' : reviewed ? 'Session complete.' : 'No cards to study right now.'}</h1><p>{error || (reviewed ? `You reviewed ${reviewed} ${reviewed === 1 ? 'card' : 'cards'}: ${easyCount} Easy and ${hardCount} Hard. Hard cards return in about 10 minutes; Easy cards wait longer after successful reviews.` : 'There are no cards due in this session. Add a few new cards or come back when the next ones are ready.')}</p>{reviewed > 0 && <div className="session-totals"><span><strong>{easyCount}</strong> EASY</span><span><strong>{hardCount}</strong> HARD</span></div>}<div className="heading-actions"><Link className="button button-dark" to="/dashboard">Back to dashboard <span>↗</span></Link>{deckId && <Link className="button button-outline" to={`/decks/${deckId}`}>View deck</Link>}</div></div>}
  </section>;
}
