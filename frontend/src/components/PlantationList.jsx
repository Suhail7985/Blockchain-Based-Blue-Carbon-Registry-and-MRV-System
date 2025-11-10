import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiMapPin, FiCalendar, FiMail, 
  FiWind, FiClock, FiCheckCircle 
} from 'react-icons/fi';
import { FaTree } from 'react-icons/fa';

export default function PlantationList({ plantations }) {
  if (!plantations || plantations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl shadow-xl p-12 text-center border border-white/20"
      >
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
          <FaTree className="text-gray-400" size={40} />
        </div>
        <p className="text-gray-600 text-lg font-semibold mb-2">No plantations recorded yet</p>
        <p className="text-gray-400 text-sm">Submit data using the form to get started!</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {plantations.map((plantation, index) => (
        <motion.div
          key={plantation._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="glass rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all cursor-pointer border border-white/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-xl text-gray-800 group-hover:text-green-600 transition-colors">
                {plantation.plantationName}
              </h3>
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold rounded-full flex items-center">
                <FiClock className="mr-1" size={12} />
                Pending
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <FiMapPin className="mr-2 text-green-500" size={16} />
              <span>{plantation.location}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <FaTree className="mr-1" size={14} />
                  Area
                </div>
                <p className="font-bold text-gray-800">{plantation.area} ha</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <FaTree className="mr-1" size={14} />
                  Trees
                </div>
                <p className="font-bold text-gray-800">{parseInt(plantation.treeCount || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <FiCalendar className="mr-1" size={14} />
                  Date
                </div>
                <p className="font-bold text-gray-800">
                  {new Date(plantation.plantedDate).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-white/50 rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Ecosystem</div>
                <p className="font-bold text-gray-800 text-xs">{plantation.mangrovePercentage}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiWind className="mr-2 text-green-600" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">Carbon Sequestration</p>
                    <p className="font-bold text-green-600 text-lg">
                      {(plantation.area * 2.5).toFixed(1)} t/yr
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Status</p>
                  <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full mt-1">
                    <FiClock className="mr-1" size={10} />
                    Pending
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center text-xs text-gray-500 pt-3 border-t border-gray-200">
              <FiMail className="mr-2" size={14} />
              <span className="truncate">{plantation.contactEmail}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
