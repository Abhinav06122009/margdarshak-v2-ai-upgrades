import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onRemove
}) => {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      default: return Info;
    }
  };

  const getColors = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'from-green-500 to-emerald-600 border-green-400/50';
      case 'error': return 'from-red-500 to-rose-600 border-red-400/50';
      case 'warning': return 'from-yellow-500 to-orange-600 border-yellow-400/50';
      default: return 'from-blue-500 to-indigo-600 border-blue-400/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-4 right-4 z-50 space-y-2"
    >
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = getIcon(notification.type);
          const colors = getColors(notification.type);
          
          return (
            <motion.div
              key={notification.id}
              initial={{ x: 400, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 400, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`
                relative max-w-sm p-4 rounded-2xl backdrop-blur-2xl border
                bg-black ${colors} text-white shadow-2xl
              `}
            >
              <div className="flex items-start space-x-3">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-xs opacity-90 mt-1">{notification.message}</p>
                </div>
                <button
                  onClick={() => onRemove(notification.id)}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: notification.duration || 5, ease: "linear" }}
                onAnimationComplete={() => onRemove(notification.id)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification
  };
};