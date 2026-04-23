"use client";
import React, { useState, useEffect } from "react";
import withAuth from "../../lib/firebase/withAuth";
import AddService from "../../components/services/AddService";
import ServiceDetails from "../../components/services/ServiceDetails";
import { auth, db } from "../../lib/firebase/config";
import {
  collection,
  query,
  where,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

const List = () => {
  const [services, setServices] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [showLocationWarning, setShowLocationWarning] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserDetails(user);
        subscribeToUserServices(user.uid);
      } else {
        setServices([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const subscribeToUserServices = (userId) => {
    const servicesRef = collection(db, "Services");
    const q = query(servicesRef, where("userId", "==", userId));

    return onSnapshot(
      q,
      (querySnapshot) => {
        const userServices = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(userServices);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching services:", err);
        setError("Failed to load services");
        setLoading(false);
      }
    );
  };

  const handleAddServiceClick = async () => {
    if (!userDetails) return;
    try {
      const userRef = doc(db, "Users", userDetails.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().location) {
        setShowPopup(true);
      } else {
        setShowLocationWarning(true);
      }
    } catch (err) {
      console.error("Error checking location:", err);
      setShowLocationWarning(true);
    }
  };

  const handleClosePopup = () => setShowPopup(false);
  const handleServiceClick = (service) => setSelectedService(service);
  const handleCloseDetails = () => setSelectedService(null);
  const toggleMenu = (id) => setMenuOpen(menuOpen === id ? null : id);

  const handleDeleteService = async (serviceId) => {
    try {
      // Fetch the service document to get the userId
      const serviceRef = doc(db, "Services", serviceId);
      const serviceSnap = await getDoc(serviceRef);

      if (serviceSnap.exists()) {
        const serviceData = serviceSnap.data();
        const userId = serviceData.userId;

        // Delete the service document
        await deleteDoc(serviceRef);

        // Update the user's services array
        if (userId) {
          const userRef = doc(db, "Users", userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const updatedServices =
              userData.services?.filter((id) => id !== serviceId) || [];

            await updateDoc(userRef, { services: updatedServices });
          }
        }

        // Update local state
        setServices((prev) =>
          prev.filter((service) => service.id !== serviceId)
        );
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-teal-600 font-medium">
            Loading your services...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8 bg-white backdrop-blur-sm rounded-2xl shadow-xl border border-red-200">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <div className="text-xl text-red-600 font-semibold">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-white pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Your Services
          </h1>
          <p className="text-gray-600">(आपकी दर्ज सेवाएँ)</p>
        </div>
        <button
          onClick={handleAddServiceClick}
          className="group flex flex-col items-center px-6 py-3 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center">
            <span className="mr-2 text-xl group-hover:scale-110 transition-transform duration-300">
              +
            </span>
            <span className="font-semibold">Add Service</span>
          </div>
          <span className="text-xs opacity-90">(सेवा दर्ज करें)</span>
        </button>
      </div>

      {showLocationWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4 border border-yellow-200">
            <div className="text-yellow-500 text-6xl mb-4">📍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Location Required
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Please update your location before adding a service.
              <br />
              <span className="text-sm text-gray-500">
                (कृपया सेवा दर्ज करने से पहले अपनी लोकेशन अपडेट करें।)
              </span>
            </p>
            <button
              onClick={() => setShowLocationWarning(false)}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-300 font-semibold"
            >
              Understand
            </button>
          </div>
        </div>
      )}

      {services.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative p-6 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation();
                handleServiceClick(service);
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors duration-300 capitalize">
                  {service.title}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(service.id);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                {service.description}
              </p>

              <div className="flex justify-between items-center">
                <div className="bg-teal-600 text-white px-4 py-2 rounded-xl font-bold text-sm">
                  ₹{parseFloat(service.price.min).toFixed(2)} - ₹
                  {parseFloat(service.price.max).toFixed(2)}
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {new Date(service.timestamp).toLocaleDateString("en-GB")}
                </span>
              </div>

              {menuOpen === service.id && (
                <div className="absolute right-4 top-16 bg-white/90 backdrop-blur-lg shadow-2xl rounded-xl border border-gray-200 w-32 z-20 overflow-hidden">
                  <button
                    className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 font-medium transition-colors duration-200 flex items-center"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              )}

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-teal-600 text-sm font-medium">
                  View Details →
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-grow justify-center items-center min-h-96">
          <div className="text-center p-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 max-w-md">
            <div className="text-gray-400 text-8xl mb-6">📋</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              No Services Yet
            </h3>
            <p className="text-gray-500 leading-relaxed mb-6">
              Add your first service to start connecting with customers in your
              area.
            </p>
            <p className="text-gray-400 text-sm">
              (अभी तक कोई सेवा जोड़ी नहीं गई है। शुरुआत करने के लिए सेवा दर्ज
              करें!)
            </p>
            <button
              onClick={handleAddServiceClick}
              className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-300 font-semibold transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Add Your First Service
            </button>
          </div>
        </div>
      )}

      {showPopup && userDetails && (
        <AddService
          userId={userDetails.uid}
          onClose={handleClosePopup}
          onAdd={() => handleClosePopup()}
        />
      )}

      {selectedService && (
        <ServiceDetails
          userId={userDetails?.uid}
          service={selectedService}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default withAuth(List);
