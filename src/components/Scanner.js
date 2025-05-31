import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';
import { toast } from 'react-toastify';
import '../styles/Scanner.css';

const ScannerWithForm = () => {
  const scannerRef = useRef(null);
  const [detectedCode, setDetectedCode] = useState(null);
  const [existingBarcodes, setExistingBarcodes] = useState([]);
  const [formData, setFormData] = useState({ name: '', quantity: '', status: 'In Stock' });

  useEffect(() => {
    fetch('https://backend-o5km.onrender.com/api/products')
      .then(res => res.json())
      .then(data => setExistingBarcodes(data.map(p => p.barcode)))
      .catch(err => console.error('Fetch error:', err));
  }, []);

  useEffect(() => {
    if (scannerRef.current) {
      Quagga.init({
        inputStream: {
          type: 'LiveStream',
          constraints: { width: 640, height: 480, facingMode: 'environment' },
          target: scannerRef.current
        },
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'code_128_reader']
        }
      }, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        Quagga.start();
      });

      Quagga.onDetected((data) => {
        const code = data.codeResult.code;
        if (existingBarcodes.includes(code)) {
          toast.warning(`Duplicate entry: ${code}`);
        } else {
          setDetectedCode(code);
          toast.success(`Barcode detected: ${code}`);
        }
        Quagga.stop();
      });

      return () => {
        Quagga.stop();
        Quagga.offDetected();
      };
    }
  }, [existingBarcodes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData, barcode: detectedCode };
    fetch('https://backend-o5km.onrender.com/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(() => {
      toast.success('Product added successfully');
      setFormData({ name: '', quantity: '', status: 'In Stock' });
      setDetectedCode(null);
    })
    .catch(err => {
      console.error('Submit error:', err);
      toast.error('Failed to add product');
    });
  };

  return (
    <div className="scanner-container">
      <h2>Scan Barcode</h2>
      <div id="scanner-view" ref={scannerRef}></div>

      {detectedCode && (
        <form onSubmit={handleSubmit} className="product-form">
          <p><strong>Detected Barcode:</strong> {detectedCode}</p>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" required />
          <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required />
          <select name="status" value={formData.status} onChange={handleChange}>
            <option>In Stock</option>
            <option>Low</option>
            <option>Out of Stock</option>
          </select>
          <button type="submit">Add Product</button>
        </form>
      )}
    </div>
  );
};

export default ScannerWithForm;
