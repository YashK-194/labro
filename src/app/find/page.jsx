'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import withAuth from "../firebase/withAuth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import searchServices from "../components/search-services"; // Import the search function
import LocationManager from "../components/locationManager";
import FeaturedServices from "../components/featured-services"; // Updated to fetch services properly
import calculateDistance from "../components/calculate-distance";
import ServiceDetails from "../components/service-details";



const Find = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  
  
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    };


    const getFeaturedServices = async () => {
      try {
        const services = await FeaturedServices();
        setFeaturedServices(services);
      } catch (error) {
        console.error("Error fetching featured services:", error);
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
    getFeaturedServices();
    fetchUserDetails();

  }, []);

  const handleServiceClick = (service) => setSelectedService(service);
  const handleCloseDetails = () => setSelectedService(null);



  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const results = await searchServices(searchTerm);
      console.log("Search Results:", results);
      
      // Navigate to searchResults page with query params
      router.push(`/find/searchResults?page=1&query=${encodeURIComponent(searchTerm)}`);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleQuickSearch = (service) => {
    router.push(`/find/searchResults?page=1&query=${encodeURIComponent(service)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      {user ? (
        <LocationManager userId={user.uid} />
      ) : (
        <div className="text-center text-gray-600">Please log in to access location features</div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          placeholder="Search for services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
        />
      </form>

      {/* Quick Search Section */}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Search</h2>
        <div className="grid grid-cols-3 gap-4">
          {["Plumber", "Carpenter", "Painter", "Labor", "Mistry", "Electrician"].map((service) => (
            <div
              key={service}
              onClick={() => handleQuickSearch(service)}
              className="p-4 text-center border border-gray-300 rounded-lg shadow cursor-pointer"
            >
              <span className="text-teal-600 font-medium">{service}</span>
            </div>
          ))}
        </div>
      </section>

    {/* Featured Services Section */}
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Featured Services</h2>
      {featuredServices.length === 0 ? (
        <p className="text-gray-500 text-center text-lg">No services found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {featuredServices.map((service) => {
            const distance = userLocation && service.location 
              ? calculateDistance(userLocation, service.location) 
              : null;
            return (
              <div key={service.id} className="relative p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors shadow-sm" onClick={(e) => {
                e.stopPropagation();
                handleServiceClick(service);
              }}>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">{service.title}</h2>
                </div>
                <p className="text-gray-600 mt-2 line-clamp-2">{service.description}</p>
                <div className="mt-2">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Provider: {service.providerName}</p>
                      <p className="text-sm text-gray-500">Phone: {service.providerPhone}</p>
                      <p className="text-sm text-gray-500">Email: {service.providerEmail}</p>
                    </div>
                    {distance !== null && (
                      <div className="text-right">
                        <span className="text-md font-bold text-blue-700">
                          {distance.toFixed(2)} km
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-teal-600 font-bold mb-2">
                    ₹{parseFloat(service.price.min).toFixed(2)} - ₹{parseFloat(service.price.max).toFixed(2)}
                  </p>
                  <span className="text-sm text-gray-500">{new Date(service.timestamp).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>

      {/* Display selected service details */}
      {selectedService && (
        <ServiceDetails
          key={selectedService.userId}
          userId={selectedService.userId}
          service={selectedService}
          onClose={handleCloseDetails}
        />
      )}

    </div>
  );
};

export default withAuth(Find);
