import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const AuthLayout = ({ children, isLoginPage }) => {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen bg-cream font-sans">
      {/* Brand Section Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${location.pathname}-brand`}
          initial={{ x: isLoginPage ? '-100%' : '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: isLoginPage ? '100%' : '-100%', opacity: 0 }}
          transition={{ type: 'tween', ease: 'easeInOut', duration: 1 }}
          className={`hidden lg:flex lg:w-1/2 bg-brand-gradient text-white p-12 ${isLoginPage ? 'order-2' : 'order-1'}`}
        >
          {children[0]}
        </motion.div>
      </AnimatePresence>

      {/* Form Section Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${location.pathname}-form`}
          initial={{ x: isLoginPage ? '100%' : '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: isLoginPage ? '-100%' : '100%', opacity: 0 }}
          transition={{ type: 'tween', ease: 'easeInOut', duration: 1 }}
          className={`w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-cream ${isLoginPage ? 'order-1' : 'order-2'}`}
        >
          {children[1]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthLayout;