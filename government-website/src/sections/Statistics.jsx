import React from 'react';
import { FaUsers, FaFileAlt, FaCog, FaChartLine } from 'react-icons/fa';

const Statistics = () => {
  const stats = [
    {
      icon: FaUsers,
      value: '2.5M+',
      label: 'Total Registered Citizens',
      description: 'Active users on the platform',
    },
    {
      icon: FaFileAlt,
      value: '15M+',
      label: 'Applications Processed',
      description: 'Successfully completed this year',
    },
    {
      icon: FaCog,
      value: '50+',
      label: 'Active Services',
      description: 'Available government services',
    },
    {
      icon: FaChartLine,
      value: '98.5%',
      label: 'Success Rate',
      description: 'Average service delivery success',
    },
  ];

  return (
    <section
      className="py-16 lg:py-24 bg-white"
      aria-labelledby="statistics-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="statistics-heading" className="text-3xl md:text-4xl font-bold text-gov-blue-900 mb-4">
            Our Impact
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Numbers that reflect our commitment to serving citizens efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-gov-blue-50 to-white border-2 border-gov-blue-100 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-gov-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gov-blue-900 mb-2">
                  {stat.value}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {stat.label}
                </h3>
                <p className="text-sm text-gray-600">
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
