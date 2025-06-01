import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', quantity: '', status: 'In Stock' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = () => {
    fetch('https://backend-o5km.onrender.com/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => toast.error("Error fetching products"));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(mediaStream => {
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play();

      const recorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setChunks(prev => [...prev, e.data]);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
    }).catch(() => toast.error("Webcam access denied"));
  }, []);

  const handleLogout = async () => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state === 'recording') {
      recorder.stop();

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const uploadForm = new FormData();
        uploadForm.append('video', blob, `admin-session-${Date.now()}.webm`);

        try {
          const res = await fetch('https://backend-o5km.onrender.com/api/session/log', {
            method: 'POST',
            body: uploadForm,
          });
          const data = await res.json();

          if (res.ok) {
            toast.success('Video uploaded!');
          } else {
            toast.error(data.msg || 'Video upload failed.');
          }
        } catch (err) {
          toast.error('Network error during video upload.');
        }

        // Stop webcam
        stream?.getTracks().forEach(t => t.stop());
        navigate('/login');
      };
    } else {
      stream?.getTracks().forEach(t => t.stop());
      navigate('/login');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `https://backend-o5km.onrender.com/api/products/${editId}`
      : 'https://backend-o5km.onrender.com/api/products';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          quantity: parseInt(formData.quantity),
          status: formData.status
        })
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to save product.');
        return;
      }

      toast.success(isEditing ? 'Product updated!' : 'Product added!');
      setFormData({ name: '', quantity: '', status: 'In Stock' });
      setIsEditing(false);
      setEditId(null);
      fetchProducts();
    } catch (err) {
      toast.error('Error saving product');
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      <video ref={videoRef} width="300" autoPlay muted />

      <button onClick={handleLogout}>Logout</button>

      <form onSubmit={handleAddOrUpdateProduct}>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} required />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option>In Stock</option>
          <option>Low</option>
          <option>Out of Stock</option>
        </select>
        <button type="submit">{isEditing ? 'Update' : 'Add'} Product</button>
      </form>

      <ul>
        {products.map(p => (
          <li key={p._id}>{p.name} - {p.quantity} - {p.status}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
