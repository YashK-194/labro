import React, { useState } from "react";
import { doc, setDoc, arrayUnion, updateDoc,getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const serviceOptions = ["Labor (मजदूर)", "Mistry (मिस्त्री)", "Plumber (प्लंबर)", "Electrician (इलेक्ट्रिशियन)", "Carpenter (बढ़ई)", "Painter (पेंटर)","Maid (मेड/बाई)", "Halwai (हलवाई)", "Shifting (शिफ्टिंग)"];

const AddService = ({ userId, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    minPrice: "",
    maxPrice: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDropdownChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      title: e.target.value,
    }));
  };

  const handleAddService = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.minPrice || !formData.maxPrice) {
      setError("All fields are required");
      return;
    }

    if (!userId) {
      setError("User ID is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user's location from "Users" collection
      const userRef = doc(db, "Users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error("User document does not exist");
      }

      const userData = userDoc.data();
      const userLocation = userData.location || "Unknown";

      // Generate unique service ID
      const serviceId = crypto.randomUUID();
      const serviceRef = doc(db, "Services", serviceId);

      const serviceData = {
        // serviceId: serviceId,
        userId,
        title: formData.title.toLowerCase(),
        description: formData.description,
        price: {
          min: parseFloat(formData.minPrice).toFixed(2),
          max: parseFloat(formData.maxPrice).toFixed(2),
        },
        timestamp: new Date().toISOString(),
        location: userLocation, // Add location field
      };

      await setDoc(serviceRef, serviceData);
      await updateDoc(userRef, {
        services: arrayUnion(serviceId),
      });

      onAdd(serviceData);
      onClose();
    } catch (err) {
      console.error("Failed to add service:", err);
      setError("Failed to add service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50 w-[400px]">
        <form onSubmit={handleAddService}>
          {error && (
            <div className="p-3 bg-red-100 border border-red-500 rounded-md mb-4 text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <select
              value={formData.title}
              onChange={handleDropdownChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a Service (सेवा का नाम चुनें)</option>
              {serviceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="title"
              placeholder="Or type your service title (या खुद सेवा का नाम लिखें)"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />

            <textarea
              name="description"
              placeholder="Description (सेवा के बारे में लिखें)"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border rounded-md"
            />

            <input
              type="number"
              name="minPrice"
              placeholder="Minimum Price (न्यूनतम मूल्य)"
              value={formData.minPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full p-2 border rounded-md"
            />

            <input
              type="number"
              name="maxPrice"
              placeholder="Maximum Price (अधिकतम मूल्य)"
              value={formData.maxPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-teal-600 text-white rounded-md ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-teal-700"
              }`}
            >
              {loading ? "Adding Service..." : "Add Service"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-teal-700 text-white rounded-md hover:bg-teal-800"
            >
              Close
            </button>
          </div>
        </form>
      </div>

      <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 z-40" />
    </>
  );
};

export default AddService;



