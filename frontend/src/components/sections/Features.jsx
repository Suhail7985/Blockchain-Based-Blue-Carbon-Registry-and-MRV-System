import React from 'react';
import {
  FaDatabase,
  FaCoins,
  FaUsers,
  FaMobileAlt,
  FaPlane,
  FaShieldAlt,
} from 'react-icons/fa';

const Features = () => {
  const features = [
    {
      icon: FaDatabase,
      title: 'Blockchain Registry',
      description: 'Immutable storage of verified plantation and restoration data on blockchain, ensuring data integrity and transparency.',
    },
    {
      icon: FaCoins,
      title: 'Tokenized Carbon Credits',
      description: 'Smart contracts automatically generate and tokenize carbon credits based on verified restoration activities.',
    },
    {
      icon: FaUsers,
      title: 'Multi-Stakeholder Onboarding',
      description: 'Seamless onboarding for NGOs, local communities, and coastal panchayats with role-based access.',
    },
    {
      icon: FaMobileAlt,
      title: 'Mobile Data Collection',
      description: 'Field data integration through mobile applications for real-time monitoring and reporting.',
    },
    {
      icon: FaPlane,
      title: 'Drone Integration',
      description: 'Automated data collection and verification using drone technology for accurate area measurement.',
    },
    {
      icon: FaShieldAlt,
      title: 'Verification System',
      description: 'Robust MRV (Monitoring, Reporting, Verification) system ensuring accuracy and compliance.',
    },
  ];

  return (
    <section
      id="features"
      className="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors"
      aria-labelledby="features-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-gov-blue-900 dark:text-white mb-4">
            Key Features
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive blockchain-powered platform for blue carbon ecosystem management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-carbon-blue-500 dark:hover:border-carbon-blue-400 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 bg-carbon-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-carbon-blue-600 transition-colors">
                  <Icon className="w-7 h-7 text-carbon-blue-600 group-hover:text-white transition-colors" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gov-blue-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
