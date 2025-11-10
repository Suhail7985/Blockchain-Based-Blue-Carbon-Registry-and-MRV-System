import React, { useState, useEffect } from 'react';

export default function Verification({ plantations, onUpdatePlantation }) {
  const [pendingPlantations, setPendingPlantations] = useState([]);
  const [selectedPlantation, setSelectedPlantation] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');

  useEffect(() => {
    // Filter pending plantations
    const pending = plantations.filter(p => p.status === 'pending');
    setPendingPlantations(pending);
  }, [plantations]);

  const handleVerify = async (plantationId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/plantations/${plantationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          verificationNote,
          verifiedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdatePlantation(updated);
        setSelectedPlantation(null);
        setVerificationNote('');
        alert(`Plantation ${status === 'verified' ? 'verified' : 'rejected'} successfully!`);
      }
    } catch (error) {
      console.error('Error updating plantation:', error);
      alert('Error updating plantation status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ Verification Dashboard</h2>
        <p className="text-gray-600">Review and verify plantation submissions</p>
      </div>

      {pendingPlantations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">✅ No pending verifications</p>
          <p className="text-gray-400 text-sm mt-2">All plantations have been reviewed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Pending Verifications ({pendingPlantations.length})
            </h3>
            {pendingPlantations.map((plantation) => (
              <div
                key={plantation._id}
                className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedPlantation(plantation)}
              >
                <h4 className="font-bold text-lg text-gray-800">{plantation.plantationName}</h4>
                <p className="text-sm text-gray-600 mt-1">📍 {plantation.location}</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <span className="text-gray-600">Area:</span>
                    <p className="font-semibold">{plantation.area} ha</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Trees:</span>
                    <p className="font-semibold">{plantation.treeCount}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Submitted: {new Date(plantation.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          {selectedPlantation && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Verification Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plantation Name</label>
                  <p className="mt-1 text-gray-900">{selectedPlantation.plantationName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1 text-gray-900">{selectedPlantation.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Area (ha)</label>
                    <p className="mt-1 text-gray-900">{selectedPlantation.area}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tree Count</label>
                    <p className="mt-1 text-gray-900">{selectedPlantation.treeCount}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ecosystem Type</label>
                  <p className="mt-1 text-gray-900">{selectedPlantation.mangrovePercentage}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Planted Date</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedPlantation.plantedDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <p className="mt-1 text-gray-900">{selectedPlantation.contactEmail}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Carbon</label>
                  <p className="mt-1 text-green-600 font-semibold">
                    {(selectedPlantation.area * 2.5).toFixed(2)} tons/year
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    rows="3"
                    placeholder="Add verification notes..."
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleVerify(selectedPlantation._id, 'verified')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleVerify(selectedPlantation._id, 'rejected')}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

