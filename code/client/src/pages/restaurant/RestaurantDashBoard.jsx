import { useEffect, useState } from 'react';
import { useRestaurantAuth } from '../../context/RestaurantAuthContext';
import axios from 'axios';
import '../../styles/RestaurantDashboard.css';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';



const RestaurantDashboard = () => {
  const { restaurant, logout } = useRestaurantAuth();
  const [products, setProducts] = useState([]);
  const [restaurantOrders, setRestaurantOrders] = useState([]);
  const [productCache, setProductCache] = useState({});
  const [statusUpdates, setStatusUpdates] = useState({});
  const productRef = useRef(null);
  const addProductRef = useRef(null);
  const ordersRef = useRef(null);

  const [newProduct, setNewProduct] = useState({
    productName: '', description: '', price: '', discount: '', category: '', imageUrl: ''
  });
  const [editProduct, setEditProduct] = useState(null);
  const navigate = useNavigate();

  const handleStatusChange = (orderId, newStatus) => {
    setStatusUpdates(prev => ({
      ...prev,
      [orderId]: newStatus,
    }));
  };

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  const handleUpdateStatus = async (orderId) => {
    const newStatus = statusUpdates[orderId];
    if (!newStatus) {
      alert('Please select a status first.');
      return;
    }

    try {
      await axios.post(`https://orderonthego-mern-stack-internship.onrender.com/api/orders/updateStatus/${orderId}`, {
        status: newStatus
      });
      alert('Order status updated!');
      fetchOrders(); // Refresh orders after update
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status.');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`https://orderonthego-mern-stack-internship.onrender.com/api/products/fetch?restaurantId=${restaurant._id}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`https://orderonthego-mern-stack-internship.onrender.com/api/orders/restaurantOrders/${restaurant._id}`);
      const orders = res.data;
      setRestaurantOrders(orders);

      // Extract unique product IDs to fetch details
      const uniqueIds = [...new Set(orders.flatMap(order => order.items.map(i => i.productId)))];

      await Promise.all(uniqueIds.map(async (id) => {
        if (!productCache[id]) {
          const prodRes = await axios.get(`https://orderonthego-mern-stack-internship.onrender.com/api/products/fetch?id=${id}`);
          if (prodRes.data.length > 0) {
            const product = prodRes.data[0];
            setProductCache(prev => ({ ...prev, [id]: product }));
          }
        }
      }));
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };


  useEffect(() => {
    if (restaurant) {
      fetchProducts();
      fetchOrders();
    }
  }, [restaurant]);

  const handleAddProduct = async () => {
    try {
      await axios.post('https://orderonthego-mern-stack-internship.onrender.com/api/products/insert', {
        ...newProduct,
        restaurantId: restaurant._id,
        price: Number(newProduct.price),
        discount: Number(newProduct.discount),
      });
      alert('Product added');
      setNewProduct({ productName: '', description: '', price: '', discount: '', category: '', imageUrl: '' });
      fetchProducts();
    } catch (err) {
      alert('Failed to add product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.post(`https://orderonthego-mern-stack-internship.onrender.com/api/products/delete?productId=${id}`);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleUpdateProduct = async () => {
    try {
      await axios.post(`https://orderonthego-mern-stack-internship.onrender.com/api/products/update/${editProduct._id}`, {
        price: Number(editProduct.price),
        discount: Number(editProduct.discount),
        category: editProduct.category,
        productName: editProduct.productName,
        description: editProduct.description,
        imageUrl: editProduct.imageUrl
      });
      alert('Product updated');
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      alert('Failed to update product');
    }
  };

  return (
    <div className="restaurant-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="logo" onClick={() => navigate('/restaurant/dashboard')}>
          <img src="/sb-foods.png" alt="logo" />
          <span>SB<span className="red">foods</span></span>
        </div>
        <div className="header-right">
          <span>{restaurant.restaurantName}</span>
          <button onClick={() => scrollToSection(ordersRef)}>Orders</button>
          <button onClick={() => scrollToSection(productRef)}>Products</button>
          <button onClick={() => scrollToSection(addProductRef)}>Add Product</button>
          <button
            onClick={() => {
              logout();
              navigate('/restaurant/login');
            }}
          >
            Logout
          </button>
        </div>
      </div>


      {/* Orders Section */}
      <h2 >🧾 Restaurant Orders</h2>

      <div ref={ordersRef} className="orders-section">
        <button className='refresh-button'
          onClick={fetchOrders}
          >
          🔄 Refresh Orders
        </button>
        {restaurantOrders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <ul className="orders-list">
            {restaurantOrders.map((order) => (
              <li key={order._id} className="order-card">
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>User:</strong> {order.userId}</p>
                <p><strong>Items:</strong></p>
                <ul>
                  {order.items.map(item => {
                    const product = productCache[item.productId];
                    return (
                      <li key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={product?.imageUrl || '/images/default-food.png'}
                          alt={product?.productName || 'Product'}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }}
                        />
                        <span>{product?.productName || item.productId} × {item.quantity}</span>
                      </li>
                    );
                  })}
                </ul>
                <p><strong>Location:</strong> {order.createdAt || 'N/A'}</p>
                <p><strong>Status:</strong> {order.status}</p>

                {/* Status dropdown & update button */}
                <div style={{ marginTop: '10px' }}>
                  <select
                    value={statusUpdates[order._id] || order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="placed">Placed</option>
                    <option value="on the way">On the way</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <button
                    style={{ marginLeft: '10px', padding: '5px 12px', cursor: 'pointer' }}
                    onClick={() => handleUpdateStatus(order._id)}
                  >
                    Update Status
                  </button>
                </div>
              </li>
            ))}

          </ul>
        )}
      </div>


      {/* Product Section */}
      <h2 >🍛 Your Products</h2>
      <div  ref={productRef} className="products-section">
        <div className="product-grid">
          {products.map(prod => (
            <div key={prod._id} className="product-card">
              <img src={prod.imageUrl} alt={prod.productName} />
              <h4>{prod.productName}</h4>
              <p>₹{prod.price} | {prod.discount}% off</p>
              <p>Category: {prod.category}</p>
              <button onClick={() => handleDelete(prod._id)}>Delete</button>
              <button onClick={() => setEditProduct(prod)}>Edit</button>
            </div>
          ))}
        </div>

        {editProduct && (
          <div className="add-product-form">
            <h3>Update Product</h3>
            <input placeholder="Name" value={editProduct.productName} onChange={(e) => setEditProduct({ ...editProduct, productName: e.target.value })} />
            <input placeholder="Description" value={editProduct.description} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} />
            <input type="number" placeholder="Price" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })} />
            <input type="number" placeholder="Discount" value={editProduct.discount} onChange={(e) => setEditProduct({ ...editProduct, discount: e.target.value })} />
            <input placeholder="Category" value={editProduct.category} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })} />
            <input placeholder="Image URL" value={editProduct.imageUrl} onChange={(e) => setEditProduct({ ...editProduct, imageUrl: e.target.value })} />
            <div>
              <button onClick={handleUpdateProduct}>Update</button>
              <button onClick={() => setEditProduct(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Section */}
      <h2 ref={addProductRef}> 🍛 Add Product</h2>
      <div className="product-add">
        <div className="add-product-form">
          <input placeholder="Name" value={newProduct.productName} onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })} required />
          <input placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} required />
          <input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required />
          <input type="number" placeholder="Discount" value={newProduct.discount} onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })} required />
          <input placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} required />
          <input placeholder="Image URL" value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} required />
          <button onClick={handleAddProduct}>Add</button>
        </div>
        <div className="image-preview">
          <p>Image Preview:</p>
          <img
            src={newProduct.imageUrl || 'https://th.bing.com/th/id/OIP.aFKAtHQqGgrbuTDEKAT4_wHaHa?rs=1&pid=ImgDetMain'}
            alt="Product Preview"
            style={{ width: '350px', height: '250px', borderRadius: '8px' }}
            onError={(e) => {
              e.target.src = 'https://th.bing.com/th/id/OIP.aFKAtHQqGgrbuTDEKAT4_wHaHa?rs=1&pid=ImgDetMain';
            }}
          />
        </div>
      </div>


    </div>
  );
};

export default RestaurantDashboard;
