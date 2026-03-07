import React, { useState } from 'react';
import axios from 'axios';


const ChatWindow = ({ context }) => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);

  React.useEffect(() => {
    console.log("🧩 Received context in ChatWindow:",  JSON.stringify(context, null, 2));
  }, [context]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setChat(prev => [...prev, userMsg]);

    try {
      const res = await axios.post('/api/chat', { message: input, context: context });
      const botMsg = { role: 'assistant', content: res.data.reply };
      setChat(prev => [...prev, userMsg, botMsg]);
      setInput('');
    } catch (error) {
      console.error('❌ Error from /api/chat:', error.response?.data || error.message);
      setChat(prev => [...prev, userMsg, { role: 'assistant', content: "Error contacting AI." }]);
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