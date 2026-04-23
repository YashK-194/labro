import React, { useState } from "react";
import { doc, setDoc, arrayUnion, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase/config";

const serviceOptions = [
  "Labor (मजदूर)",
  "Mistry (मिस्त्री)",
  "Plumber (प्लंबर)",
  "Electrician (इलेक्ट्रिशियन)",
  "Carpenter (बढ़ई)",
  "Painter (पेंटर)",
  "Maid (मेड/बाई)",
  "Halwai (हलवाई)",
  "Shifting (शिफ्टिंग)",
];

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

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.minPrice ||
      !formData.maxPrice
    ) {
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-3 sm:p-4 pb-20" onClick={onClose}>
        <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-lg border border-white/20 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-teal-600 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
              />
            </svg>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-teal-600">
            Add New Service
          </h2>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Share your skills with the community
          </p>
        </div>

        <form onSubmit={handleAddService} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-2 sm:gap-3 text-sm">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-4 sm:space-y-5">
            {/* Service Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                Select Service Type
              </label>
              <select
                value={formData.title}
                onChange={handleDropdownChange}
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all bg-white shadow-sm text-sm sm:text-base"
              >
                <option value="">Select a Service (सेवा का नाम चुनें)</option>
                {serviceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Service Input */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                Or Enter Custom Service
              </label>
              <input
                type="text"
                name="title"
                placeholder="Type your service title (या खुद सेवा का नाम लिखें)"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm text-sm sm:text-base"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                Service Description
              </label>
              <textarea
                name="description"
                placeholder="Describe your service in detail (सेवा के बारे में विस्तार से लिखें)"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm resize-none text-sm sm:text-base"
              />
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  name="minPrice"
                  placeholder="न्यूनतम मूल्य"
                  value={formData.minPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="अधिकतम मूल्य"
                  value={formData.maxPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 sm:py-3 bg-teal-600 text-white rounded-xl font-semibold
                hover:bg-teal-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg text-sm sm:text-base
                ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </span>
              ) : (
                "Add Service"
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
};

export default AddService;
