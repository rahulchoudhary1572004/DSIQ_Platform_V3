import { useState } from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter, Github } from 'lucide-react';

export default function Footer({ isLoggedIn }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  // Simple footer for logged in users
  if (isLoggedIn) {
    return (
      <footer className="w-full bg-gray-800 text-gray-400 py-2 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">© {new Date().getFullYear()} DSIQ Inc. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-sm hover:underline">Privacy Policy</a>
            <a href="#" className="text-sm hover:underline">Terms of Service</a>
            <a href="#" className="text-sm hover:underline">Help Center</a>
          </div>
        </div>
      </footer>
    );
  }

  // Detailed footer for non-logged in users
  return (
    <footer className="relative bg-slate-950 text-white pt-8 mt-6 border-slate-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Top Section */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Branding */}
          <div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text mb-2">
              DSIQ
            </h2>
            <p className="text-sm text-slate-400">Turning Data Into Decisions</p>
            <p className="mt-2 text-sm text-slate-500">Empowering businesses with data insights.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase">Navigation</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              {['Home', 'Features', 'Pricing', 'About', 'Contact'].map(link => (
                <li key={link}>
                  <a href="#" className="hover:text-white transition duration-200">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase">Contact</h3>
            <ul className="text-sm text-slate-400 space-y-3">
              <li className="flex items-center gap-2"><Mail size={16} /> contact@dsiq.tech</li>
              <li className="flex items-center gap-2"><Phone size={16} /> +1 (555) 123-4567</li>
              <li className="flex items-center gap-2"><MapPin size={16} /> Tech Hub, CA</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase">Social</h3>
            <div className="flex flex-col gap-3 text-sm text-slate-400">
              <a href="#" className="flex items-center gap-2 hover:text-white"><Linkedin size={16} /> LinkedIn</a>
              <a href="#" className="flex items-center gap-2 hover:text-white"><Twitter size={16} /> Twitter</a>
              <a href="#" className="flex items-center gap-2 hover:text-white"><Github size={16} /> GitHub</a>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-10 bg-gradient-to-r from-blue-800/20 to-cyan-800/20 backdrop-blur-md p-3 rounded-xl border border-slate-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-1">Join Our Newsletter</h3>
              <p className="text-sm text-slate-400">Stay in the loop with the latest from DSIQ.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white transition"
              >
                Subscribe
              </button>
            </form>
          </div>
          {subscribed && <p className="text-green-400 mt-2 text-sm">Thanks for subscribing!</p>}
        </div>

        {/* Bottom */}
        <div className="mt-12 py-4 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 border-t border-slate-800">
          <p>© {new Date().getFullYear()} DSIQ. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}