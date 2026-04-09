import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaTimes, FaComments, FaUser, FaUserShield, FaLightbulb } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const QUICK_MESSAGES = [
  "Can you provide a better price?",
  "When can I expect a response?",
  "Is this the best price you can offer?",
  "Can we negotiate on bulk orders?",
  "Are these medicines in stock?"
];

const NegotiationChat = ({ orderId, isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 100);
      // Poll for new messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/quotes/${orderId}/negotiations`);
      if (response.data.success) {
        const newMessages = response.data.data;
        setMessages(newMessages);

        // Show notification if new message arrived
        if (newMessages.length > lastMessageCount && lastMessageCount > 0) {
          // Play sound or show notification
          console.log('New message received!');
        }
        setLastMessageCount(newMessages.length);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await axios.post(`/api/quotes/${orderId}/negotiate`, {
        message: newMessage.trim()
      });

      if (response.data.success) {
        setMessages([...messages, response.data.data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <FaComments className="text-blue-600 text-xl" />
            <h2 className="text-xl font-semibold">Negotiation Chat</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <FaComments className="text-4xl mx-auto mb-2 text-gray-300" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMyMessage = msg.user_id === user?.user_id;
              const isAdmin = msg.role === 'ADMIN';

              return (
                <div
                  key={msg.negotiation_id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                    {/* Sender Info */}
                    <div className={`flex items-center space-x-2 mb-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                      {isAdmin ? (
                        <FaUserShield className="text-blue-600" />
                      ) : (
                        <FaUser className="text-gray-600" />
                      )}
                      <span className="text-xs text-gray-600 font-medium">
                        {isAdmin ? 'Admin' : 'You'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`rounded-lg p-3 ${
                        isMyMessage
                          ? 'bg-blue-600 text-white'
                          : isAdmin
                          ? 'bg-green-100 text-gray-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Messages */}
        {showQuickMessages && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 flex items-center space-x-1">
                <FaLightbulb className="text-yellow-500" />
                <span>Quick Messages</span>
              </span>
              <button
                onClick={() => setShowQuickMessages(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Hide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_MESSAGES.map((msg, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setNewMessage(msg);
                    setShowQuickMessages(false);
                    inputRef.current?.focus();
                  }}
                  className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 transition"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          {!showQuickMessages && (
            <button
              type="button"
              onClick={() => setShowQuickMessages(true)}
              className="text-xs text-blue-600 hover:underline mb-2 flex items-center space-x-1"
            >
              <FaLightbulb />
              <span>Show quick messages</span>
            </button>
          )}
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 input-field"
              disabled={sending}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="btn-primary px-6 flex items-center space-x-2"
            >
              <FaPaperPlane />
              <span>{sending ? 'Sending...' : 'Send'}</span>
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              💡 Use this chat to negotiate prices or ask questions
            </p>
            <span className="text-xs text-gray-400">
              {newMessage.length}/500
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NegotiationChat;
