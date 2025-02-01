
'use client';
import React, { useState, useEffect } from "react";
import withAuth from "../firebase/withAuth";
import AddService from "../components/add-service";
import ServiceDetails from "../components/service-details";
import { auth, db } from "../firebase/config";
import { doc, getDoc,updateDoc,onSnapshot } from "firebase/firestore";

const List = () => {
  const [services, setServices] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserDetails(user);
        subscribeToServices(user.uid);
      } else {
        setServices([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const subscribeToServices = (userId) => {
    const userRef = doc(db, "Users", userId);
    
    return onSnapshot(userRef, 
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const servicesData = userData.services || [];
          setServices(servicesData);
        } else {
          setServices([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching services:", err);
        setError("Failed to load services");
        setLoading(false);
      }
    );
  };

  const handleAddServiceClick = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);
  const handleServiceClick = (service) => setSelectedService(service);
  const handleCloseDetails = () => setSelectedService(null);
  const toggleMenu = (id) => setMenuOpen(menuOpen === id ? null : id);  

  const handleDeleteService = async (serviceId) => {
    if (!userDetails) return;
    try {
      const userRef = doc(db, "Users", userDetails.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedServices = userData.services.filter(service => service.id !== serviceId);
        await updateDoc(userRef, { services: updatedServices });
        setServices(updatedServices);
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Listed Services</h1>
        <button
          onClick={handleAddServiceClick}
          className="flex items-center px-3 py-2 bg-teal-600 text-white rounded-md 
            hover:bg-teal-700 transition-colors"
        >
          <span className="mr-2">+</span> Add Service
        </button>
      </div>

      {services.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="relative p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
              onClick={(e) => { e.stopPropagation(); handleServiceClick(service); }}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">{service.title}</h2>
                <button onClick={(e) => { e.stopPropagation(); toggleMenu(service.id); }} className="text-gray-600 hover:text-gray-900">
                  &#8226;&#8226;&#8226;
                </button>
              </div>
              <p className="text-gray-600 mt-2 line-clamp-2">{service.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-teal-600 font-bold mb-2">
                  ₹{parseFloat(service.price.min).toFixed(2)} - ₹{parseFloat(service.price.max).toFixed(2)}
                </p>
                <span className="text-sm text-gray-500">{new Date(service.timestamp).toLocaleDateString('en-GB')}</span>
              </div>
              {menuOpen === service.id && (
                <div className="absolute right-4 top-10 bg-white shadow-lg rounded-md border w-24 z-10">
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600" onClick={() => handleDeleteService(service.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-grow justify-center items-center">
          <p className="text-gray-500 text-center text-lg">
            No services listed yet. Add a service to get started!
          </p>
        </div>
      )}


      {showPopup && userDetails && (
        <AddService
          userId={userDetails.uid}
          onClose={handleClosePopup}
          onAdd={(newService) => {
            handleClosePopup();
          }}
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