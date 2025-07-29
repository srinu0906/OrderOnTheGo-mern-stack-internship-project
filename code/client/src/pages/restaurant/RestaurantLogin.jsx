import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/RestaurantAuth.css';
import { useRestaurantAuth } from '../../context/RestaurantAuthContext';

const RestaurantLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { login } = useRestaurantAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://orderonthego-mern-stack-internship.onrender.com/api/auth/restaurant/login', form);
      const restaurantData = res.data[0]; // Assuming server returns [restaurantObj]
      login(restaurantData);
      
      navigate('/restaurant/dashboard');
    } catch (err) {
      alert('Login failed!');
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <h2>SBfoods Restaurant Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default RestaurantLogin;
