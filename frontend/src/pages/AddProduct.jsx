import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios'; // use your axios instance with baseURL

const AddProduct = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [productId, setProductId] = useState('');
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!title || !description || !sellerId || !productId || !image) {
      alert('Please fill all fields and select an image.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('seller_id', sellerId);
    formData.append('product_id', productId);
    formData.append('image', image);

    try {
      const res = await axios.post('/ingest/upload_listing/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = res.data;

      if (data.suspected_counterfeit) {
        alert('⚠️ Fake Product Detected: Brand mismatch or low similarity.');
        localStorage.setItem('recent_notification', `Fake Product Flagged: ${title}`);
      } else {
        alert('✅ Product added successfully');
        localStorage.setItem('recent_notification', `Product Added: ${title}`);
      }

      navigate('/seller');
    } catch (err) {
      console.error(err);
      alert('Error uploading product.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Add New Product</h2>
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#f9f9f9' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Title</label><br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Description</label><br />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Seller ID</label><br />
          <input
            type="text"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Product ID</label><br />
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Product Image</label><br />
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleSubmit} style={{ padding: '0.5rem 1rem' }}>Submit</button>
          <button onClick={() => navigate('/seller')} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
