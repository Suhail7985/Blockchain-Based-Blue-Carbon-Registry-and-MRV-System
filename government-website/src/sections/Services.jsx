import React from 'react';
import {
  FaUserCheck,
  FaFileCheck,
  FaComments,
  FaSearch,
  FaUserCircle,
} from 'react-icons/fa';

const Services = () => {
  const services = [
    {
      icon: FaUserCheck,
      title: 'Online Registration',
      description: 'Register for various government services and schemes online with ease.',
      href: '#register',
    },
    {
      icon: FaFileCheck,
      title: 'Document Verification',
      description: 'Verify and authenticate your documents through our secure verification system.',
      href: '#verify',
    },
    {
      icon: FaComments,
      title: 'Public Grievance Portal',
      description: 'Submit and track your grievances with real-time status updates.',
      href: '#grievance',
    },
    {
      icon: FaSearch,
      title: 'Application Tracking',
      description: 'Track the status of your applications and requests in real-time.',
      href: '#track',
    },
    {
      icon: FaUserCircle,
      title: 'Citizen Dashboard',
      description: 'Access your personalized dashboard with all services and information.',
      href: '#dashboard',
    },
  ];

  return (
    <section
      id="services"
      className="py-16 lg:py-24 bg-white"
      aria-labelledby="services-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="services-heading" className="text-3xl md:text-4xl font-bold text-gov-blue-900 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Access a wide range of government services online, anytime, anywhere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gov-blue-500 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 bg-gov-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gov-blue-600 transition-colors">
                  <Icon className="w-7 h-7 text-gov-blue-600 group-hover:text-white transition-colors" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gov-blue-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>
                <a
                  href={service.href}
                  className="inline-flex items-center text-gov-blue-600 font-medium hover:text-gov-blue-700 focus:outline-none focus:ring-2 focus:ring-gov-blue-600 rounded"
                >
                  Learn More
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
