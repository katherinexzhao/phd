import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UploadOERPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [message, setMessage] = useState('');
  const [justUploaded, setJustUploaded] = useState(false);
  const [email, setEmail] = useState(localStorage.getItem('email') || '');

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      setMessage('Please upload an image file for the cover.');
      setCoverFile(null);
      setCoverPreview('');
      return;
    }
    setMessage('');
    setCoverFile(file);
    setCoverPreview(file ? URL.createObjectURL(file) : '');
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!title || !description || !topic || !file) {
      setMessage('Please fill in all required fields and select a file.');
      return;
    }
    setMessage('');
    navigate('/upload/meta', {
      state: {
        title,
        description,
        topic,
        file,
        coverFile,
        email
      }
    });
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center py-8 overflow-y-auto">
      <form onSubmit={handleNext} className="w-full max-w-2xl bg-white rounded-2xl shadow-lg flex flex-col items-center px-6 py-10">
        {/* Title Input */}
        <div className="w-full">
          <div className="mb-1 text-base text-gray-700 font-semibold">Resource Title</div>
          <div className="mb-3 text-sm text-gray-500">Enter a clear and concise title for your resource.</div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of your post"
            className="w-full h-12 px-4 text-xl text-black/80 border border-gray-300 rounded-lg focus:outline-gray-500 focus:text-black"
          />
        </div>

        {/* Cover Image Upload - Centered */}
        <div className="w-full flex flex-col items-center mt-8 mb-2">
          <div className="mb-1 text-base text-gray-700 font-semibold">Cover Image (Optional)</div>
          <div className="mb-3 text-sm text-gray-500 text-center">Upload a cover image to visually represent your resource. Supported formats: jpg, png, webp, etc.</div>
          <label className="w-64 h-40 flex flex-col items-center justify-center bg-white rounded-xl shadow outline outline-1 outline-black/20 cursor-pointer hover:bg-gray-50">
            {coverPreview ? (
              <img src={coverPreview} alt="cover preview" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="text-black/50 text-lg flex items-center justify-center w-full h-full text-center">Add cover image (optional)</span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </label>
          {coverFile && (
            <span className="mt-2 text-sm text-gray-600">{coverFile.name}</span>
          )}
        </div>

        {/* Description Input */}
        <div className="w-full mt-8">
          <div className="mb-1 text-base text-gray-700 font-semibold">Resource Description</div>
          <div className="mb-3 text-sm text-gray-500">Describe your experience, tips, or details about this resource. The more detailed, the better!</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your experience, tips, or resource description..."
            className="w-full h-32 p-4 text-lg text-black/80 border border-gray-300 rounded-lg focus:outline-gray-500 focus:text-black resize-none"
          />
        </div>

        {/* Resource Topic Input (direct input) */}
        <div className="w-full mt-8">
          <div className="mb-1 text-base text-gray-700 font-semibold">Resource Topic</div>
          <div className="mb-3 text-sm text-gray-500">Please enter the topic that best matches your resource (e.g. Education, IT, Banking, etc.).</div>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your resource topic (required)"
            className="w-full h-12 px-4 text-xl text-black/80 border border-gray-300 rounded-lg focus:outline-gray-500 focus:text-black"
          />
        </div>

        {/* File Upload Button */}
        <div className="w-full mt-8 flex flex-col items-start">
          <div className="mb-1 text-base text-gray-700 font-semibold">Upload Resource File</div>
          <div className="mb-3 text-sm text-gray-500">Select the file you want to upload (PDF, Word, PPT, image, etc.).</div>
          <div className="w-32 h-10 relative">
            <label className="w-full h-full flex items-center justify-center bg-white rounded-lg shadow outline outline-1 outline-black/20 cursor-pointer hover:bg-gray-50">
              <span className="text-black text-lg">Choose File</span>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
            </label>
            {file && (
              <span className="ml-4 text-sm text-gray-600">{file.name}</span>
            )}
          </div>
        </div>

        {/* Next Button */}
        <button
          type="submit"
          className="mt-10 px-8 py-3 rounded-lg text-white text-lg font-semibold bg-black hover:bg-gray-700 shadow-lg hover:shadow-xl w-full max-w-xs"
        >
          Next
        </button>

        {/* Messages */}
        {message && (
          <div className="mt-4 px-4 py-2 rounded-lg text-center bg-red-100 text-red-700 w-full">{message}</div>
        )}
      </form>
    </div>
  );
};

export default UploadOERPage; 