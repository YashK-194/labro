import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import calculateDistance from "../components/calculate-distance";
import Image from 'next/image';
import PfpPlaceholder from '../../icons/Pfp_placeholder.png'; 


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

  

  // Helper function to format location
  const formatLocation = (location) => {
    if (!location) return "Not provided";
    if (typeof location === 'string') return location;
    if (location.address) return location.address;
    if (location.latitude && location.longitude) {
      return `${location.latitude}, ${location.longitude}`;
    }
    return "Not provided";
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-lg w-[400px]">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-lg w-[400px]">
          <p className="text-red-500 text-center">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md w-full 
              hover:bg-teal-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const distance =
    userLocation && service.location
      ? calculateDistance(userLocation, service.location) // Assume service.location is { latitude, longitude }
      : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-h-[90vh] flex flex-col">

        {/* Profile Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
          <Image
              src={PfpPlaceholder}
              alt="Profile"
              className="rounded-full"
              width={80}
              height={80}
            />,
            <div>
              <h3 className="text-lg font-semibold">{lister?.name}</h3>
              <p className="text-gray-500 text-m ">
                {lister?.phone && <p className="text-gray-500 text-sm">+91 {lister.phone}</p>}
              </p>
            </div>
          </div>
          {/* Display distance with better visibility */}
          {distance !== null && (
            <p className="text-md font-bold text-blue-700 mt-2">
              {distance.toFixed(2)} km away
            </p>
          )}
        </div>

        {/* Service Details */}
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold mb-2">{service.title}</h2>
          <p className="mb-3 text-gray-700">{service.description}</p>
          <p className="text-teal-600 font-bold mb-2">
            ₹{parseFloat(service.price.min).toFixed(2)} - ₹{parseFloat(service.price.max).toFixed(2)}
          </p>
          <p className="text-gray-500 text-sm mb-2">
            <b>Location:  </b>
            <a href={`https://www.google.com/maps/search/?api=1&query=${service.location.latitude},${service.location.longitude}`} className="hover:text-gray-700">
              (View in Google Maps)<br/>
              {formatLocation(service.location)}
           </a>
          </p>
          <p className="text-gray-500 text-sm mb-4">
            <b>Listed on: </b>{new Date(service.timestamp).toLocaleDateString('en-GB')}
          </p>

          {/* Tabs */}
          <div className="mt-4">
            <div className="flex border-b">
              {["photos", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-center capitalize
                    ${activeTab === tab 
                      ? "border-b-2 border-teal-600 font-semibold text-teal-600" 
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-4 text-center text-gray-500 italic">
              Feature coming soon
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md w-full 
            hover:bg-teal-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ServiceDetails;