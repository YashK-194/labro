import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase/config";
import calculateDistance from "../../utils/calculateDistance";
import Image from "next/image";
import PfpPlaceholder from "../../assets/icons/Pfp_placeholder.png";
import trackPhoneNumberClick from "../../utils/trackPhoneNumberClick";

const ServiceDetails = ({ userId, service, onClose }) => {
  const [lister, setLister] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("photos");
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchListerDetails = async () => {
      try {
        const userDocRef = doc(db, "Users", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setLister({
            name: userData.name || "Unknown User",
            profilePhoto: "image_not_available.jpg",
            phone: userData.phone || "Not provided",
          });
        } else {
          setError("User not found.");
        }
      } catch (err) {
        console.error("Error fetching lister details:", err);
        setError("Failed to fetch lister details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserLocation = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.location) {
              setUserLocation(userData.location); // Assume location is { latitude, longitude }
            }
          }
        } else {
          console.log("User is not logged in");
        }
      });
    };

    fetchUserLocation();
    fetchListerDetails();
  }, [userId]);

  // Handler for phone number click
  const handlePhoneNumberClick = (phoneNumber) => {
    // Remove any non-digit characters and the country code
    const cleanedNumber = phoneNumber.replace(/\D/g, "").replace(/^91/, "");
    trackPhoneNumberClick(cleanedNumber);
  };

  // Helper function to format location
  const formatLocation = (location) => {
    if (!location) return "Not provided";
    if (typeof location === "string") return location;
    if (location.address) return location.address;
    if (location.latitude && location.longitude) {
      return `${location.latitude}, ${location.longitude}`;
    }
    return "Not provided";
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 pb-20">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700">Loading service details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 pb-20">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01M9 12a3 3 0 006 0m-6 0a3 3 0 006 0m6 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded font-semibold hover:bg-teal-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const distance =
    userLocation && service.location
      ? calculateDistance(userLocation, service.location) // Assume service.location is { latitude, longitude }
      : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-3 sm:p-4 pb-20">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header with close button */}
        <div className="relative bg-teal-600 text-white p-4 sm:p-6">
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Profile Section */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <Image
                src={PfpPlaceholder}
                alt="Profile"
                className="rounded-full border-2 border-white"
                width={48}
                height={48}
                priority
              />
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold">{lister?.name}</h3>
                {lister?.phone && (
                  <a
                    href={`tel:+91${lister.phone}`}
                    className="inline-flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg mt-2 text-white hover:bg-white/30 transition-colors text-base sm:text-lg font-bold"
                    onClick={() => handlePhoneNumberClick(lister.phone)}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    +91 {lister.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Distance */}
            {distance !== null && (
              <div className="text-center mt-3 sm:mt-0 sm:text-right">
                <div className="bg-white/20 rounded-lg px-3 py-2">
                  <p className="text-xs sm:text-sm text-white/80">Distance</p>
                  <p className="text-base sm:text-lg font-bold text-white">
                    {distance.toFixed(1)} km
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Service Details */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Service Title and Description */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 capitalize">
                {service.title}
              </h2>
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {service.description}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <h3 className="font-semibold text-gray-700 text-sm sm:text-base">
                  Price Range
                </h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                ₹{parseFloat(service.price.min).toFixed(0)} - ₹
                {parseFloat(service.price.max).toFixed(0)}
              </p>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 className="font-semibold text-gray-700 text-sm sm:text-base">
                  Location
                </h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm sm:text-base">
                  {formatLocation(service.location)}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${service.location.latitude},${service.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors text-sm underline"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  View in Google Maps
                </a>
              </div>
            </div>

            {/* Listed Date */}
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="font-semibold text-gray-700 text-sm sm:text-base">
                  Listed on
                </h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                {new Date(service.timestamp).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-white border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
