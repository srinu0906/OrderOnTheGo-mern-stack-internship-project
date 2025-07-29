import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css'; // shared CSS
import Header from '../components/Header';
import Footer from '../components/Footer';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: '', email: '', password: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://orderonthego-mern-stack-internship.onrender.com/api/auth/user/register', form);
      login(res.data.user); // auto-login after registration
      navigate('/');
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  return (
    <>
    <Header/>
    <br /><br />
    <div className="auth-container">
      <h2 className="auth-title">User Registration</h2>
      <form className="auth-form" onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={form.userName}
          required
          onChange={(e) => setForm({ ...form, userName: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Register</button>
        <p className="auth-switch">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Login</span>
        </p>
      </form>
    </div>
    <Footer/>
    </>
  );
};

export default Register;
