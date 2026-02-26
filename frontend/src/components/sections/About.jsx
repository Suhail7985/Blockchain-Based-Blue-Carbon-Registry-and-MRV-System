import React from 'react';
import { FaEye, FaBullseye, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';

const About = () => {
  const objectives = [
    'Decentralized MRV system for blue carbon ecosystems',
    'Immutable blockchain storage for plantation data',
    'Tokenized carbon credits via smart contracts',
    'Integration with mobile apps and drone data',
    'Onboarding for NGOs, communities, and coastal panchayats',
  ];

  return (
    <section
      id="about"
      className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800 transition-colors"
      aria-labelledby="about-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="about-heading" className="text-3xl md:text-4xl font-bold text-gov-blue-900 dark:text-white mb-4">
            About Blue Carbon Registry
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A revolutionary blockchain-based system designed to ensure transparency, accuracy, and verifiability 
            in blue carbon ecosystem restoration and carbon credit generation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Vision Card */}
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-carbon-blue-100 rounded-full flex items-center justify-center mb-4">
              <FaEye className="w-7 h-7 text-carbon-blue-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gov-blue-900 dark:text-white mb-3">Vision</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
              To establish India's most trusted and transparent blue carbon monitoring system, 
              enabling verifiable carbon credit generation through blockchain technology.
            </p>
          </div>

          {/* Mission Card */}
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-carbon-blue-100 rounded-full flex items-center justify-center mb-4">
              <FaBullseye className="w-7 h-7 text-carbon-blue-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gov-blue-900 dark:text-white mb-3">Mission</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
              To provide a decentralized, immutable platform for monitoring, reporting, and verification 
              of blue carbon restoration projects, ensuring transparency and accountability.
            </p>
          </div>

          {/* Key Features Card */}
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-carbon-blue-100 rounded-full flex items-center justify-center mb-4">
              <FaShieldAlt className="w-7 h-7 text-carbon-blue-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gov-blue-900 dark:text-white mb-3">Key Features</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
              {objectives.slice(0, 3).map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 text-carbon-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology Card */}
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-carbon-blue-100 rounded-full flex items-center justify-center mb-4">
              <FaCheckCircle className="w-7 h-7 text-carbon-blue-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gov-blue-900 dark:text-white mb-3">Technology</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
              Built on blockchain for immutability, integrated with mobile apps and drone technology 
              for real-time data collection and verification.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
