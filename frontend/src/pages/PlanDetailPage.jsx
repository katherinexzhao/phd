// PlanDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatWindow from './ChatWindow';

export default function PlanDetailPage() {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [doneDays, setDoneDays] = useState(() => {
    const saved = localStorage.getItem(`done_${planId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [visibleChats, setVisibleChats] = useState([]);
  const toggleChat = (key) => {
    setVisibleChats(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem(`notes_${planId}`);
    return saved ? JSON.parse(saved) : {};
  });
  const handleNoteChange = (key, text) => {
    const updated = { ...notes, [key]: text };
    setNotes(updated);
    localStorage.setItem(`notes_${planId}`, JSON.stringify(updated));
  };

  const [audioMap, setAudioMap] = useState({});

  useEffect(() => {
    if (!planId) return;
    fetch(`http://localhost:5001/api/plan/${planId}`)
      .then(res => res.json())
      .then(data => {
        let parsed = data.content;
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch {
            parsed = { study_plan: [] };
          }
        }
        setPlan(parsed);
      })
      .catch(err => console.error('❌ Error loading plan:', err));
  }, [planId]);

  const toggleDone = (key) => {
    const updated = doneDays.includes(key)
      ? doneDays.filter(k => k !== key)
      : [...doneDays, key];
    setDoneDays(updated);
    localStorage.setItem(`done_${planId}`, JSON.stringify(updated));
  };

  const generatePodcast = async (day, key) => {
    const text = `
      Welcome to today's lesson on ${day.topic}.
      ${Array.isArray(day.lesson || day.lessons)
        ? (day.lesson || day.lessons).map(c => typeof c === 'string' ? c : `Concept: ${c.concept}. Explanation: ${c.explanation}.`).join(' ')
        : ''
      }
      Now let's review some questions.
      ${Array.isArray(day.quiz)
        ? day.quiz.map(q => `Question: ${q.q} Answer: ${q.a}`).join(' ')
        : ''
      }
    `.replace(/\s+/g, ' ').trim();

    console.log('🧪 Sending podcast generation request with text:', text);
    try {
      const res = await fetch('http://localhost:5001/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          filename: `${key}.mp3`,
        }),
      });
      const data = await res.json();
      if (data.url) {
        setAudioMap(prev => ({ ...prev, [key]: data.url }));
      } else {
        throw new Error('No audio URL returned');
      }
    } catch (err) {
      console.error('❌ Failed to generate podcast:', err);
      alert('Failed to generate podcast.');
    }
  };

  if (!plan) return <p>Loading...</p>;

  const allDays = plan.study_plan.flatMap((w, wi) => w.days.map((d, di) => `${wi}_${di}`));
  const percent = Math.round((doneDays.length / allDays.length) * 100);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📘 Plan Detail</h1>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <p className="mb-6 text-sm text-gray-600">{percent}% complete</p>
      {plan.study_plan?.map((week, wi) => (
        <div key={wi} className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{week.week || `Week ${wi + 1}`}</h2>
          <div className="grid grid-cols-1 gap-4">
            {week.days?.map((day, di) => {
              const key = `${wi}_${di}`;
              const isDone = doneDays.includes(key);
              

              return (
                <div
                  key={di}
                  className={`p-4 border rounded-2xl shadow-md transition-all duration-300 ${isDone ? 'bg-gray-100 opacity-70' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-blue-800">{day.day}: {day.topic}</h3>
                    <button
                      onClick={() => toggleDone(key)}
                      className={`px-2 py-1 text-xs rounded-full font-medium ${isDone ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    >
                      {isDone ? '✔ Done' : 'Mark as Done'}
                    </button>
                  </div>
                  <div className="mb-3">
                    <button
                      onClick={() => generatePodcast(day, key)}
                      className="text-sm text-purple-700 hover:underline mb-1 inline-block"
                    >
                      🎧 Generate Podcast
                    </button>
                    {audioMap[key] && (
                      <div className="mt-2 rounded overflow-hidden border border-gray-300 p-2 bg-gray-50">
                        <audio controls className="w-full" key={audioMap[key]}>
                          <source src={`http://localhost:5001${audioMap[key]}?t=${Date.now()}`} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </div>
                  {visibleChats.includes(`${wi}_${di}`) && (
                    <ChatWindow context={{
                      topic: day.topic,
                      lesson: day.lesson || day.lessons,
                      quiz: day.quiz,
                      keywords: day.keywords,
                      resources: day.resources
                    }} />
                  )}
                  {day.keywords?.length > 0 && (
                    <p className="text-sm text-gray-600 mb-1"><strong>Keywords:</strong> {day.keywords.join(', ')}</p>
                  )}
                  {(day.lessons || day.lesson)?.length > 0 && (
                    <div className="text-sm text-gray-700 mb-1">
                      <strong>Lesson:</strong>
                      <ul className="list-disc list-inside ml-4">
                        {(day.lessons || day.lesson).map((concept, ci) => (
                          <li key={ci}>
                            {typeof concept === 'string' ? (
                              concept
                            ) : (
                              <>
                                <p><strong>Concept:</strong> {concept.concept}</p>
                                <p><strong>Explanation:</strong> {concept.explanation}</p>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(day.quiz) && day.quiz.length > 0 && (
                    <div className="text-sm text-gray-700 mb-1">
                      <strong>Quiz:</strong>
                      <ul className="list-disc list-inside ml-4">
                        {day.quiz.map((q, qi) => (
                          <li key={qi}>
                            <strong>Q:</strong> {q.q || q.question}<br />
                            <strong>A:</strong> {q.a || q.answer}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {day.resources?.length > 0 && (
                    <div className="text-sm mt-2">
                      <strong>Resources:</strong>
                      <ul className="list-disc ml-4 text-blue-600">
                        {day.resources.map((r, ri) => (
                          <li key={ri}><a href={r.url} target="_blank" rel="noreferrer" className="underline">{r.title}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-4 border-t pt-3 relative">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">📝 Your Notes</label>
                      <textarea
                        className="w-full border rounded p-2 text-sm bg-gray-50"
                        rows={3}
                        placeholder="Write your notes here..."
                        value={notes[key] || ''}
                        onChange={(e) => handleNoteChange(key, e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => toggleChat(`${wi}_${di}`)}
                      className="absolute bottom-1 right-1 bg-white border border-gray-300 rounded-full text-lg px-3 py-1 hover:bg-gray-100 shadow"
                      title="Chat about this day"
                    >
                      🤖
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}