import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', quantity: '', status: 'In Stock' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [profileImage, setProfileImage] = useState(localStorage.getItem('adminProfile') || '');
  const navigate = useNavigate();

  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => toast.error("Error fetching products"));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const options = { mimeType: 'video/webm; codecs=vp8' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      toast.error("Browser doesn't support video/webm format.");
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(mediaStream => {
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(err => console.warn('Autoplay prevented:', err));
      };

      const recorder = new MediaRecorder(mediaStream, options);
      let chunks = [];

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (chunks.length === 0) {
          toast.error('No video recorded.');
          navigate('/login');
          return;
        }

        const blob = new Blob(chunks, { type: 'video/webm' });
        const uploadForm = new FormData();
        uploadForm.append('video', blob, `admin-session-${Date.now()}.webm`);

        fetch('http://localhost:5000/api/session/log', {
          method: 'POST',
          body: uploadForm,
        })
          .then(res => res.json())
          .then(() => {
            toast.success('Session video saved successfully!');
            navigate('/login');
          })
          .catch(() => {
            toast.error('Failed to upload session video.');
            navigate('/login');
          });
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
    }).catch(() => toast.error("Error accessing webcam"));
  }, []);

  const handleLogout = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateProduct = (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `http://localhost:5000/api/products/${editId}`
      : 'http://localhost:5000/api/products';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        quantity: parseInt(formData.quantity),
        status: formData.status
      })
    })
    .then(res => res.json())
    .then(() => {
      toast.success(isEditing ? 'Product updated!' : 'Product added!');
      setFormData({ name: '', quantity: '', status: 'In Stock' });
      setIsEditing(false);
      setEditId(null);
      fetchProducts();
    })
    .catch(() => toast.error('Failed to submit product.'));
  };

  const handleEdit = (product) => {
    setFormData({ name: product.name, quantity: product.quantity, status: product.status });
    setEditId(product._id);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    fetch(`http://localhost:5000/api/products/${id}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(() => {
      toast.success('Product deleted!');
      fetchProducts();
    })
    .catch(() => toast.error('Failed to delete product.'));
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      localStorage.setItem('adminProfile', reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="dashboard-container responsive">
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <a href="/">Home</a>
          <a href="/inventory">Inventory</a>
          <a href="/scanner">Scanner</a>
          <button onClick={handleLogout}>Logout</button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <h2>Welcome, Admin 👋</h2>
          <div className="profile-card">
            <label htmlFor="profile-upload" className="upload-avatar">
              <img
                src={profileImage || "https://res.cloudinary.com/dt2wsybjb/image/upload/v1748699468/emma_mf0e26.jpg"}
                alt="Admin"
                title="Click to change image"
              />
              <input id="profile-upload" type="file" accept="image/*" onChange={handleProfileChange} hidden />
            </label>
            <div>
              <p className="name">Admin User</p>
              <p className="role">Super Admin</p>
            </div>
          </div>
        </header>

        <div className="metrics">
          <div className="card">Total Products: {products.length}</div>
          <div className="card">Low Stock: {products.filter(p => p.status.toLowerCase() === 'low').length}</div>
          <div className="card">New Orders: 5</div>
        </div>

        <form className="product-form" onSubmit={handleAddOrUpdateProduct}>
          <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
          <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
          <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} required />
          <select name="status" value={formData.status} onChange={handleChange}>
            <option>In Stock</option>
            <option>Low</option>
            <option>Out of Stock</option>
          </select>
          <button type="submit">{isEditing ? 'Update Product' : 'Add Product'}</button>
        </form>

        <section className="dashboard-content">
          <div className="video-section">
            <h3>Live Recording</h3>
            <video ref={videoRef} width="320" height="240" autoPlay muted />
          </div>

          <div className="table-section">
            <h3>Product Inventory</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="5">No products found.</td></tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td>{product._id.slice(-5)}</td>
                      <td>{product.name}</td>
                      <td>{product.quantity}</td>
                      <td>{product.status}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(product._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
