import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaComments } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const UnreadMessagesBadge = ({ orderId, className = '' }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (orderId && user) {
      fetchUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [orderId, user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`/api/quotes/${orderId}/negotiations`);
      if (response.data.success) {
        const messages = response.data.data;
        // Count unread messages (messages from admin that haven't been read)
        const unread = messages.filter(
          msg => msg.user_id !== user?.user_id && !msg.read_at
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      <FaComments className="text-blue-600" />
      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    </div>
  );
};

export default UnreadMessagesBadge;
