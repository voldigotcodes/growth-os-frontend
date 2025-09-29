import React, { useState } from 'react';
import GlassButton from '../../components/GlassButton.jsx';
import { logOut } from '../auth.js';

const LogoutButton = ({ onSuccess, onError, variant = 'ghost', size = 'sm', className = '', children }) => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await logOut();
    setLoading(false);

    if (error) {
      onError?.(error);
    } else {
      onSuccess?.();
    }
  };

  return (
    <GlassButton
      variant={variant}
      size={size}
      className={className}
      loading={loading}
      onClick={handleLogout}
    >
      {children || (loading ? 'Signing Out...' : 'Sign Out')}
    </GlassButton>
  );
};

export default LogoutButton;