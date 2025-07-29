// src/pages/AdminPage.jsx
import { useState,useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import '../../styles/Admin.css';
import axios from 'axios';

const AdminPage = () => {
  const { isAdmin, login, logout } = useAdminAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [usersCount, setUsersCount] = useState(0);
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantCount, setRestaurantCount] = useState(0);

 const fetchOverview = async () => {
  try {
    // Fetch user and restaurant counts
    const overviewRes = await axios.get('https://orderonthego-mern-stack-internship.onrender.com/api/admin/dashboardOverview');
    setUsersCount(overviewRes.data.totalUsers);
    setRestaurantCount(overviewRes.data.totalRestaurants);

    // Fetch all restaurants
    const allRes = await axios.get('https://orderonthego-mern-stack-internship.onrender.com/api/restaurants/all');

    // Fetch promoted restaurants
    const promotedRes = await axios.get('https://orderonthego-mern-stack-internship.onrender.com/api/restaurants/promoted');
    const promotedIds = promotedRes.data.map(r => r._id);

    // Mark promoted status
    const enriched = allRes.data.map(r => ({
      ...r,
      promoted: promotedIds.includes(r._id),
    }));

    setRestaurants(enriched);
  } catch (err) {
    console.error('Error loading dashboard data:', err);
  }
};


  const promoteRestaurant = async (restaurantId) => {
  try {
    await axios.post(`https://orderonthego-mern-stack-internship.onrender.com/api/admin/promoteRestaurant/${restaurantId}`);
    fetchOverview(); // refresh list
  } catch (err) {
    console.error('Failed to promote:', err);
  }
};


  useEffect(() => {
    fetchOverview();
  }, []);
  const handleLogin = () => {
    const success = login(credentials.username, credentials.password);
    if (!success) alert('Invalid credentials');
  };

  if (!isAdmin) {
    return (
      <div className="auth-container">
        <h2>Admin Login</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
          <button type="submit" onClick={handleLogin}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Welcome Admin</h1>
        <button onClick={() => {
          localStorage.removeItem('admin');
          window.location.reload();
        }}>Logout</button>
      </div>

      <div className="stats-container">
        <div className="stat-card">👤 Users: <strong>{usersCount}</strong></div>
        <div className="stat-card">🍽️ Restaurants: <strong>{restaurantCount}</strong></div>
      </div>

      <h3>📋 Restaurants List</h3>
      <div className="restaurants-list">
        {restaurants.map((rest) => (
          <div key={rest._id} className="admin-restaurant-card">
            <img src={rest.imageUrl} alt={rest.restaurantName} />
            <div className="restaurant-info">
              <h4>{rest.restaurantName}</h4>
              <p>⭐ {rest.rating?.toFixed(1) || 'N/A'}</p>
              {rest.promoted ? (
                <span className="promoted-label">Promoted</span>
              ) : (
                <button className='refresh-button' onClick={() => promoteRestaurant(rest._id)}>Promote</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
