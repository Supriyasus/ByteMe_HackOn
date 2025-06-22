import React, { useState } from "react";
import axios from "axios";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    seller_id: "",
    product_id: "",
  });
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please upload an image");

    const payload = new FormData();
    payload.append("image", image);
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("seller_id", formData.seller_id);
    payload.append("product_id", formData.product_id);

    try {
      const res = await axios.post("http://localhost:8000/ingest/upload_listing/", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check backend.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-2">
          Add New Product
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-md shadow p-6 border"
        >
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Product Image
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Apple AirPods Pro"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short product description..."
              className="w-full border rounded px-3 py-2 h-24 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Seller ID
              </label>
              <input
                type="text"
                name="seller_id"
                value={formData.seller_id}
                onChange={handleChange}
                placeholder="e.g. SELLER123"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Product ID
              </label>
              <input
                type="text"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                placeholder="e.g. PROD789"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded shadow"
          >
            Submit Product
          </button>
        </form>

        {result && (
          <div className="mt-6 bg-white border shadow p-6 rounded-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Detection Result
            </h2>
            <ul className="text-sm text-gray-600">
              <li><strong>Title:</strong> {result.title}</li>
              <li><strong>Description:</strong> {result.description}</li>
              <li><strong>Similarity Score:</strong> {result.clip_similarity_score}</li>
              <li><strong>Flagged as Counterfeit:</strong> {result.suspected_counterfeit ? "Yes" : "No"}</li>
              <li><strong>Status:</strong> {result.suspected_counterfeit ? "Investigation Required" : "Accepted"}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProduct;
