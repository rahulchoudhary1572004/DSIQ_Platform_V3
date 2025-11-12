import React, { useState, useEffect } from 'react';
import { UserPlus, Edit } from 'lucide-react';

const AddUser = ({ isOpen, onClose, onAddUser, availableRoles = [], editingUser }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role_id: '',
    password: '',
    phone: '',
    gender: '',
    dob: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingUser) {
      setFormData({
        first_name: editingUser.first_name || '',
        last_name: editingUser.last_name || '',
        email: editingUser.email || '',
        role_id: editingUser.role_id || '',
        password: '',
        phone: editingUser.phone || '',
        gender: editingUser.gender || '',
        dob: editingUser.dob || ''
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        role_id: '',
        password: '',
        phone: '',
        gender: '',
        dob: ''
      });
    }
    setErrors({});
  }, [editingUser, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!(formData as any).first_name.trim()) (newErrors as any).first_name = 'First name is required';
    if (!(formData as any).email.trim()) {
      (newErrors as any).email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((formData as any).email)) {
      (newErrors as any).email = 'Please enter a valid email';
    }
    if (!(formData as any).role_id) (newErrors as any).role_id = 'Role is required';
    if (!editingUser && !(formData as any).password) (newErrors as any).password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const userData = {
      ...formData
    };

    onAddUser(userData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(60, 61, 61, 0.5)' }}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-light-gray">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-peach mr-3">
            {editingUser ? (
              <Edit className="w-5 h-5 text-primary-orange" />
            ) : (
              <UserPlus className="w-5 h-5 text-primary-orange" />
            )}
          </div>
          <h2 className="text-h3 text-dark-gray">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-dark-gray mb-2 text-table">First Name*</label>
            <input
              type="text"
              name="first_name"
              value={(formData as any).first_name}
              onChange={handleChange}
              className={`w-full bg-cream text-dark-gray px-3 py-2 rounded border ${(errors as any).first_name ? 'border-danger-red' : 'border-light-gray'} focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-input`}
              placeholder="Enter first name"
            />
            {(errors as any).first_name && <p className="mt-1 text-danger-red text-small">{(errors as any).first_name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-dark-gray mb-2 text-table">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full bg-cream text-dark-gray px-3 py-2 rounded border border-light-gray focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-input"
              placeholder="Enter last name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-dark-gray mb-2 text-table">Email*</label>
            <input
              type="email"
              name="email"
              value={(formData as any).email}
              onChange={handleChange}
              className={`w-full bg-cream text-dark-gray px-3 py-2 rounded border ${(errors as any).email ? 'border-danger-red' : 'border-light-gray'} focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-input`}
              placeholder="Enter email address"
            />
            {(errors as any).email && <p className="mt-1 text-danger-red text-small">{(errors as any).email}</p>}
          </div>

          {!editingUser && (
            <div className="mb-4">
              <label className="block text-dark-gray mb-2 text-table">Password*</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full bg-cream text-dark-gray px-3 py-2 rounded border ${(errors as any).password ? 'border-danger-red' : 'border-light-gray'} focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-input`}
                placeholder="Enter password"
              />
              {(errors as any).password && <p className="mt-1 text-danger-red text-small">{(errors as any).password}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-dark-gray mb-2 text-table">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-cream text-dark-gray px-3 py-2 rounded border border-light-gray focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-input"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-dark-gray mb-2 text-table">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-cream text-dark-gray px-3 py-2 rounded border border-light-gray focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-input"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-dark-gray mb-2 text-table">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full bg-cream text-dark-gray px-3 py-2 rounded border border-light-gray focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-input"
            />
          </div>

          <div className="mb-6">
            <label className="block text-dark-gray mb-2 text-table">Role*</label>
            <select
              name="role_id"
              value={(formData as any).role_id}
              onChange={handleChange}
              className={`w-full bg-cream text-dark-gray px-3 py-2 rounded border ${(errors as any).role_id ? 'border-danger-red' : 'border-light-gray'} focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-input`}
            >
              <option value="">Select a role</option>
              {Array.isArray(availableRoles) && availableRoles.map((role: any) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            {(errors as any).role_id && <p className="mt-1 text-danger-red text-small">{(errors as any).role_id}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-light-gray text-dark-gray rounded-md hover:bg-opacity-80 transition duration-200 text-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-gradient text-white rounded-md hover:opacity-90 transition duration-200 text-button shadow-lg"
            >
              {editingUser ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;