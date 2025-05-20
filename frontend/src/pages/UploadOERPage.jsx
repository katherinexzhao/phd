import React, { useState } from 'react';

const UploadOERPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }
    // Simulate upload
    console.log({ title, description, file });
    setMessage('Upload successful (simulated)');
    // For real upload:
    // const formData = new FormData();
    // formData.append('title', title);
    // formData.append('description', description);
    // formData.append('file', file);
    // await fetch('/api/oer/upload', { method: 'POST', body: formData });
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Upload Learning Material to OER</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Title:</label><br />
          <input value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Description:</label><br />
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Select File:</label><br />
          <input type="file" onChange={e => setFile(e.target.files[0])} required />
        </div>
        <button type="submit" style={{ width: '100%', padding: 8 }}>Upload</button>
      </form>
      {message && <div style={{ marginTop: 16, color: 'green' }}>{message}</div>}
    </div>
  );
};

export default UploadOERPage; 