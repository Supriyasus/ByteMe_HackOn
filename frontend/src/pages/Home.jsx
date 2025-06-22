import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!userId || !password || !role) {
      alert('Please fill all fields.');
      return;
    }

    if (role === 'seller') {
      localStorage.setItem('user_id', userId);
      navigate('/seller');
    } else if (role === 'admin') {
      localStorage.setItem('admin_id', userId);
      navigate('/admin-dashboard');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h2>Login</h2>
      <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
        <option value="">Select Role</option>
        <option value="seller">Login as Seller</option>
        <option value="admin">Login as Admin</option>
      </select>

      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginTop: '1rem' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginTop: '1rem' }}
      />
      <button onClick={handleLogin} style={{ marginTop: '1rem', padding: '0.5rem', width: '100%' }}>
        Login
      </button>
    </div>
  );
};

export default Home;
