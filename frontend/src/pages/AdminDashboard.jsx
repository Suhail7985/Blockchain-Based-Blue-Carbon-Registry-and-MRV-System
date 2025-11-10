import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMap, FiWind, FiFolder, 
  FiTrendingUp, FiActivity 
} from 'react-icons/fi';
import { FaTree } from 'react-icons/fa';

export default function AdminDashboard({ plantations }) {
  const [stats, setStats] = useState({
    totalArea: 0,
    totalTrees: 0,
    carbonSequestration: 0,
    projectCount: 0,
  });

  useEffect(() => {
    if (plantations && plantations.length > 0) {
      const totalArea = plantations.reduce((sum, p) => sum + (parseFloat(p.area) || 0), 0);
      const totalTrees = plantations.reduce((sum, p) => sum + (parseInt(p.treeCount) || 0), 0);
      const carbonSeq = totalArea * 2.5;

      setStats({
        totalArea: totalArea.toFixed(2),
        totalTrees: totalTrees.toLocaleString(),
        carbonSequestration: carbonSeq.toFixed(2),
        projectCount: plantations.length,
      });
    } else {
      setStats({
        totalArea: '0.00',
        totalTrees: '0',
        carbonSequestration: '0.00',
        projectCount: 0,
      });
    }
  }, [plantations]);

  const statCards = [
    {
      label: 'Total Area',
      value: `${stats.totalArea} ha`,
      icon: FiMap,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Total Trees Planted',
      value: stats.totalTrees,
      icon: FaTree,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Carbon Sequestration',
      value: `${stats.carbonSequestration} t/yr`,
      icon: FiWind,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Active Projects',
      value: stats.projectCount,
      icon: FiFolder,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl shadow-xl p-8 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold gradient-text mb-2">
              Dashboard Overview
            </h2>
            <p className="text-gray-600 text-lg">
              Comprehensive view of blue carbon restoration projects
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg">
            <FiActivity size={20} />
            <span className="font-semibold">Live Data</span>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass rounded-2xl shadow-lg p-6 card-hover border border-white/20 relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`}></div>
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.color} mb-4 shadow-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <p className="text-gray-600 text-sm font-medium mb-2">{card.label}</p>
                <p className={`text-3xl font-bold ${card.textColor} mb-1`}>
                  {card.value}
                </p>
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <FiTrendingUp className="mr-1 text-green-500" size={14} />
                  <span>Updated in real-time</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {plantations && plantations.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl shadow-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">All Plantations</h3>
            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm font-semibold rounded-full">
              {plantations.length} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Plantation Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Location</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700">Area (ha)</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700">Trees</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700">Carbon (t/yr)</th>
                </tr>
              </thead>
              <tbody>
                {plantations.map((p, index) => (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b ${index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'} hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all cursor-pointer`}
                    whileHover={{ scale: 1.01, x: 5 }}
                  >
                    <td className="py-4 px-4 font-semibold text-gray-800">{p.plantationName}</td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{p.location}</td>
                    <td className="py-4 px-4 text-right text-gray-700 font-medium">{parseFloat(p.area || 0).toFixed(2)}</td>
                    <td className="py-4 px-4 text-right text-gray-700 font-medium">{parseInt(p.treeCount || 0).toLocaleString()}</td>
                    <td className="py-4 px-4 text-right font-bold text-green-600">
                      {(parseFloat(p.area || 0) * 2.5).toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl shadow-xl p-12 text-center border border-white/20"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
            <FiFolder className="text-gray-400" size={48} />
          </div>
          <p className="text-gray-600 text-xl font-semibold mb-2">No plantations recorded yet</p>
          <p className="text-gray-400 text-sm">Submit data using the form to get started!</p>
        </motion.div>
      )}
    </div>
  );
}
