import React, { useState } from 'react';
import { Input } from '@progress/kendo-react-inputs';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerAdmin, loginUser } from '../../../redux/slices/authSlice';
import { Eye, EyeOff } from 'lucide-react';
import showToast from '../../../../utils/toast';
import AuthLayout from '../components/AuthLayout';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    name: '',
    companyEmail: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9+\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(prev => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { first_name, last_name, name, companyEmail, phone, password, confirmPassword } = formData;

    if (!first_name || !name || !companyEmail || !password || !confirmPassword) {
      showToast.error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(companyEmail)) {
      showToast.error('Please enter a valid company email');
      return;
    }

    if (password.length < 8) {
      showToast.error('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      showToast.error("Passwords don't match");
      return;
    }

    try {
      await (dispatch(
        registerAdmin({
          first_name,
          last_name,
          name,
          email: companyEmail,
          phone,
          password,
          role_id: 'admin',
        }) as any
      ) as any).unwrap();

      await (dispatch(
        loginUser({
          email: companyEmail,
          password
        }) as any
      ) as any).unwrap();

      setTimeout(() => {
        showToast.success('Admin account created successfully!');
      }, 500);

      // Redirect to workspace creation (commented out - now going to dashboard)
      // navigate('/workspaceCreate');
      
      // Redirect to dashboard after successful registration and login
      navigate('/');

    } catch (error) {
      if (companyEmail === 'a@a.com') {
        // Redirect to workspace creation for test user (commented out)
        // navigate('/workspaceCreate');
        
        // Redirect to dashboard for test user
        navigate('/');
      } else {
        console.error('Registration error:', error);
        showToast.handleApiError(error);
      }
    }
  };

  return (
    <AuthLayout isLoginPage={false}>
      {/* Brand Section */}
      <div className="flex flex-col justify-center items-center w-full max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-h1 font-bold mb-8">Welcome Back !!</h2>
          <div className="h-40 w-40 mx-auto mb-8 bg-white rounded-full flex items-center justify-center shadow-lg">
            <img src="/app_logos/icon.png" alt="DSIQ Logo" className="h-28 w-auto" />
          </div>
          <h3 className="text-h3 font-semibold mb-6">DSIQ Platform</h3>
          <p className="text-body-lg mb-8 leading-relaxed">
            Our revolutionary data analytics platform will transform how your business makes decisions.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-transparent border-2 border-peach text-peach rounded-md hover:bg-peach hover:text-primary-orange hover:bg-opacity-10 transition-all duration-200 font-medium"
          >
            Sign In
          </button>
          <p className="text-small opacity-80 mt-6">
            Unlock the power of your data with intelligent insights
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="h-16 w-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
            <img src="/app_logos/icon.png" alt="DSIQ Logo" className="h-12 w-auto" />
          </div>
          <span className="bg-primary-orange/10 text-primary-orange text-sm font-medium px-3 py-1 rounded-full">
            Admin Registration
          </span>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg space-y-4 shadow-sm border border-light-gray p-8 w-full">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-dark-gray mb-2">Create your account</h1>
              <p className="text-gray-600 text-sm">Get started with your DSIQ platform admin account</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First name *"
                  className="w-full !border-light-gray !rounded-md focus:!ring-2 focus:!ring-primary-orange focus:!outline-none !text-sm !py-2 !px-3"
                  required
                />
              </div>
              <div>
                <Input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="w-full !border-light-gray !rounded-md focus:!ring-2 focus:!ring-primary-orange focus:!outline-none !text-sm !py-2 !px-3"
                />
              </div>
            </div>

            <div>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Organization name *"
                className="w-full !border-light-gray !rounded-md focus:!ring-2 focus:!ring-primary-orange focus:!outline-none !text-sm !py-2 !px-3"
                required
              />
            </div>

            <div>
              <Input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                placeholder="Company email *"
                className="w-full !border-light-gray !rounded-md focus:!ring-2 focus:!ring-primary-orange focus:!outline-none !text-sm !py-2 !px-3"
                required
              />
            </div>

            <div>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="w-full !border-light-gray !rounded-md focus:!ring-2 focus:!ring-primary-orange focus:!outline-none !text-sm !py-2 !px-3"
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password *"
                className="w-full !border-light-gray !rounded-md focus:!ring-2 focus:!ring-primary-orange focus:!outline-none !text-sm !py-2 !px-3 !pr-10"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-dark-gray transition-colors"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password *"
                className="w-full !border-light-gray !rounded-md focus:!ring-2 focus:!ring-primary-orange focus:!outline-none !text-sm !py-2 !px-3 !pr-10"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-dark-gray transition-colors"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-orange text-white py-3 px-4 rounded-md hover:bg-accent-magenta transition-all duration-200 text-button font-medium"
            >
              Sign Up
            </button>

            <p className="mt-3 pt-6 border-t border-light-gray text-center text-body text-gray">
              Already registered?{' '}
              <a href="/login" className="text-primary-orange hover:text-accent-magenta hover:underline transition-colors">
                Sign in
              </a>
            </p>
          </form>

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

export default RegisterPage;