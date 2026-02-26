import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../sections/Hero';
import About from '../sections/About';
import Services from '../sections/Services';
import Notifications from '../sections/Notifications';
import Statistics from '../sections/Statistics';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <About />
        <Services />
        <Notifications />
        <Statistics />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
