import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  { number: '01', title: 'Small sessions, big recall', text: 'A focused handful of cards keeps your routine light enough to come back to.', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85', alt: 'Notebook and pen on a study desk' },
  { number: '02', title: 'A rhythm that remembers', text: 'Five simple review boxes bring each idea back right when it is ready to stick.', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=85', alt: 'Open books arranged on a library shelf' },
  { number: '03', title: 'Your learning, in view', text: 'See what is new, what is becoming familiar, and what you have mastered.', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85', alt: 'Student studying at a laptop' }
];

export default function Home() {
  const { user } = useAuth();
  const startPath = user ? '/decks' : '/register';
  return <>
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> A calmer way to remember</p>
          <h1>Make learning<br /><em>feel natural.</em></h1>
          <p className="hero-description">A little practice at the right moment goes a long way. Gather what you’re learning into decks, and let Flash Card Study App help it stay with you.</p>
          <div className="hero-actions"><Link className="button button-coral" to={startPath}>Create your first deck <span aria-hidden="true">↗</span></Link><Link className="button button-text" to={user ? '/study' : '/login'}>Start studying <span aria-hidden="true">→</span></Link></div>
          <div className="hero-note"><span className="avatar-stack"><i>J</i><i>M</i><i>A</i></span><span>Made for steady, meaningful progress</span></div>
        </div>
        <div className="hero-art" aria-label="A sample flashcard showing the concept of spaced repetition">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="hero-card hero-card-back"><span>STUDY NOTE · 04</span><i>the best time to review<br />is just before you forget</i></div>
          <div className="hero-card hero-card-front"><div className="card-topline"><span>YOUR STUDY DECK</span><span className="card-count">03 / 12</span></div><p>What makes a<br /><strong>new idea</strong> stick?</p><div className="card-bottomline"><span>Tap to reveal</span><span className="card-spark">✳</span></div></div>
          <div className="floating-tag"><span className="tag-dot" /> READY WHEN YOU ARE</div>
          <div className="art-caption"><span className="caption-line" /> THE SPACED REVIEW METHOD</div>
        </div>
      </div>
      <div className="hero-bottom"><span>LESS CRAMMING. MORE KEEPING.</span><span>BUILD A STUDY HABIT THAT FITS YOUR DAY</span></div>
    </section>

    <section className="intro-band"><div className="section-wrap intro-grid"><p className="eyebrow eyebrow-dark">A TOOL FOR THE LONG GAME</p><div><h2>Remember more by<br />studying <em>less at once.</em></h2><p>Flash Card Study App turns your notes into simple flashcards and helps you revisit them at a pace that makes sense. No streak pressure. No noise. Just the next right card.</p></div></div></section>

    <section className="features-section"><div className="section-wrap"><div className="section-heading"><div><p className="eyebrow eyebrow-dark">THOUGHTFULLY SIMPLE</p><h2>Study with intention.</h2></div><Link className="underlined-link" to={startPath}>Find your rhythm <span>↗</span></Link></div><div className="feature-grid">{features.map((feature) => <article className="feature-item" key={feature.number}><div className="feature-image"><img src={feature.image} alt={feature.alt} loading="lazy" /><span>{feature.number} / THE STUDY PRACTICE</span></div><span className="feature-number">{feature.number}</span><h3>{feature.title}</h3><p>{feature.text}</p><span className="feature-mark">↗</span></article>)}</div></div></section>

    <section className="how-section"><div className="section-wrap how-grid"><div><p className="eyebrow">A SIMPLE LOOP</p><h2>Three steps.<br /><em>More clarity.</em></h2><p className="how-lead">You bring the curiosity. We’ll keep the next review within reach.</p></div><div className="steps-list"><article><span>01</span><div><h3>Collect what matters</h3><p>Turn the things you want to remember into a deck of clear questions.</p></div></article><article><span>02</span><div><h3>Show up for a few</h3><p>Study one card at a time. Reveal the answer when you’re ready.</p></div></article><article><span>03</span><div><h3>Choose your pace</h3><p>Mark each card Easy or Hard. Your next review finds its place.</p></div></article></div></div></section>

    <section className="preview-section"><div className="section-wrap preview-grid"><div><p className="eyebrow eyebrow-dark">YOUR PROGRESS, AT A GLANCE</p><h2>Small steps<br />add up.</h2><p>Every review helps build a clearer picture of what you know. Your study space is ready when you are.</p><Link className="button button-dark" to={startPath}>Start your study space <span>↗</span></Link></div><div className="preview-visual"><div className="preview-stamp">YOUR<br />PACE</div><div className="preview-sheet"><div className="sheet-heading"><span>WEEKLY OVERVIEW</span><span>THIS WEEK ↗</span></div><div className="sheet-total"><strong>08</strong><span>cards reviewed<br />today</span></div><div className="bar-chart"><i style={{height:'34%'}}/><i style={{height:'55%'}}/><i style={{height:'42%'}}/><i style={{height:'77%'}}/><i style={{height:'62%'}}/><i style={{height:'92%'}}/><i style={{height:'48%'}}/></div><div className="chart-days"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div></div></div></section>
  </>;
}
