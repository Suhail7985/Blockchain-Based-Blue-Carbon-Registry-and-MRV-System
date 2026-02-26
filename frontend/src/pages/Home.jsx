import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Features from '../components/sections/Features';
import HowItWorks from '../components/sections/HowItWorks';
import Statistics from '../components/sections/Statistics';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gov-blue-600 focus:text-white focus:rounded">
        Skip to main content
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <About />
        <Features />
        <HowItWorks />
        <Statistics />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
