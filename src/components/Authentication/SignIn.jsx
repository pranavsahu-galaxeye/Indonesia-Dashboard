import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import './SignIn.css';
import logo from '../../../public/galaxeye-white.png';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'indonesia@galaxeye.space' && password === 'demotest') {
      login();
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="signin-container">
      <div className="transparent-overlay">
        <p className="overlay-text">
          "Your unbiased source of intelligence for Aquaculture, leveraging Satellite Imagery and AI"
        </p>
      </div>
      <div className="signin-background">
        <form className="signin-form" onSubmit={handleSubmit}>
          <img src={logo} alt="GalaxEye Logo" className="signin-logo" />
          <h2>Login to your account</h2>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
