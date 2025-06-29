import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatWindow from './ChatWindow';

const DayDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [dayData, setDayData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fromState = location.state?.day;
    if (fromState) {
      setDayData(fromState);
      setLoading(false);
      return;
    }

    axios.get(`/api/oer/${id}`)
      .then(res => { setDayData(res.data); setLoading(false); })
      .catch(() => { setDayData(undefined); setLoading(false); });
  }, [id, location.state]);

  if (loading) return <div className="text-center mt-12">Loading...</div>;

  if (dayData === undefined) {
    return (
      <div className="text-center mt-12">
        <p className="text-red-500">No study resources available.</p>
        <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md">Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">
        {dayData.title || dayData.topic || `Day Details`}
      </h2>

      {dayData.url && (
        <div className="mb-6">
          <a href={dayData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            View Original Resource
          </a>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-2">📖 Lesson</h3>
      {Array.isArray(dayData.lesson) ? (
        <ul className="list-disc ml-5 text-gray-700 text-sm space-y-2">
          {dayData.lesson.map((point, idx) => (
            <li key={idx}>{point}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700 text-sm">{dayData.lesson}</p>
      )}

      {dayData.quiz && (
        <>
          <h3 className="text-xl font-semibold mt-6 mb-2">📝 Quiz / Reflection</h3>
          {Array.isArray(dayData.quiz) ? (
            <ul className="list-disc ml-5 text-purple-700 bg-purple-50 p-4 rounded-md border border-purple-300 text-sm space-y-1">
              {dayData.quiz.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          ) : (
            <p className="text-purple-700 bg-purple-50 p-4 border border-purple-300 rounded-md text-sm">{dayData.quiz}</p>
          )}
        </>
      )}

      {dayData.resources && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">📚 Resources</h3>
          <ul className="list-disc ml-5 text-sm space-y-2">
            {Array.isArray(dayData.resources) ? (
              dayData.resources.map((res, idx) => {
                if (typeof res === 'string') {
                  return (
                    <li key={idx}>
                      <a href={res} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                        {res}
                      </a>
                    </li>
                  );
                }
                if (typeof res === 'object' && res.url) {
                  return (
                    <li key={idx}>
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">
                        {res.title || res.url}
                      </a>
                      {res.summary && <p className="text-gray-600 text-sm mt-1">{res.summary}</p>}
                    </li>
                  );
                }
                return null;
              })
            ) : (
              <li>{JSON.stringify(dayData.resources)}</li>
            )}
          </ul>
        </div>
      )}

      <div className="mt-10">
        <ChatWindow context={`${dayData.topic || ''}\n\n${(dayData.lesson || []).join('\n')}`} />
      </div>

      <div className="mt-8">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
        >
          <svg className="w-4 h-4 transform -translate-x-1 group-hover:-translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Plan
        </button>
      </div>
    </div>
  );
};

export default DayDetails;