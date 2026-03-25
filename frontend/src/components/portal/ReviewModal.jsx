import React, { useState } from 'react';
import { FaTimes, FaUserShield, FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';

const ReviewModal = ({ isOpen, onClose, user, onApprove, onReject }) => {
  const [notes, setNotes] = useState('');

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto animate-in fade-in zoom-in duration-200">
        
        {/* Document Preview */}
        <div className="flex-1 bg-gray-100 p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-gray-200">
           <div className="absolute top-4 left-6 flex items-center gap-2 text-gray-500 font-medium">
             <FaUserShield className="text-bc-green-600" />
             Identity Document
           </div>
           
           {user.aadhaarDocumentPath ? (
             <div className="w-full h-full flex items-center justify-center py-8">
               <img 
                 src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/uploads/aadhaar/${user.aadhaarDocumentPath}`} 
                 alt="KYC Document" 
                 className="max-w-full max-h-full object-contain rounded-lg shadow-md border-4 border-white"
               />
               <a 
                 href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/uploads/aadhaar/${user.aadhaarDocumentPath}`}
                 target="_blank"
                 rel="noreferrer"
                 className="absolute bottom-4 right-6 p-2 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-sm backdrop-blur-md transition-all flex items-center gap-2 text-xs font-bold"
               >
                 <FaEye /> Open Full View
               </a>
             </div>
           ) : (
             <div className="text-gray-400 italic">No document uploaded</div>
           )}
        </div>

        {/* Review Controls */}
        <div className="w-full md:w-80 p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-4 p-3 bg-bc-green-50 rounded-lg text-xs font-medium text-bc-green-800 border border-bc-green-100">
              {user.district}, {user.state}
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Notes</label>
            <textarea
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-bc-green-500 outline-none min-h-[120px] transition-all"
              placeholder="Record any internal notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <p className="mt-2 text-[10px] text-gray-400">These notes will be stored in the audit trail.</p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => { onApprove(user._id, notes); onClose(); }}
              className="w-full py-3 bg-bc-green-600 hover:bg-bc-green-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <FaCheckCircle /> Approve Identity
            </button>
            <button
              onClick={() => { 
                if(!notes.trim()) { alert('Please provide a reason for rejection in notes.'); return; }
                onReject(user._id, notes); 
                onClose(); 
              }}
              className="w-full py-3 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <FaTimesCircle /> Reject Identity
            </button>
            <button onClick={onClose} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Close Review
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReviewModal;
