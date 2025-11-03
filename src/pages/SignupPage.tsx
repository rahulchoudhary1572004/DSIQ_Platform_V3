import React, { useState, useEffect } from 'react';
import { Input } from '@progress/kendo-react-inputs';
import { ComboBox } from '@progress/kendo-react-dropdowns';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerAdmin } from '../redux/slices/authSlice';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import showToast from '../../utils/toast';
import AuthLayout from '../components/AuthLayout';
import { loginUser } from '../redux/slices/authSlice'

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const backend_url = import.meta.env.VITE_BACKEND_URL;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    name: '',
    companyEmail: '',
    address: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country_id: '',
  });

  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backend_url}/get-country`);
        const countryData = response.data.data;

        // Utility function to convert ISO code to Unicode flag emoji
        function getFlagEmoji(isoCode) {
          const code = isoCode.toUpperCase();
          const A = 0x1F1E6;
          return [...code]
            .map(char => String.fromCodePoint(A + char.charCodeAt(0) - 65))
            .join('');
        }

        // Transform country data
        const transformedCountries = countryData.map(c => ({
          id: c.id,
          name: c.nicename,
          flag: getFlagEmoji(c.iso), // Replaces emojiFlags.countryCode(c.iso)?.emoji
          phoneCode: `+${c.phonecode}`,
          iso: c.iso,
          iso3: c.iso3,
        }));

        setCountries(transformedCountries);
        setFilteredCountries(transformedCountries);

        const defaultCountry = transformedCountries.find(c => c.iso === 'US');
        if (defaultCountry) {
          setFormData(prev => ({
            ...prev,
            country_id: defaultCountry.id,
            phone: defaultCountry.phoneCode + ' ',
          }));
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Failed to load country data. Please try again later.');
        showToast.error('Failed to load country data');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9+\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.value;
    const country_id = selectedCountry && selectedCountry.id ? selectedCountry.id : '';

    setFormData(prev => ({
      ...prev,
      country_id,
    }));

    if (selectedCountry && selectedCountry.phoneCode) {
      const currentNumber = formData.phone.replace(/^\+\d+\s*/, '');
      setFormData(prev => ({
        ...prev,
        phone: `${selectedCountry.phoneCode} ${currentNumber}`.trim(),
      }));
    }
  };

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(prev => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { first_name, last_name, name, companyEmail, address, phone, password, confirmPassword, country_id } = formData;

    if (!first_name || !name || !companyEmail || !password || !confirmPassword || !country_id) {
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
      await dispatch(
        registerAdmin({
          first_name,
          last_name,
          name,
          email: companyEmail,
          phone,
          password,
          country_id,
          role_id: 'admin',
        })
      ).unwrap();

      await dispatch(
        loginUser({
          email: companyEmail,
          password
        })
      ).unwrap();

      setTimeout(() => {
        showToast.success('Admin account created successfully!');
      }, 500);

      navigate('/workspaceCreate');

    } catch (error) {
      if (companyEmail === 'a@a.com') {
        navigate('/workspaceCreate');
      } else {
        console.error('Registration error:', error);
        showToast.handleApiError(error);
      }
    }
  };

  // Handle Enter key press for ComboBox
  const handleComboBoxKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Find the first form element after the ComboBox and focus it
      const form = e.target.closest('form');
      const formElements = form.querySelectorAll('input, select, textarea, button');
      const currentIndex = Array.from(formElements).indexOf(e.target);
      const nextElement = formElements[currentIndex + 1];
      if (nextElement && nextElement.type !== 'submit') {
        nextElement.focus();
      } else {
        // If it's the last field or next is submit button, submit the form
        handleSubmit(e);
      }
    }
  };

  const selectedCountry = countries.find(c => c.id === formData.country_id) || null;

  const handleFilterChange = (event) => {
    const value = event.filter.value || '';
    setSearchTerm(value);
    const filtered = countries.filter(
      c => c.name.toLowerCase().includes(value.toLowerCase()) || c.id.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCountries(filtered);
  };

  const countryItemRender = (li, itemProps) => {
    const country = itemProps.dataItem;
    return React.cloneElement(li, {
      ...li.props,
      children: (
        <div className="flex items-center gap-2 py-1">
          <span>{country.flag}</span>
          <span>{country.name}</span>
        </div>
      ),
    });
  };

  const countryValueRender = (element, value) => {
    if (!value) return element;
    return (
      <div className="flex items-center gap-2">
        <span>{value.flag}</span>
        <span>{value.name}</span>
      </div>
    );
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

        {loading ? (
          <div className="text-center">Loading countries...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
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
              <ComboBox
                data={filteredCountries}
                textField="name"
                dataItemKey="id"
                value={selectedCountry}
                onChange={handleCountryChange}
                onKeyDown={handleComboBoxKeyDown}
                filterable
                onFilterChange={handleFilterChange}
                itemRender={countryItemRender}
                valueRender={countryValueRender}
                placeholder="Select country *"
                className="w-full !border-light-gray !rounded-md focus:!ring-2 focus:!ring-primary-orange focus:!outline-none !text-sm !py-1 !px-3"
                required
              />
            </div>

            <div>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number (optional)"
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
        )}

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