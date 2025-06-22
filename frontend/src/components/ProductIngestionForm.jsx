import React, { useState } from 'react';
import { ingestProductListing } from '../services/api';

const ProductIngestionForm = () => {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null); // Clear previous result on new image
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (!imageFile) {
      alert('Please select an image file.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    const analysisResult = await ingestProductListing(formData);
    setResult(analysisResult);
    setIsLoading(false);
  };

  return (
    <div style={styles.container}>
      <h3>Upload New Product Listing</h3>
      <p>Simulate a seller uploading a new product for analysis.</p>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Pass all form data via FormData object */}
        <div style={styles.inputGroup}>
            <label htmlFor="title">Product Title:</label>
            <input name="title" id="title" type="text" style={styles.textInput} required />
        </div>
        <div style={styles.inputGroup}>
            <label htmlFor="description">Description:</label>
            <textarea name="description" id="description" style={styles.textarea} rows={3} required />
        </div>
        <div style={styles.inputGroup}>
            <label htmlFor="seller_id">Seller ID:</label>
            <input name="seller_id" id="seller_id" type="text" style={styles.textInput} required />
        </div>
        <div style={styles.inputGroup}>
            <label htmlFor="product_id">Product ID:</label>
            <input name="product_id" id="product_id" type="text" style={styles.textInput} required />
        </div>
        <div style={styles.inputGroup}>
            <label htmlFor="image-upload">Product Image:</label>
            <input name="image" id="image-upload" type="file" accept="image/*" onChange={handleImageChange} required />
        </div>
        
        {preview && <img src={preview} alt="Preview" style={styles.previewImg} />}
        
        <button type="submit" style={styles.button} disabled={isLoading}>
          {isLoading ? 'Uploading & Analyzing...' : 'Upload Listing'}
        </button>
      </form>
      
      {result && (
        <div style={result.suspected_counterfeit ? styles.suspiciousCard : styles.normalCard}>
          <h4>Upload Status</h4>
          <p><strong>Message:</strong> {result.message}</p>
          <p><strong>Counterfeit Flag:</strong> {result.suspected_counterfeit ? 'Yes' : 'No'}</p>
          <p><strong>Similarity Score:</strong> {result.clip_similarity_score}</p>
          {result.image_path && <p><strong>Evidence Path:</strong> {result.image_path}</p>}
        </div>
      )}
    </div>
  );
};

// Reusable styles
const styles = {
    container: { marginTop: '40px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fafafa' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    textInput: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box' },
    button: { padding: '10px 15px', fontSize: '1rem', color: 'white', backgroundColor: '#007bff', border: 'none', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-start' },
    previewImg: { maxWidth: '200px', maxHeight: '200px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd' },
    normalCard: { marginTop: '20px', padding: '15px', borderRadius: '8px', backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9' },
    suspiciousCard: { marginTop: '20px', padding: '15px', borderRadius: '8px', backgroundColor: '#ffebee', border: '1px solid #ffcdd2' },
};

export default ProductIngestionForm;