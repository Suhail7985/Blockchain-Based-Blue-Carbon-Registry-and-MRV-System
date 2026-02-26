import React from 'react';
import { FaArrowRight, FaUser } from 'react-icons/fa';

const Hero = () => {
  return (
    <section
      id="home"
      className="relative bg-gradient-to-r from-gov-blue-700 to-gov-blue-900 text-white py-20 lg:py-32"
      aria-label="Hero section"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
            Welcome to Government Portal
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-8 text-balance">
            Your trusted gateway to government services, schemes, and information. 
            Empowering citizens with easy access to digital governance.
          </p>
          <p className="text-lg text-gray-200 mb-10 max-w-2xl">
            We are committed to providing transparent, efficient, and citizen-centric services 
            to enhance your experience with government services.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#services"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gov-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-gov-blue-700"
              role="button"
            >
              Explore Services
              <FaArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
            </a>
            <a
              href="#login"
              className="inline-flex items-center justify-center px-8 py-4 bg-gov-blue-600 text-white font-semibold rounded-lg hover:bg-gov-blue-500 transition-colors focus:outline-none focus:ring-4 focus:ring-gov-blue-600 focus:ring-offset-2 focus:ring-offset-gov-blue-700 border-2 border-white"
              role="button"
            >
              <FaUser className="mr-2 w-5 h-5" aria-hidden="true" />
              Citizen Login
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
