import React from 'react';
import { FaUserPlus, FaUpload, FaCheckCircle, FaCoins } from 'react-icons/fa';

const HowItWorks = () => {
  const steps = [
    {
      icon: FaUserPlus,
      title: 'Register & Onboard',
      description: 'NGOs, communities, and coastal panchayats register on the platform and complete verification.',
      step: '01',
    },
    {
      icon: FaUpload,
      title: 'Upload Field Data',
      description: 'Submit plantation and restoration data through mobile apps or integrate drone-collected data.',
      step: '02',
    },
    {
      icon: FaCheckCircle,
      title: 'Verification Process',
      description: 'Automated and manual verification ensures data accuracy and compliance with MRV standards.',
      step: '03',
    },
    {
      icon: FaCoins,
      title: 'Carbon Credit Generation',
      description: 'Verified data triggers smart contracts to generate tokenized carbon credits automatically.',
      step: '04',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800 transition-colors"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold text-gov-blue-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Simple, transparent process from registration to carbon credit generation.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Connector Line (hidden on mobile, visible on desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-carbon-blue-300 -z-10" style={{ width: 'calc(100% - 3rem)' }}>
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-carbon-blue-300 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                    </div>
                  )}
                  
                  <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-carbon-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                      </div>
                      <div className="text-3xl font-bold text-carbon-blue-200">{step.step}</div>
                    </div>
                    <h3 className="text-xl font-semibold text-gov-blue-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
