import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css'; // red theme styles
import Header from '../components/Header';
import Footer from '../components/Footer';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://orderonthego-mern-stack-internship.onrender.com/api/auth/user/login', { email, password });
      login(res.data.user); // Store user info in context
      navigate('/');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || 'Server Error'));
    }
  };

  return (
    <>
    <Header/>
    <br /><br />
    <div className="auth-container">
      <h2 className="auth-title">User Login</h2>
      <form className="auth-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        <p className="auth-switch">
          Don’t have an account?{' '}
          <span onClick={() => navigate('/register')}>Register</span>
        </p>
      </form>
    </div>
    <Footer/>
    </>
  );
};

export default Login;
