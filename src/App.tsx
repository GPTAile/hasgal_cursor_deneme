import React, { useState, useEffect } from 'react';
import './style.css';

const sampleWords = [
  { en: 'apple', tr: 'elma', example: 'I eat an apple every day.' },
  { en: 'book', tr: 'kitap', example: 'This book is very interesting.' },
  { en: 'car', tr: 'araba', example: 'My car is red.' },
  { en: 'dog', tr: 'köpek', example: 'The dog is barking.' },
  { en: 'house', tr: 'ev', example: 'Our house is big.' },
];

function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

const STORAGE_KEY = 'userWords';
const STATS_KEY = 'wordStats';
const REPEAT_KEY = 'repeatStats';

type UserWord = { en: string; tr: string; example?: string };
type WordStats = {
  learned: string[];
  notLearned: string[];
};
type RepeatStats = {
  [date: string]: number;
};

const getToday = () => new Date().toISOString().slice(0, 10);

const Navbar: React.FC<{ page: string; setPage: (p: any) => void }> = ({ page, setPage }) => (
  <nav className="navbar">
    <div className="navbar-logo">
      <img src="/HASGAL.png" alt="Logo" />
      <span className="navbar-title">hasgal cursor denemesi</span>
    </div>
    <div className="navbar-links">
      <button className={`navbar-link${page === 'flashcard' ? ' active' : ''}`} onClick={() => setPage('flashcard')}>Ezberle</button>
      <button className={`navbar-link${page === 'quiz' ? ' active' : ''}`} onClick={() => setPage('quiz')}>Test</button>
      <button className={`navbar-link${page === 'words' ? ' active' : ''}`} onClick={() => setPage('words')}>Kelimelerim</button>
      <button className={`navbar-link${page === 'stats' ? ' active' : ''}`} onClick={() => setPage('stats')}>İstatistikler</button>
      <button className={`navbar-link${page === 'chat' ? ' active' : ''}`} onClick={() => setPage('chat')}>ChatBot</button>
    </div>
  </nav>
);

const Flashcard: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [known, setKnown] = useState<string[]>([]);
  const [unknown, setUnknown] = useState<string[]>([]);
  const [showStar, setShowStar] = useState(false);
  const word = sampleWords[index];

  useEffect(() => {
    const stats: WordStats = JSON.parse(localStorage.getItem(STATS_KEY) || '{"learned":[],"notLearned":[]}');
    setKnown(stats.learned);
    setUnknown(stats.notLearned);
  }, []);

  useEffect(() => {
    const stats: WordStats = { learned: known, notLearned: unknown };
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    const repeat: RepeatStats = JSON.parse(localStorage.getItem(REPEAT_KEY) || '{}');
    const today = getToday();
    repeat[today] = (repeat[today] || 0) + 1;
    localStorage.setItem(REPEAT_KEY, JSON.stringify(repeat));
  }, [known, unknown]);

  const nextCard = () => {
    setShowBack(false);
    setShowStar(false);
    setTimeout(() => {
      if (index < sampleWords.length - 1) {
        setIndex(index + 1);
      } else {
        setIndex(0);
      }
    }, 400);
  };

  const handleKnow = () => {
    if (!known.includes(word.en)) setKnown([...known, word.en]);
    setUnknown(unknown.filter(w => w !== word.en));
    setShowStar(true);
    setTimeout(nextCard, 900);
  };
  const handleDontKnow = () => {
    if (!unknown.includes(word.en)) setUnknown([...unknown, word.en]);
    setKnown(known.filter(w => w !== word.en));
    nextCard();
  };

  return (
    <div className="flashcard-container">
      <div
        className={`flashcard${showBack ? ' flipped' : ''}`}
        onClick={() => setShowBack(!showBack)}
        style={{ position: 'relative' }}
      >
        <div className="flashcard-front">
          <div style={{ fontSize: 32, fontWeight: 600 }}>{word.en}</div>
          <div style={{ fontSize: 16, color: '#888', marginTop: 10 }}>Kelimeye tıkla, Türkçesini ve örneği gör!</div>
        </div>
        <div className="flashcard-back">
          <div style={{ fontSize: 28, fontWeight: 500 }}>{word.tr}</div>
          <div style={{ fontSize: 14, marginTop: 10, fontStyle: 'italic' }}>{word.example}</div>
        </div>
        {showStar && <span className="flashcard-star">⭐</span>}
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 10 }}>
        <button className="btn" onClick={handleKnow}>Biliyorum</button>
        <button className="btn" onClick={handleDontKnow}>Bilmiyorum</button>
      </div>
      <div style={{ marginTop: 8, color: '#888' }}>
        {index + 1} / {sampleWords.length} kart
      </div>
      <div style={{ marginTop: 8, color: '#888', fontSize: 14 }}>
        Biliyorum: {known.length} &nbsp;|&nbsp; Bilmiyorum: {unknown.length}
      </div>
    </div>
  );
};

const Quiz: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [showStar, setShowStar] = useState(false);

  const questions = sampleWords.map((word, idx) => {
    const wrongs = shuffleArray(sampleWords.filter((_, i) => i !== idx)).slice(0, 3);
    const options = shuffleArray([
      { tr: word.tr, correct: true },
      ...wrongs.map((w) => ({ tr: w.tr, correct: false })),
    ]);
    return {
      question: `"${word.en}" kelimesinin Türkçesi nedir?`,
      options,
      correct: options.findIndex((o) => o.correct),
      en: word.en,
    };
  });

  useEffect(() => {
    if (showResult) {
      const stats: WordStats = JSON.parse(localStorage.getItem(STATS_KEY) || '{"learned":[],"notLearned":[]}');
      questions.forEach((q, i) => {
        if (i < score) {
          if (!stats.learned.includes(q.en)) stats.learned.push(q.en);
          stats.notLearned = stats.notLearned.filter(w => w !== q.en);
        } else {
          if (!stats.notLearned.includes(q.en)) stats.notLearned.push(q.en);
        }
      });
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
      const repeat: RepeatStats = JSON.parse(localStorage.getItem(REPEAT_KEY) || '{}');
      const today = getToday();
      repeat[today] = (repeat[today] || 0) + questions.length;
      localStorage.setItem(REPEAT_KEY, JSON.stringify(repeat));
    }
  }, [showResult]);

  const handleSelect = (i: number) => {
    setSelected(i);
    if (i === questions[current].correct) {
      setScore(score + 1);
      setShowStar(true);
    }
    setTimeout(() => {
      setShowStar(false);
      if (current < questions.length - 1) {
        setCurrent(current + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 900);
  };

  if (showResult) {
    return (
      <div className="box" style={{ margin: '2rem auto', maxWidth: 400 }}>
        <h2>Test Sonucu</h2>
        <p>Doğru sayısı: {score} / {questions.length}</p>
        <button className="btn" onClick={() => { setCurrent(0); setScore(0); setShowResult(false); setSelected(null); }}>Tekrar Dene</button>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="quiz-card box" style={{ margin: '2rem auto', maxWidth: 400, position: 'relative' }}>
      <div style={{ fontWeight: 500, marginBottom: 16 }}>Soru {current + 1} / {questions.length}</div>
      <div style={{ fontSize: 20, marginBottom: 24 }}>{q.question}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {q.options.map((opt, i) => (
          <button
            key={i}
            className={`quiz-option${selected !== null ? (i === q.correct ? ' correct' : selected === i ? ' wrong' : '') : ''}`}
            onClick={() => selected === null && handleSelect(i)}
            disabled={selected !== null}
          >
            {opt.tr}
          </button>
        ))}
      </div>
      {showStar && <span className="flashcard-star" style={{top: 10, right: 20}}>⭐</span>}
      <div style={{ marginTop: 24, color: '#888' }}>Skor: {score}</div>
    </div>
  );
};

const UserWords: React.FC = () => {
  const [words, setWords] = useState<UserWord[]>([]);
  const [en, setEn] = useState('');
  const [tr, setTr] = useState('');
  const [example, setExample] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setWords(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  }, [words]);

  const addWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!en.trim() || !tr.trim()) return;
    setWords([...words, { en: en.trim(), tr: tr.trim(), example: example.trim() }]);
    setEn(''); setTr(''); setExample('');
  };

  const removeWord = (idx: number) => {
    setWords(words.filter((_, i) => i !== idx));
  };

  return (
    <div className="box" style={{ margin: '2rem auto', maxWidth: 400 }}>
      <h2>Kelimelerim</h2>
      <form onSubmit={addWord} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        <input value={en} onChange={e => setEn(e.target.value)} placeholder="İngilizce kelime" required />
        <input value={tr} onChange={e => setTr(e.target.value)} placeholder="Türkçesi" required />
        <input value={example} onChange={e => setExample(e.target.value)} placeholder="Örnek cümle (isteğe bağlı)" />
        <button className="btn" type="submit">Ekle</button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {words.length === 0 && <li>Henüz kelime eklemediniz.</li>}
        {words.map((w, i) => (
          <li key={i} style={{ background: '#f9fafb', color: '#222', borderRadius: 8, marginBottom: 10, padding: 12, boxShadow: '0 1px 4px #0001', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <b>{w.en}</b> - {w.tr}
              {w.example && <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{w.example}</div>}
            </div>
            <button onClick={() => removeWord(i)} style={{ background: '#ffdddd', color: '#a00', border: 'none', borderRadius: 6, padding: '0.3em 0.7em', cursor: 'pointer' }}>Sil</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Stats: React.FC = () => {
  const [stats, setStats] = useState<WordStats>({ learned: [], notLearned: [] });
  const [repeat, setRepeat] = useState<RepeatStats>({});

  useEffect(() => {
    const s = localStorage.getItem(STATS_KEY);
    if (s) setStats(JSON.parse(s));
    const r = localStorage.getItem(REPEAT_KEY);
    if (r) setRepeat(JSON.parse(r));
  }, []);

  const total = sampleWords.length;
  const learned = stats.learned.length;
  const notLearned = stats.notLearned.length;
  const today = getToday();
  const todayRepeat = repeat[today] || 0;

  return (
    <div className="box" style={{ margin: '2rem auto', maxWidth: 400 }}>
      <h2>İstatistikler</h2>
      <ul style={{ listStyle: 'none', padding: 0, fontSize: 18 }}>
        <li>Toplam kelime: {total}</li>
        <li>Öğrenilen kelime: {learned}</li>
        <li>Öğrenilmeyen kelime: {notLearned}</li>
        <li>Bugünkü tekrar: {todayRepeat}</li>
      </ul>
      <div style={{ marginTop: 24 }}>
        <b>Günlük tekrar geçmişi:</b>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: 15 }}>
          {Object.entries(repeat).length === 0 && <li>Henüz tekrar yapılmadı.</li>}
          {Object.entries(repeat).map(([date, count]) => (
            <li key={date}>{date}: {count} tekrar</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !apiKey) return;
    const userMsg = { role: 'user' as const, text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMsg.text }] }],
        }),
      });
      const data = await res.json();
      const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Bir hata oluştu.';
      setMessages((msgs) => [...msgs, { role: 'bot' as const, text: botText }]);
    } catch (err) {
      setMessages((msgs) => [...msgs, { role: 'bot' as const, text: 'Bir hata oluştu.' }]);
    }
    setLoading(false);
  };

  if (!apiKey) {
    return <div className="box" style={{ margin: '2rem auto', maxWidth: 400, color: '#a00' }}>
      <b>API anahtarı bulunamadı.</b><br />
      Lütfen proje köküne <code>.env</code> dosyası ekleyin ve <br />
      <code>VITE_GEMINI_API_KEY=buraya_anahtarınızı_yazın</code> satırını girin.
    </div>;
  }

  return (
    <div className="box" style={{ margin: '2rem auto', maxWidth: 500 }}>
      <h2>ChatBot (Gemini)</h2>
      <div style={{ minHeight: 220, maxHeight: 320, overflowY: 'auto', background: '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 16, boxShadow: '0 1px 4px #0001' }}>
        {messages.length === 0 && <div style={{ color: '#888' }}>Sorunuzu yazın ve gönderin.</div>}
        {messages.map((msg, i) => (
          <div key={i} style={{
            textAlign: msg.role === 'user' ? 'right' : 'left',
            margin: '8px 0',
          }}>
            <span style={{
              display: 'inline-block',
              background: msg.role === 'user' ? '#3b82f6' : '#e5e7eb',
              color: msg.role === 'user' ? '#fff' : '#222',
              borderRadius: 12,
              padding: '8px 14px',
              maxWidth: 320,
              fontSize: 15,
              boxShadow: msg.role === 'user' ? '0 2px 8px #3b82f633' : '0 1px 4px #0001',
            }}>{msg.text}</span>
          </div>
        ))}
        {loading && <div style={{ color: '#888', fontStyle: 'italic' }}>Yanıt bekleniyor...</div>}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Sorunuzu yazın..."
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button className="btn" type="submit" disabled={loading || !input.trim()}>Gönder</button>
      </form>
    </div>
  );
};

const App: React.FC = () => {
  const [page, setPage] = useState<'flashcard' | 'quiz' | 'words' | 'stats' | 'chat'>('flashcard');

  return (
    <div>
      <Navbar page={page} setPage={setPage} />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem' }}>
        {page === 'flashcard' && <Flashcard />}
        {page === 'quiz' && <Quiz />}
        {page === 'words' && <UserWords />}
        {page === 'stats' && <Stats />}
        {page === 'chat' && <ChatBot />}
      </div>
    </div>
  );
};

export default App;

