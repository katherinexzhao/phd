import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function UploadOERMetaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState('');
  const [educationLevels, setEducationLevels] = useState('');
  const [materialTypes, setMaterialTypes] = useState('');
  const [languages, setLanguages] = useState('');
  const [mediaFormats, setMediaFormats] = useState('');
  const [educationalUse, setEducationalUse] = useState('');
  const [primaryUser, setPrimaryUser] = useState('');
  const [accessibility, setAccessibility] = useState('');
  const [keywords, setKeywords] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Submit all data to backend
    setMessage('Submitted! (Demo)');
  };

  return (
    <div className="w-full min-h-screen flex justify-center overflow-y-auto py-8 bg-stone-300/10">
      <form onSubmit={handleSubmit} className="w-[1008px] min-h-[900px] bg-white rounded-2xl shadow flex flex-col items-center px-2 pb-8">
        <div className="w-full max-w-3xl flex flex-col">
          {/* Page title and general instructions */}
          <div className="mb-10 mt-4 text-center">
            <div className="text-3xl font-extrabold text-blue-800 mb-2">Resource Metadata</div>
            <div className="text-lg text-gray-700 mb-2">Please fill in the detailed metadata for your resource.</div>
            <div className="text-base text-gray-500">For multiple values, separate them with commas ( , ).</div>
          </div>
          {/* Subjects */}
          <div className="mb-6">
            <div className="mb-1 text-base text-gray-700 font-semibold">Subjects</div>
            <input
              type="text"
              value={subjects}
              onChange={e => setSubjects(e.target.value)}
              placeholder="e.g. Math, Science, Language"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          {/* Education Levels */}
          <div className="mb-6">
            <div className="mb-1 text-base text-gray-700 font-semibold">Education Levels</div>
            <input
              type="text"
              value={educationLevels}
              onChange={e => setEducationLevels(e.target.value)}
              placeholder="e.g. Primary, Secondary, Higher Education"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          {/* Material Types */}
          <div className="mb-6">
            <div className="mb-1 text-base text-gray-700 font-semibold">Material Types</div>
            <input
              type="text"
              value={materialTypes}
              onChange={e => setMaterialTypes(e.target.value)}
              placeholder="e.g. Lesson Plan, Video, Worksheet"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          {/* Languages */}
          <div className="mb-6">
            <div className="mb-1 text-base text-gray-700 font-semibold">Languages</div>
            <input
              type="text"
              value={languages}
              onChange={e => setLanguages(e.target.value)}
              placeholder="e.g. English, Chinese, Spanish"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          {/* Media Formats */}
          <div className="mb-6">
            <div className="mb-1 text-base text-gray-700 font-semibold">Media Formats</div>
            <input
              type="text"
              value={mediaFormats}
              onChange={e => setMediaFormats(e.target.value)}
              placeholder="e.g. PDF, Word, PPT, Image"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          {/* Educational Use */}
          <div className="mb-6">
            <div className="mb-1 text-base text-gray-700 font-semibold">Educational Use</div>
            <input
              type="text"
              value={educationalUse}
              onChange={e => setEducationalUse(e.target.value)}
              placeholder="e.g. Instruction, Assessment, Reference"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          {/* Primary User */}
          <div className="mb-6">
            <div className="mb-1 text-base text-gray-700 font-semibold">Primary User</div>
            <input
              type="text"
              value={primaryUser}
              onChange={e => setPrimaryUser(e.target.value)}
              placeholder="e.g. Student, Teacher, Parent"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          {/* Accessibility */}
          <div className="mb-6">
            <div className="mb-1 text-base text-gray-700 font-semibold">Accessibility</div>
            <input
              type="text"
              value={accessibility}
              onChange={e => setAccessibility(e.target.value)}
              placeholder="e.g. Screen Reader, Subtitles, Transcripts"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          {/* Keywords */}
          <div className="mb-6">
            <div className="mb-1 text-base text-gray-700 font-semibold">Keywords</div>
            <input
              type="text"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              placeholder="e.g. AI, Math, Open Education"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          <div className="flex gap-4 mt-8">
            <button type="button" className="px-8 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" onClick={() => navigate(-1)}>Previous</button>
            <button type="submit" className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Submit</button>
          </div>
          {message && <div className="mt-4 px-4 py-2 rounded-lg text-center bg-green-100 text-green-700">{message}</div>}
        </div>
      </form>
    </div>
  );
} 