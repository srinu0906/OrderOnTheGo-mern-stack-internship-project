// File: src/pages/ProductList.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const restaurantId = queryParams.get('restaurantId');
  const category = queryParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = [];
        if (restaurantId) query.push(`restaurantId=${restaurantId}`);
        if (category) query.push(`category=${category}`);
        const queryString = query.join('&');

        const res = await axios.get(`https://orderonthego-mern-stack-internship.onrender.com/api/products/fetch?${queryString}`);
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, [restaurantId, category]);

  return (
    <>
      <Header />
      <br /><br />
      <div className="product-list-page">
        <h2>{category ? `${category.toUpperCase()} Items` : 'Menu'}</h2> <br />
        <div className="products-container">
          {products.length ? (
            products.map((product) => (
              <div
                key={product._id}
                className="product-card"
                onClick={() => navigate(`/product/${product._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <img src={product.imageUrl} alt={product.productName} />
                <h3>{product.productName}</h3>
                <p>{product.description}</p>
                <p>
                  ₹{product.price}{' '}
                  <span className="discount">({product.discount}% off)</span>
                </p>
              </div>
            ))
          ) : (
            <p>No products available.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductList;
