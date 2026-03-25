import React, { useState } from 'react';
import { FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const ActionModal = ({ isOpen, onClose, onConfirm, title, message, mode = 'approve', placeholder = 'Enter remarks...' }) => {
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className={`px-6 py-4 flex items-center justify-between ${mode === 'approve' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          <h3 className="font-bold flex items-center gap-2">
            {mode === 'approve' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            {title}
          </h3>
          <button onClick={onClose} className="hover:opacity-70"><FaTimes /></button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4">{message}</p>
          <textarea
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-bc-green-500 focus:border-transparent transition-all outline-none min-h-[100px]"
            placeholder={placeholder}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(remarks);
              setRemarks('');
              onClose();
            }}
            disabled={mode === 'reject' && !remarks.trim()}
            className={`px-6 py-2 rounded-lg text-sm font-bold shadow-sm transition-all disabled:opacity-50 ${
              mode === 'approve' 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            Confirm {mode === 'approve' ? 'Approval' : 'Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
