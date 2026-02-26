import React from 'react';
import { FaUsers, FaTree, FaCoins, FaCheckCircle } from 'react-icons/fa';

const Statistics = () => {
  const stats = [
    {
      icon: FaUsers,
      value: '500+',
      label: 'Registered Organizations',
      description: 'NGOs, communities, and panchayats',
    },
    {
      icon: FaTree,
      value: '10K+',
      label: 'Hectares Restored',
      description: 'Blue carbon ecosystem restoration',
    },
    {
      icon: FaCoins,
      value: '50K+',
      label: 'Carbon Credits Generated',
      description: 'Tokenized credits on blockchain',
    },
    {
      icon: FaCheckCircle,
      value: '99.8%',
      label: 'Data Accuracy',
      description: 'Verified through MRV system',
    },
  ];

  return (
    <section
      className="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors"
      aria-labelledby="statistics-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="statistics-heading" className="text-3xl md:text-4xl font-bold text-gov-blue-900 dark:text-white mb-4">
            Platform Impact
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real-time metrics showcasing the success of blue carbon restoration initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-carbon-blue-50 dark:from-gray-800 to-white dark:to-gray-700 border-2 border-carbon-blue-100 dark:border-gray-600 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-carbon-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-carbon-blue-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {stat.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
