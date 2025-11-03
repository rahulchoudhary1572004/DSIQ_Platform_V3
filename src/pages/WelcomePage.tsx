import React, { useRef } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Card, CardTitle, CardBody } from '@progress/kendo-react-layout';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Footer from '../components/Footer'


const WelcomePage = ({ isLoggedIn }) => {
  const extraContentRef = useRef(null);

  const handleLearnMore = () => {
    if (extraContentRef.current) {
      extraContentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const services = [
    {
      title: "Product & Category Tracking",
      description: "Scrape and monitor products, categories, and listing changes from top retailers.",
    },
    {
      title: "Review & Sentiment Analysis",
      description: "Analyze customer reviews to extract sentiment, key feedback, and product perception.",
    },
    {
      title: "Sales & Rank Insights",
      description: "Understand product performance, estimate sales, and monitor search rankings.",
    },
  ];

  const partners = ["Amazon", "eBay", "Walmart", "Target", "BestBuy"];

  const location = useLocation();

useEffect(() => {
  if (location.hash === '#login-panel') {
    const element = document.getElementById('login-panel');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}, [location]);
 
  return (
    <div className="bg-[#f9fafb] text-gray-800 font-sans tracking-wide">

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gradient-to-b from-white to-gray-100 py-10">
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-6 leading-tight">
          Welcome to <span className="text-blue-600">DSIQ</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mb-10 leading-relaxed">
          Decode retail data into strategic insights. Monitor products, analyze reviews, and drive brand performance.
        </p>
        <button
          onClick={handleLearnMore}
          className="mt-4 text-sm text-blue-600 hover:underline hover:text-blue-800 transition"
        >
          Learn more ↓
        </button>
      </section>

      {/* Scroll Content */}
      <div ref={extraContentRef}>

        {/* Login Panels */}
        <section id="login-panel" className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x bg-white shadow-lg">
          {/* Agency Login */}
          <div className="p-10 text-center space-y-4">
            <p className="uppercase text-xs text-gray-500">Agency Access</p>
            <h2 className="text-2xl font-bold text-blue-700">For Agencies</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Analyze multiple brands, manage clients, and provide strategic retail intelligence.
            </p>
            <Link to="/login">
              <Button className="rounded-full px-6 bg-gray-800 text-white hover:bg-gray-700">Login</Button>
            </Link>
            <p className="text-sm text-gray-500">
              Don’t have an account? <Link to="/register" className="text-green-600 hover:underline">Sign up</Link>
            </p>
          </div>

          {/* Brand Login */}
          <div className="p-10 text-center space-y-4">
            <p className="uppercase text-xs text-gray-500">Brand Access</p>
            <h2 className="text-2xl font-bold text-blue-700">For Brands</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Track your product performance, monitor reviews, and optimize your retail presence.
            </p>
            <Link to="/login">
              <Button className="rounded-full px-6 border border-gray-400 hover:shadow-md">
                Login
              </Button>
            </Link>
            <p className="text-sm text-gray-500">
              Don’t have an account? <Link to="/register" className="text-green-600 hover:underline">Sign up</Link>
            </p>
          </div>
        </section>

        {/* Partners Section */}
        <section className="bg-white py-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Our Data Partners</h2>
          <div className="flex flex-wrap justify-center gap-5 px-4">
            {partners.map((partner, idx) => (
              <div
                key={idx}
                className="text-gray-800 text-md md:text-lg px-6 py-2 bg-gray-100 rounded-full shadow hover:shadow-md transition"
              >
                {partner}
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section className="bg-gray-50 py-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What We Offer</h2>
          <div className="flex flex-wrap justify-center gap-10 px-6">
            {services.map((service, index) => (
              <Card
                key={index}
                style={{ width: 300 }}
                className="bg-white border border-gray-200 shadow hover:shadow-xl transition rounded-xl p-6"
              >
                <CardBody>
                  <CardTitle className="text-xl font-semibold text-blue-800 mb-2">{service.title}</CardTitle>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
        <Footer isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
};

export default WelcomePage;
