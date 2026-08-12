import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatAI = ({ title, description, visibleTestCases, startCode }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', parts: [{ text: 'Hello! I am your AI Judgify assistant. Do you need a hint or an explanation for this problem?' }] }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false); 
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;

    // 1. Add user message
    const newMessages = [...messages, { role: 'user', parts: [{ text: userText }] }];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    // 2. Axios API Call using Cookies
    try {
      const response = await axios.post(' http://localhost:3000/ai/chat', 
        {
          userPrompt: userText,
          title, 
          description,
          visibleTestCases, 
          startCode 
        },
        {
          // THIS is the crucial line for cookie-based auth!
          // It tells the browser to automatically attach your auth cookies to this request.
          withCredentials: true 
        }
      );

      setMessages(prev => [...prev, {
        role: 'ai',
        parts: [{ text: response.data.reply }]
      }]);

    } catch (error) {
      console.error("Chat API Error:", error);
      
      let errorMessage = "Oops! I'm having trouble connecting to my server right now. Please try again in a moment.";
      
      // If the backend rejects the cookie (expired or missing), it will return a 401
      if (error.response && error.response.status === 401) {
        errorMessage = "You are not authorized. Please make sure you are logged in.";
      }

      setMessages(prev => [...prev, {
        role: 'ai',
        parts: [{ text: errorMessage }]
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#191e24] rounded-lg border border-gray-800 shadow-inner">
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className={`chat ${msg.role === 'user' ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-image avatar">
              <div className={`w-8 rounded-full flex items-center justify-center font-bold ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-[#2a303c] text-gray-300 border border-gray-600'}`}>
                <span className="text-xs">{msg.role === 'user' ? 'U' : 'AI'}</span>
              </div>
            </div>
            <div className="chat-header text-xs opacity-50 mb-1 text-gray-400">
              {msg.role === 'user' ? 'You' : 'AI Assistant'}
            </div>
            
            <div className={`chat-bubble text-sm ${msg.role === 'user' ? 'chat-bubble-primary' : 'bg-[#2a303c] text-gray-200'} whitespace-pre-wrap`}>
              {msg.parts.map((part, idx) => (
                <span key={idx}>{part.text}</span>
              ))}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-8 rounded-full flex items-center justify-center font-bold bg-[#2a303c] text-gray-300 border border-gray-600">
                <span className="text-xs">AI</span>
              </div>
            </div>
            <div className="chat-bubble bg-[#2a303c] text-gray-200 flex items-center gap-1">
              <span className="loading loading-dots loading-xs"></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#1d232a] border-t border-gray-800 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question..."
            className="input input-bordered flex-1 bg-[#2a303c] text-gray-300 border-gray-700 focus:outline-none focus:border-primary"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            className="btn btn-primary px-6"
            onClick={handleSend}
            disabled={isTyping || !inputValue.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;