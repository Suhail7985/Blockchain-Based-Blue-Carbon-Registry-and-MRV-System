import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaUser, FaLeaf } from 'react-icons/fa';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="relative bg-gradient-to-r from-carbon-blue-700 via-carbon-blue-800 to-gov-blue-900 text-white py-20 lg:py-32"
      aria-label="Hero section"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <FaLeaf className="w-8 h-8 text-green-300" />
            <span className="text-lg font-semibold text-green-200">Blockchain-Powered</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
            Blue Carbon Registry & MRV System
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-8 text-balance">
            Transparent, verifiable monitoring and verification system for blue carbon ecosystem restoration. 
            Empowering NGOs, communities, and coastal panchayats with blockchain technology.
          </p>
          <p className="text-lg text-gray-200 mb-10 max-w-3xl">
            A decentralized platform ensuring accuracy, transparency, and tokenized carbon credit generation 
            for India's climate strategy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-carbon-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-carbon-blue-700"
            >
              Get Started
              <FaArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center px-8 py-4 bg-carbon-blue-600 text-white font-semibold rounded-lg hover:bg-carbon-blue-500 transition-colors focus:outline-none focus:ring-4 focus:ring-carbon-blue-600 focus:ring-offset-2 focus:ring-offset-carbon-blue-700 border-2 border-white"
            >
              <FaUser className="mr-2 w-5 h-5" aria-hidden="true" />
              Citizen Login
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
