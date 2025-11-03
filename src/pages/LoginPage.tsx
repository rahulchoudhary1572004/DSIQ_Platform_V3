import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';
import { Eye, EyeOff } from 'lucide-react';
import { forgotPassword } from '../redux/slices/authSlice';
import showToast from '../../utils/toast';
import AuthLayout from '../components/AuthLayout';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState('idle');
  const [showPassword, setShowPassword] = useState(false);
  

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    if (!email || !password) {
      showToast.warning('Please fill in all fields.');
      return;
    }

    console.log('Dispatching loginUser...');
    const resultAction = await dispatch(loginUser({ email, password }));

    console.log('Result Action:', resultAction);

    if (loginUser.fulfilled.match(resultAction)) {
      console.log('Login successful, navigating...');

      setTimeout(() => {
        navigate('/');
      }, 500);
    } else {
      console.log('Login failed or not fulfilled:', resultAction);
    }
  };

  const handleResetSubmit = () => {
    if (!resetEmail) {
      showToast.warning('Please enter your email address.');
      return;
    }

    setResetStatus('sending');
    dispatch(forgotPassword(resetEmail));
    setTimeout(() => {
      setResetStatus('sent');
      showToast.success(`Password reset link sent to ${resetEmail}`, {
        autoClose: 7000,
        hideProgressBar: false
      })
    }, 2000);
  };

  const handleResetKeyDown = (e) => {
    if (e.key === 'Enter' && resetStatus === 'idle') {
      handleResetSubmit();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthLayout isLoginPage={true}>
      {/* Brand Section */}
      <div className="flex flex-col justify-center items-center w-full max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-h1 font-bold mb-8">Hello !!</h2>
          <div className="h-40 w-40 mx-auto mb-8 bg-white rounded-full flex items-center justify-center shadow-lg">
            <img src="/app_logos/icon.png" alt="DSIQ Logo" className="h-28 w-auto" />
          </div>
          <h3 className="text-h3 font-semibold mb-6">DSIQ Platform</h3>
          <p className="text-body-lg mb-8 leading-relaxed">
            Our revolutionary data analytics platform will transform how your business makes decisions.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2 bg-transparent border-2 border-peach text-peach rounded-md hover:bg-peach hover:text-primary-orange hover:bg-opacity-10 transition-all duration-200 font-medium"
          >
            Sign Up
          </button>
          <p className="text-small opacity-80 mt-6">
            Unlock the power of your data with intelligent insights
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-sm">
            <img src="app_logos/icon.png" alt="DSIQ Logo" className="h-16 w-auto" />
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border border-light-gray p-8 w-full">
          {showReset ? (
            <>
              <h2 className="text-h3 text-dark-gray mb-6 font-medium">Reset your password</h2>
              <div className="mb-6">
                <label className="block text-body font-medium text-dark-gray mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full p-3 border border-light-gray rounded-md text-body focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setResetStatus('idle');
                  }}
                  onKeyDown={handleResetKeyDown}
                  disabled={resetStatus === 'sent'}
                />
              </div>

              <button
                onClick={handleResetSubmit}
                disabled={resetStatus !== 'idle'}
                className={`w-full py-3 px-4 text-white font-medium rounded-md transition-all duration-200 ${resetStatus === 'sending'
                  ? 'bg-gray cursor-not-allowed'
                  : resetStatus === 'sent'
                    ? 'bg-success-green cursor-not-allowed'
                    : 'bg-primary-orange hover:bg-accent-magenta'
                  }`}
              >
                {resetStatus === 'sending'
                  ? 'Sending...'
                  : resetStatus === 'sent'
                    ? 'Link Sent!'
                    : 'Send Reset Link'}
              </button>

              <button
                onClick={() => {
                  setShowReset(false);
                  setResetStatus('idle');
                }}
                className="mt-4 w-full text-body text-primary-orange hover:text-accent-magenta hover:underline transition-colors"
              >
                Return to Login
              </button>
            </>
          ) : (
            <form onSubmit={handleLoginSubmit}>
              <h2 className="text-h3 text-dark-gray mb-8 font-medium">Sign in to your account</h2>
              <div className="mb-6">
                <label className="block text-body font-medium text-dark-gray mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="w-full p-3 border border-light-gray rounded-md text-body focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  value={formData.email}
                  onChange={handleLoginChange}
                />
              </div>

              <div className="mb-6">
                <label className="block text-body font-medium text-dark-gray mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className="w-full p-3 border border-light-gray rounded-md pr-10 text-body focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    value={formData.password}
                    onChange={handleLoginChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray hover:text-dark-gray transition-colors"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-orange rounded focus:outline-none focus:ring-2 focus:ring-primary-orange border-light-gray"
                  />
                  <span className="ml-2 text-body text-dark-gray">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowReset(true);
                    setResetStatus('idle');
                  }}
                  className="text-body text-primary-orange hover:text-accent-magenta hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-orange text-white py-3 px-4 rounded-md hover:bg-accent-magenta transition-all duration-200 text-button font-medium"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>

              <div className="mt-6 pt-6 border-t border-light-gray text-center">
                <p className="text-body text-gray">
                  Don't have an account?{' '}
                  <a href="/register" className="text-primary-orange hover:text-accent-magenta hover:underline transition-colors">
                    Sign up
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="text-small text-gray">
            © 2025 DSIQ, Inc. All rights reserved. |{' '}
            <a href="#" className="hover:underline">Privacy</a>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;