import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    const unsub = notificationService.subscribeUserNotifications(
      currentUser.uid,
      (data) => setNotifications(data),
      (err) => console.error("Notifications error:", err)
    );

    return () => unsub();
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = async (notif) => {
    if (!notif.read) {
      await notificationService.markAsRead(notif.id);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative p-2 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-red text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-3 z-50 animate-in fade-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 pb-2 border-b border-neutral-100 flex items-center justify-between">
            <h4 className="font-bold text-sm text-neutral-900">Notifications</h4>
            <span className="text-[11px] text-neutral-400 font-medium">
              {unreadCount} unread
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-neutral-50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 hover:bg-neutral-50 transition-colors cursor-pointer text-left space-y-1 ${
                    !notif.read ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-neutral-900 truncate pr-2">
                      {notif.title || 'Expedition Notice'}
                    </h5>
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-snug">
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
