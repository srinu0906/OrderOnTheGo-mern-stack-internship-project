// File: src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Home.css';

const categories = [
  { name: 'Breakfast', image: 'https://www.shutterstock.com/image-photo/south-indian-breakfast-vegetable-idly-260nw-283294874.jpg' },
  { name: 'Meals', image: 'https://rakskitchen.net/wp-content/uploads/2013/08/9634876480_20d7ac8196_o.jpg' },
  { name: 'Biriyani', image: 'https://5.imimg.com/data5/SELLER/Default/2020/9/TM/KJ/OG/2707316/mutton-biriyani-masala-500x500.jpg' },
  { name: 'Veg', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlSJrMlNj7HvyrNNJG6U82ady6rciMYqQtTw&s' },
  { name: 'Non-Veg', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiJKsEFGitxlp_2tMePrpOeOfisp1v9qeQ39Iu2epk-Cp4Csg_RImlPesjTR2vU7pEtLc&usqp=CAU' },
];

const Home = () => {
  const navigate = useNavigate();
  const [popularRestaurants, setPopularRestaurants] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchPromoted = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/restaurants/promoted');
        setPopularRestaurants(res.data);
      } catch (err) {
        console.error('Error fetching promoted restaurants:', err);
      }
    };

    fetchPromoted();
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/restaurants/all');
        setRestaurants(res.data);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <>
      <Header />
      <br /><br />
      <div className="home-container">
        {/* Categories */}
        <h2>Popular Categories</h2> <br />
        <div className="categories">
          {categories.map((cat, index) => (
            <div
              className="category-card"
              key={index}
              onClick={() => navigate(`/products?category=${cat.name.toLowerCase()}`)}
            >
              <img src={cat.image} alt={cat.name} />
              <p>{cat.name}</p>
            </div>
          ))}
        </div>

        {/* Popular Restaurants */}
        <br />
        <h2>Popular Restaurants</h2><br />
        <div className="restaurants">
          {popularRestaurants.map((rest, index) => (
            <div
              className="restaurant-card"
              key={index}
              onClick={() => navigate(`/products?restaurantId=${rest._id}`)}
            >
              <img src={rest.imageUrl} alt={rest.restaurantName} />
              <p>{rest.restaurantName}</p>
              <p>⭐{rest.rating.toFixed(1)}/5 <br/>
              {rest.totalRatings} ratings</p>
            </div>
          ))}

          
        </div>

        {/* All Restaurants */}
        <br />
        <h2>Explore Restaurants</h2><br />
        <div className="restaurants">
          {restaurants.map((rest, index) => (
            <div
              className="restaurant-card"
              key={index}
              onClick={() => navigate(`/products?restaurantId=${rest._id}`)}
            >
              <img src={rest.imageUrl} alt={rest.restaurantName} />
              <p>{rest.restaurantName}</p>
              <p>⭐{rest.rating.toFixed(1)}/5 <br/>
              {rest.totalRatings} ratings</p>
            </div>
          ))}

          
        </div>

      </div>
      <Footer />
    </>
  );
};

export default Home;
