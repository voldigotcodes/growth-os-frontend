import React, { useState } from 'react';
import GlassInput from '../../components/GlassInput.jsx';
import GlassButton from '../../components/GlassButton.jsx';
import { signUp } from '../auth.js';

const SignUpForm = ({ onSuccess, onError, switchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const { user, error } = await signUp(formData.email, formData.password, formData.displayName);
    setLoading(false);

    if (error) {
      onError?.(error);
    } else {
      onSuccess?.(user);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="glass-panel p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold theme-text-primary mb-2">Create Account</h2>
        <p className="theme-text-muted">Join Growth OS and start building</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassInput
          label="Display Name"
          name="displayName"
          type="text"
          value={formData.displayName}
          onChange={handleChange}
          error={errors.displayName}
          placeholder="Enter your display name"
          required
        />

        <GlassInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Enter your email"
          required
        />

        <GlassInput
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter your password"
          required
        />

        <GlassInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          required
        />

        <GlassButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          glow
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </GlassButton>
      </form>

      <div className="mt-6 text-center">
        <p className="theme-text-muted text-sm">
          Already have an account?{' '}
          <button
            type="button"
            onClick={switchToLogin}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;