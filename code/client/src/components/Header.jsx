import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, restaurantsRes] = await Promise.all([
          axios.get('https://orderonthego-mern-stack-internship.onrender.com/api/products/fetch'),
          axios.get('https://orderonthego-mern-stack-internship.onrender.com/api/restaurants/all'),
        ]);

        const products = productsRes.data.map(p => ({
          id: p._id,
          name: p.productName,
          type: 'product',
          image: p.imageUrl
        }));

        const restaurants = restaurantsRes.data.map(r => ({
          id: r._id,
          name: r.restaurantName,
          type: 'restaurant',
          image: r.imageUrl
        }));

        setAllItems([...products, ...restaurants]);
      } catch (err) {
        console.error('Error fetching search data', err);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = allItems.filter(
      item => item.name && item.name.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filtered);
  };

  const handleSuggestionClick = (item) => {
    setSearchTerm('');
    setSuggestions([]);
    if (item.type === 'product') {
      navigate(`/product/${item.id}`);
    } else {
      navigate(`/restaurant/${item.id}`);
    }
  };

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src="/sb-foods.png" alt="SBfoods" />
        <span>
          SB<span className="red">foods</span>
        </span>
      </div>

      {/* Search with suggestions */}
      <div className="search-wrapper">
        <input
          className="search"
          type="text"
          placeholder="Search for food or restaurants..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {suggestions.length > 0 && (
          <ul className="suggestion-box">
            {suggestions.map(item => (
              <li key={item.id} onClick={() => handleSuggestionClick(item)}>
                <img
                  src={item.image || '/images/default.png'}
                  alt={item.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    marginRight: '8px'
                  }}
                />
                <span>{item.name} <span className="type">({item.type})</span></span>
              </li>

            ))}
          </ul>
        )}
      </div>

      {!isLoggedIn ? (
        <div className="auth-buttons">
          <button onClick={() => navigate('/login')}>Login</button>
          <button onClick={() => navigate('/register')}>Register</button>
        </div>
      ) : (
        <div className="user-section">
          <button onClick={() => navigate('/orders')}>📦 Orders</button>
          <button onClick={() => navigate('/cart')}>🛒 Cart</button>
          <button onClick={() => navigate('/profile')}>👤 Profile</button>
        </div>
      )}
    </header>
  );
};

export default Header;
