import React from 'react';
import { FaEye, FaBullseye, FaCheckCircle } from 'react-icons/fa';

const About = () => {
  const objectives = [
    'Digital transformation of government services',
    'Transparent and accountable governance',
    'Citizen-centric service delivery',
    'Data-driven decision making',
    'Inclusive and accessible services',
  ];

  return (
    <section
      id="about"
      className="py-16 lg:py-24 bg-gray-50"
      aria-labelledby="about-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="about-heading" className="text-3xl md:text-4xl font-bold text-gov-blue-900 mb-4">
            About Us
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We are dedicated to providing efficient, transparent, and accessible government services 
            to all citizens through digital innovation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Vision Card */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-gov-blue-100 rounded-full flex items-center justify-center mb-6">
              <FaEye className="w-8 h-8 text-gov-blue-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gov-blue-900 mb-4">Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To become a leading digital government platform that empowers citizens 
              and transforms public service delivery through innovation and technology.
            </p>
          </div>

          {/* Mission Card */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-gov-blue-100 rounded-full flex items-center justify-center mb-6">
              <FaBullseye className="w-8 h-8 text-gov-blue-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gov-blue-900 mb-4">Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To provide seamless, accessible, and efficient government services 
              that meet the evolving needs of citizens while ensuring transparency 
              and accountability in governance.
            </p>
          </div>

          {/* Key Objectives Card */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-gov-blue-100 rounded-full flex items-center justify-center mb-6">
              <FaCheckCircle className="w-8 h-8 text-gov-blue-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gov-blue-900 mb-4">Key Objectives</h3>
            <ul className="space-y-2 text-gray-600" role="list">
              {objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 text-gov-blue-600 mt-1 flex-shrink-0" aria-hidden="true" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
