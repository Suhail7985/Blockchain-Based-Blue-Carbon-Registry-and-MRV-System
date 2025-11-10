import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function MyPlantations({ plantations }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [myPlantations, setMyPlantations] = useState([]);

  useEffect(() => {
    // Filter plantations by current user (in real app, filter by userId)
    // For now, show all plantations
    setMyPlantations(plantations);
  }, [plantations]);

  const filteredPlantations = myPlantations.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🌳 My Plantations</h2>
            <p className="text-gray-600 mt-1">Manage your plantation submissions</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md font-medium ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded-md font-medium ${
                filter === 'verified'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Verified
            </button>
          </div>
        </div>
      </div>

      {filteredPlantations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">📭 No plantations found</p>
          <p className="text-gray-400 text-sm mt-2">
            {filter === 'all' 
              ? 'Submit your first plantation to get started!'
              : `No ${filter} plantations`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlantations.map((plantation) => (
            <div
              key={plantation._id}
              className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-800">{plantation.plantationName}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(plantation.status)}`}>
                  {plantation.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📍</span>
                  <span>{plantation.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📏</span>
                  <span>{plantation.area} hectares</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">🌳</span>
                  <span>{plantation.treeCount} trees</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📅</span>
                  <span>{new Date(plantation.plantedDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-600">Carbon Sequestration</p>
                    <p className="text-lg font-bold text-green-600">
                      {(plantation.area * 2.5).toFixed(2)} t/yr
                    </p>
                  </div>
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View Details →
                  </button>
                </div>
              </div>

              {plantation.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    ⏳ Awaiting verification from NCCR
                  </p>
                </div>
              )}

              {plantation.status === 'verified' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-green-600">
                    ✅ Verified and eligible for carbon credits
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

