import React, { useState } from 'react';
import axios from 'axios';

const ChatWindow = () => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setChat([...chat, userMsg]);

    try {
      const res = await axios.post('/api/chat', { message: input });
      const botMsg = { role: 'assistant', content: res.data.reply };
      setChat([...chat, userMsg, botMsg]);
      setInput('');
    } catch {
      setChat([...chat, userMsg, { role: 'assistant', content: "Error contacting AI." }]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-xl p-4 rounded-md border">
      <h4 className="font-semibold mb-2">💬 Ask about today’s lesson</h4>
      <div className="h-40 overflow-y-auto text-sm mb-2">
        {chat.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'text-right text-gray-600' : 'text-gray-700'}>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        className="w-full border px-2 py-1 rounded text-sm"
        placeholder="Ask me anything..."
      />
    </div>
  );
};

export default ChatWindow;