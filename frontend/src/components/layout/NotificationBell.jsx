import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiCheckCircle, FiX, FiInfo } from 'react-icons/fi';
import { useNotifications } from '../../contexts/NotificationContext';

/* ── Helpers ─────────────────────────────────────────────────────────── */

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_META = {
  token_minted: { icon: '🪙', color: '#059669', bg: '#ecfdf5', label: 'Tokens Credited' },
  plantation_approved: { icon: '🌱', color: '#2563eb', bg: '#eff6ff', label: 'Approved' },
  plantation_rejected: { icon: '❌', color: '#dc2626', bg: '#fef2f2', label: 'Rejected' },
  blockchain_confirmed: { icon: '⛓️', color: '#7c3aed', bg: '#f5f3ff', label: 'Blockchain' },
  kyc_approved: { icon: '✅', color: '#059669', bg: '#ecfdf5', label: 'KYC' },
  kyc_rejected: { icon: '❌', color: '#dc2626', bg: '#fef2f2', label: 'KYC' },
  general: { icon: '📢', color: '#6b7280', bg: '#f9fafb', label: 'Notice' },
};

/* ── NotificationBell ─────────────────────────────────────────────────── */

export default function NotificationBell() {
  const { notifications, unreadCount, loading, open, setOpen, markRead, markAllRead, fetchNotifications } =
    useNotifications();

  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (open && panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, setOpen]);

  const handleOpen = () => {
    if (!open) fetchNotifications(); // refresh on open
    setOpen((v) => !v);
  };

  return (
    <div ref={panelRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* ── Bell Button ── */}
      <motion.button
        id="notification-bell-btn"
        aria-label="Notifications"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
        style={{
          position: 'relative',
          background: open ? 'linear-gradient(135deg,#059669,#0284c7)' : 'transparent',
          border: 'none',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: open ? '#fff' : '#374151',
          transition: 'background 0.2s',
        }}
      >
        {/* Pulse ring when there are unread notifications */}
        {unreadCount > 0 && (
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              position: 'absolute',
              inset: -2,
              borderRadius: '50%',
              border: '2px solid #059669',
              pointerEvents: 'none',
            }}
          />
        )}
        <FiBell size={20} />
        {/* Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              background: '#ef4444',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: '999px',
              minWidth: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              lineHeight: 1,
              boxShadow: '0 0 0 2px #fff',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* ── Dropdown Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="notification-panel"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: 360,
              maxHeight: 480,
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.07)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9999,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '14px 16px 12px',
                borderBottom: '1px solid #f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiBell size={16} color="#059669" />
                <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Notifications</span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: '#059669',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 999,
                      padding: '1px 7px',
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    title="Mark all as read"
                    style={{
                      background: 'none',
                      border: '1px solid #d1fae5',
                      borderRadius: 8,
                      padding: '3px 8px',
                      fontSize: 11,
                      color: '#059669',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <FiCheckCircle size={12} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#6b7280',
                  }}
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loading && notifications.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div
                  style={{
                    padding: 40,
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: 13,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <FiInfo size={32} color="#d1d5db" />
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => {
                  const meta = TYPE_META[n.type] || TYPE_META.general;
                  return (
                    <motion.div
                      key={n._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => !n.isRead && markRead(n._id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f9fafb',
                        cursor: n.isRead ? 'default' : 'pointer',
                        background: n.isRead ? '#fff' : '#f0fdf4',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Icon pill */}
                      <div
                        style={{
                          flexShrink: 0,
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: meta.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                        }}
                      >
                        {meta.icon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: n.isRead ? 500 : 700,
                              fontSize: 13,
                              color: '#111827',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {n.title}
                          </span>
                          <span style={{ flexShrink: 0, fontSize: 11, color: '#9ca3af' }}>
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: '3px 0 0',
                            fontSize: 12,
                            color: '#4b5563',
                            lineHeight: 1.5,
                          }}
                        >
                          {n.message}
                        </p>
                        {/* Token detail chip */}
                        {n.type === 'token_minted' && n.metadata?.tokens && (
                          <div
                            style={{
                              marginTop: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              borderRadius: 6,
                              padding: '2px 8px',
                              fontSize: 11,
                              color: '#065f46',
                              fontWeight: 600,
                            }}
                          >
                            🪙 {n.metadata.tokens} BCC &nbsp;·&nbsp; {n.metadata.co2eq} t CO₂
                          </div>
                        )}
                      </div>

                      {/* Unread dot */}
                      {!n.isRead && (
                        <div
                          style={{
                            flexShrink: 0,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#059669',
                            marginTop: 6,
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
