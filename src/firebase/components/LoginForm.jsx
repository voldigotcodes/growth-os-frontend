import React, { useState } from 'react';
import GlassInput from '../../components/GlassInput.jsx';
import GlassButton from '../../components/GlassButton.jsx';
import { signIn } from '../auth.js';

const LoginForm = ({ onSuccess, onError, switchToSignUp }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const { user, userProfile, error } = await signIn(formData.email, formData.password);
    setLoading(false);

    if (error) {
      onError?.(error);
    } else {
      onSuccess?.(user, userProfile);
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
        <h2 className="text-2xl font-bold theme-text-primary mb-2">Welcome Back</h2>
        <p className="theme-text-muted">Sign in to your Growth OS account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <GlassButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          glow
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </GlassButton>
      </form>

      <div className="mt-6 text-center">
        <p className="theme-text-muted text-sm">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={switchToSignUp}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;