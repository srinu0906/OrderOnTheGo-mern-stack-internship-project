import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/RestaurantAuth.css';

const RestaurantRegister = () => {
  const [form, setForm] = useState({
    userName: '',
    password: '',
    email: '',
    restaurantName: '',
    address: '',
    imageUrl: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://orderonthego-mern-stack-internship.onrender.com/api/auth/restaurant/register', form);
      alert('Registration successful!');
      navigate('/restaurant/login');
    } catch (err) {
      alert('Registration failed!');
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <h2>SBfoods Restaurant Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="userName" placeholder="Username" onChange={handleChange} required />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
        <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
        <input name="restaurantName" placeholder="Restaurant Name" onChange={handleChange} required />
        <input name="address" placeholder="Address" onChange={handleChange} required />
        <input name="imageUrl" placeholder="Image URL" onChange={handleChange} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RestaurantRegister;
