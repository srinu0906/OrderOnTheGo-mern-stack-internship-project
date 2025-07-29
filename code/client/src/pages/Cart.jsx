// File: src/pages/Cart.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import '../styles/Cart.css';

const Cart = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({}); // Map of productId to product details

  const fetchCart = async () => {
    try {
      const res = await axios.get(`https://orderonthego-mern-stack-internship.onrender.com/api/cart/getItems?userId=${user._id}`);

      // console.log(user._id);
      setCart(res.data);

      // Fetch product details
      const productData = {};
      for (const item of res.data.items) {
        const productRes = await axios.get(`https://orderonthego-mern-stack-internship.onrender.com/api/products/fetch?id=${item.productId}`);
        if (productRes.data.length > 0) {
          productData[item.productId] = productRes.data[0];
        }
      }
      setProducts(productData);

    } catch (err) {
      console.error('Failed to fetch cart', err);
      setCart(null);
    }
  };

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const handleRemove = async (productId) => {
    try {
      await axios.post('https://orderonthego-mern-stack-internship.onrender.com/api/cart/deleteItem', {
        userId: user._id,
        productId
      });
      fetchCart(); // refresh cart
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

const handlePlaceOrder = async () => {
  if (!cart || !cart.items || cart.items.length === 0) {
    alert("Cart is empty!");
    return;
  }

  // Get current position
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const now = new Date();
    const createdAt = "📌 latitude : "+latitude +" longitude "+longitude+ " 🗓️ "+now.toDateString() + " ⏰ "+now.toLocaleTimeString();

    const orderData = {
      userId: user._id,
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      createdAt
    };

    try {
      // Step 1: Place the order
      await axios.post('https://orderonthego-mern-stack-internship.onrender.com/api/orders/place', orderData);
      alert("Order placed successfully!");

      // Step 2: Delete each item from the cart
      for (const item of cart.items) {
        await axios.post('https://orderonthego-mern-stack-internship.onrender.com/api/cart/deleteItem', {
          userId: user._id,
          productId: item.productId
        });
      }

      // Step 3: Refresh the cart
      fetchCart(); // This will set cart to null if empty
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Failed to place order");
    }
  }, (error) => {
    console.error("Location access denied or failed:", error);
    alert("Please enable location access to place the order.");
  });
};


  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((acc, item) => {
      const product = products[item.productId];
      if (!product) return acc;
      const price = product.price;
      const discount = product.discount || 0;
      const discounted = price * (1 - discount / 100);
      return acc + discounted * item.quantity;
    }, 0).toFixed(2);
  };

  return (
    <>
      <Header />
      <br /><br />
      <div className="cart-container">
        <h2>Your Cart</h2> <br />
        {!cart || !cart.items || cart.items.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.items.map((item) => {
                const product = products[item.productId];
                if (!product) return null;
                const subtotal = (product.price * (1 - product.discount / 100) * item.quantity).toFixed(2);

                return (
                  <div key={item.productId} className="cart-item">
                    <img src={product.imageUrl || '/images/default-food.png'} alt={product.productName} />
                    <div className="info">
                      <h4>{product.productName}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ₹{product.price}</p>
                      <p>Discount: {product.discount}%</p>
                      <p>Subtotal: ₹{subtotal}</p>
                      <button onClick={() => handleRemove(item.productId)}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="cart-summary">
              <h3>Total: ₹{calculateTotal()}</h3>
              <button onClick={handlePlaceOrder}>Place Order</button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Cart;
