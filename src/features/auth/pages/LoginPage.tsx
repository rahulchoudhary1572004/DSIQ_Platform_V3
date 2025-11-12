import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchCurrentUser, forgotPassword, verifyOtp, resetPassword } from '../../../redux/slices/authSlice';
import { Eye, EyeOff } from 'lucide-react';
import showToast from '../../../../utils/toast';
import AuthLayout from '../components/AuthLayout';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state: any) => state.auth);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'otp' | 'password'>('email');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStatus, setResetStatus] = useState('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

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

    console.log('Attempting login...');
    const resultAction = await dispatch(loginUser({ email, password }) as any);

    console.log('Login result:', resultAction);

    if (loginUser.fulfilled.match(resultAction)) {
      console.log('Login successful, fetching user profile...');
      const userResult = await dispatch(fetchCurrentUser({ showLoginToast: true }) as any);
      
      console.log('Fetch user result:', userResult);
      
      if (fetchCurrentUser.fulfilled.match(userResult)) {
        console.log('User profile fetched successfully, navigating...');
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        console.error('Failed to fetch user profile:', userResult);
        showToast.error('Login successful but failed to fetch user profile. Please try refreshing.');
      }
    } else {
      console.error('Login failed:', resultAction);
    }
  };

  const handleResetSubmit = async () => {
    if (resetStep === 'email') {
      // Step 1: Send OTP
      if (!resetEmail) {
        showToast.warning('Please enter your email address.');
        return;
      }

      setResetStatus('sending');
      try {
        const resultAction = await dispatch(forgotPassword(resetEmail) as any);
        
        if (forgotPassword.fulfilled.match(resultAction)) {
          const message = resultAction.payload?.message || 'OTP sent to your email';
          showToast.success(message, { autoClose: 5000 });
          setResetStep('otp');
          setResetStatus('idle');
        } else {
          setResetStatus('idle');
          const errorMessage = resultAction.payload || 'Failed to send OTP. Please try again.';
          showToast.error(errorMessage);
        }
      } catch (error) {
        console.error('Forgot password error:', error);
        setResetStatus('idle');
        showToast.error('Failed to send OTP. Please try again.');
      }
    } else if (resetStep === 'otp') {
      // Step 2: Verify OTP
      if (!otp) {
        showToast.warning('Please enter the OTP.');
        return;
      }

      setResetStatus('verifying');
      try {
        const resultAction = await dispatch(verifyOtp({ email: resetEmail, otp }) as any);
        
        if (verifyOtp.fulfilled.match(resultAction)) {
          const message = resultAction.payload?.message || 'OTP verified successfully';
          showToast.success(message);
          setResetStep('password');
          setResetStatus('idle');
        } else {
          setResetStatus('idle');
          const errorMessage = resultAction.payload || 'Invalid OTP. Please try again.';
          showToast.error(errorMessage);
        }
      } catch (error) {
        console.error('OTP verification error:', error);
        setResetStatus('idle');
        showToast.error('Failed to verify OTP. Please try again.');
      }
    } else if (resetStep === 'password') {
      // Step 3: Reset Password
      if (!newPassword || !confirmPassword) {
        showToast.warning('Please enter and confirm your new password.');
        return;
      }

      if (newPassword !== confirmPassword) {
        showToast.error('Passwords do not match.');
        return;
      }

      if (newPassword.length < 6) {
        showToast.warning('Password must be at least 6 characters long.');
        return;
      }

      setResetStatus('resetting');
      try {
        const resultAction = await dispatch(resetPassword({ 
          email: resetEmail, 
          new_password: newPassword 
        }) as any);
        
        if (resetPassword.fulfilled.match(resultAction)) {
          const message = resultAction.payload?.message || 'Password reset successfully';
          showToast.success(message);
          // Reset all states and go back to login
          setTimeout(() => {
            setShowReset(false);
            setResetStep('email');
            setResetEmail('');
            setOtp('');
            setNewPassword('');
            setConfirmPassword('');
            setResetStatus('idle');
          }, 1500);
        } else {
          setResetStatus('idle');
          const errorMessage = resultAction.payload || 'Failed to reset password. Please try again.';
          showToast.error(errorMessage);
        }
      } catch (error) {
        console.error('Password reset error:', error);
        setResetStatus('idle');
        showToast.error('Failed to reset password. Please try again.');
      }
    }
  };

  const handleResetKeyDown = (e) => {
    if (e.key === 'Enter' && resetStatus === 'idle') {
      handleResetSubmit();
    }
  };

  const handleCancelReset = () => {
    setShowReset(false);
    setResetStep('email');
    setResetEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResetStatus('idle');
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
              <h2 className="text-h3 text-dark-gray mb-2 font-medium">
                {resetStep === 'email' && 'Reset your password'}
                {resetStep === 'otp' && 'Verify OTP'}
                {resetStep === 'password' && 'Set new password'}
              </h2>
              <p className="text-small text-gray mb-6">
                {resetStep === 'email' && 'Enter your email to receive an OTP'}
                {resetStep === 'otp' && 'Enter the 6-digit code sent to your email'}
                {resetStep === 'password' && 'Create a strong new password'}
              </p>

              {/* Step 1: Email Input */}
              {resetStep === 'email' && (
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
                    disabled={resetStatus === 'sending'}
                  />
                </div>
              )}

              {/* Step 2: OTP Input */}
              {resetStep === 'otp' && (
                <div className="mb-6">
                  <label className="block text-body font-medium text-dark-gray mb-2">OTP Code</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full p-3 border border-light-gray rounded-md text-body text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ''));
                      setResetStatus('idle');
                    }}
                    onKeyDown={handleResetKeyDown}
                    disabled={resetStatus === 'verifying'}
                  />
                  <p className="text-small text-gray mt-2">OTP sent to {resetEmail}</p>
                </div>
              )}

              {/* Step 3: New Password Input */}
              {resetStep === 'password' && (
                <>
                  <div className="mb-4">
                    <label className="block text-body font-medium text-dark-gray mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="w-full p-3 border border-light-gray rounded-md pr-10 text-body focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setResetStatus('idle');
                        }}
                        onKeyDown={handleResetKeyDown}
                        disabled={resetStatus === 'resetting'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray hover:text-dark-gray"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-body font-medium text-dark-gray mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="w-full p-3 border border-light-gray rounded-md pr-10 text-body focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setResetStatus('idle');
                        }}
                        onKeyDown={handleResetKeyDown}
                        disabled={resetStatus === 'resetting'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray hover:text-dark-gray"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={handleResetSubmit}
                disabled={resetStatus !== 'idle'}
                className={`w-full py-3 px-4 text-white font-medium rounded-md transition-all duration-200 ${
                  resetStatus !== 'idle'
                    ? 'bg-gray cursor-not-allowed'
                    : 'bg-primary-orange hover:bg-accent-magenta'
                }`}
              >
                {resetStatus === 'sending' && 'Sending OTP...'}
                {resetStatus === 'verifying' && 'Verifying OTP...'}
                {resetStatus === 'resetting' && 'Resetting Password...'}
                {resetStatus === 'idle' && (
                  <>
                    {resetStep === 'email' && 'Send OTP'}
                    {resetStep === 'otp' && 'Verify OTP'}
                    {resetStep === 'password' && 'Reset Password'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelReset}
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