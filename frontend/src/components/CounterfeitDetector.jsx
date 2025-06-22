import React, { useState } from 'react';
import { detectCounterfeit } from '../services/api';

const ResultCard = ({ result }) => {
  if (!result) return null;

  if (result.error) {
    return <div style={styles.errorCard}><strong>Error:</strong> {result.error}</div>;
  }

  // Assuming the backend returns something like: { "is_counterfeit": true/false, "confidence_score": 0.85, "reason": "..." }
  const isCounterfeit = result.is_counterfeit;
  const cardStyle = isCounterfeit ? styles.suspiciousCard : styles.normalCard;

  return (
    <div style={cardStyle}>
      <h4 style={{ marginTop: 0 }}>Analysis Result</h4>
      <p><strong>Assessment:</strong> <span style={{ fontWeight: 'bold' }}>{isCounterfeit ? 'Potential Counterfeit' : 'Likely Authentic'}</span></p>
      <p><strong>Reason:</strong> {result.reason || 'Analysis complete.'}</p>
      {result.confidence_score && (
         <p><strong>Confidence Score:</strong> {(result.confidence_score * 100).toFixed(1)}%</p>
      )}
    </div>
  );
};


const CounterfeitDetector = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile || !title || !description) {
      alert('Please fill in all fields and choose an image.');
      return;
    }
    setIsLoading(true);
    setResult(null); // Clear previous results
    const analysisResult = await detectCounterfeit(imageFile, title, description);
    setResult(analysisResult);
    setIsLoading(false);
  };

  return (
    <div style={styles.container}>
      <h3>Counterfeit Product Detector</h3>
      <p>Upload a product image and its title/description to check for authenticity.</p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
            <label htmlFor="title-input">Product Title:</label>
            <input
                id="title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 'Luxury Leather Handbag'"
                style={styles.textInput}
                required
            />
        </div>
        <div style={styles.inputGroup}>
            <label htmlFor="desc-input">Description:</label>
            <textarea
                id="desc-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., 'Genuine Italian leather, high quality stitching...'"
                style={styles.textarea}
                rows={3}
                required
            />
        </div>
        <div style={styles.inputGroup}>
            <label htmlFor="image-upload">Product Image:</label>
            <input
                id="image-upload"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
                required
            />
        </div>
        
        {preview && <img src={preview} alt="Preview" style={styles.previewImg} />}
        
        <button type="submit" style={styles.button} disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Detect Counterfeit'}
        </button>
      </form>
      <ResultCard result={result} />
    </div>
  );
};

// Reusing styles from FakeReviewAnalyzer with some additions
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
  errorCard: { marginTop: '20px', padding: '15px', borderRadius: '8px', backgroundColor: '#fff3e0', border: '1px solid #ffe0b2', color: '#e65100' }
};

export default CounterfeitDetector;