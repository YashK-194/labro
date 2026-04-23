"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import withAuth from "../../lib/firebase/withAuth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase/config";
import searchServices from "../../components/services/SearchServices"; // Import the search function
import LocationManager from "../../components/location/LocationManager";
import FeaturedServices from "../../components/services/FeaturedServices"; // Updated to fetch services properly
import calculateDistance from "../../utils/calculateDistance";
import ServiceDetails from "../../components/services/ServiceDetails";

import CarpenterIcon from "../../assets/icons/quick_search/Carpenter.png";
import MistryIcon from "../../assets/icons/quick_search/Mistry.png";
import PlumberIcon from "../../assets/icons/quick_search/Plumber.png";
import ElectricianIcon from "../../assets/icons/quick_search/Electrician.png";
import LaborIcon from "../../assets/icons/quick_search/Labor.png";
import PainterIcon from "../../assets/icons/quick_search/Painter.png";

const Find = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const router = useRouter();

  const getFeaturedServices = async () => {
    try {
      const services = await FeaturedServices();

      if (userLocation) {
        const filteredServices = services.filter((service) => {
          if (service.location) {
            const distance = calculateDistance(userLocation, service.location);
            return distance <= 10; // Filter services within 10 km
          }
          return false;
        });

        setFeaturedServices(filteredServices);
      } else {
        setFeaturedServices(services); // Fallback if user location is unavailable
      }
    } catch (error) {
      console.error("Error fetching featured services:", error);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    };

    const fetchUserLocation = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.location) {
              setUserLocation(userData.location);
            }
          }
        } else {
          console.log("User is not logged in");
        }
      });
    };

    fetchUserLocation();
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (userLocation) {
      getFeaturedServices();
    }
  }, [userLocation]);

  const handleServiceClick = (service) => setSelectedService(service);
  const handleCloseDetails = () => setSelectedService(null);

  const handleLocationUpdate = (locationData) => {
    // Do anything you need with the locationData
    console.log("Location updated:", locationData);
    // Refresh the page
    window.location.reload();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const results = await searchServices(searchTerm);
      console.log("Search Results:", results);

      // Navigate to searchResults page with query params
      router.push(
        `/find/searchResults?page=1&query=${encodeURIComponent(searchTerm)}`
      );
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleQuickSearch = (service) => {
    router.push(
      `/find/searchResults?page=1&query=${encodeURIComponent(service)}`
    );
  };

  return (
    <div className="min-h-screen bg-white px-2 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-24">
      {user ? (
        <LocationManager
          userId={user.uid}
          onLocationUpdate={handleLocationUpdate}
        />
      ) : (
        <div className="text-center text-gray-600 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-sm sm:text-base">
          Please log in to access location features
        </div>
      )}

      {/* Enhanced Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 sm:mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for services... (सेवाएँ खोजें...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 sm:p-4 pl-10 sm:pl-12 pr-3 sm:pr-4 border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm text-sm sm:text-base"
          />
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </form>

      {/* Enhanced Quick Search Section */}
      <section className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Quick Search{" "}
            <span className="text-base sm:text-lg text-gray-600">
              (अभी ढूंढें)
            </span>
          </h2>
          <button
            className="px-3 sm:px-4 py-1 sm:py-2 text-teal-600 hover:text-teal-700 font-medium rounded-lg hover:bg-teal-50 transition-all duration-200 text-sm sm:text-base"
            onClick={() => router.push("/find/allServices")}
          >
            See all →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { name: "Labor", icon: LaborIcon },
            { name: "Mistry", icon: MistryIcon },
            { name: "Plumber", icon: PlumberIcon },
            { name: "Carpenter", icon: CarpenterIcon },
            { name: "Painter", icon: PainterIcon },
            { name: "Electrician", icon: ElectricianIcon },
          ].map(({ name, icon }) => (
            <div
              key={name}
              onClick={() => handleQuickSearch(name)}
              className="group p-2 sm:p-4 text-center bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:bg-teal-50"
            >
              <img
                src={icon.src}
                alt={name}
                className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-gray-700 font-medium group-hover:text-teal-600 transition-colors duration-300 text-xs sm:text-base">
                {name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Featured Services Section */}
      <section className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Featured Services{" "}
          <span className="text-base sm:text-lg text-gray-600">
            (प्रमुख सेवाएँ)
          </span>
        </h2>
        {featuredServices.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200">
            <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">
              🔍
            </div>
            <p className="text-gray-500 text-base sm:text-lg font-medium">
              No services found near you.
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
              (आपके पास कोई सेवा उपलब्ध नहीं है।)
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {featuredServices.map((service) => {
              const uniqueKey = `${service.title}-${service.providerName}-${service.price.min}-${service.price.max}`;
              const distance =
                userLocation && service.location
                  ? calculateDistance(userLocation, service.location)
                  : null;

              return (
                <div
                  key={uniqueKey}
                  className="group relative p-4 sm:p-6 bg-white border border-gray-200 rounded-xl sm:rounded-2xl cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleServiceClick(service);
                  }}
                >
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors duration-300 capitalize">
                      {service.title}
                    </h3>
                    {distance !== null && (
                      <div className="bg-teal-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-sm sm:text-base font-medium">
                        {distance.toFixed(2)} km
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed text-sm sm:text-base">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4 text-sm sm:text-base">
                    <div>
                      <p className="text-gray-500 mb-1">
                        <span className="font-medium">Provider:</span>{" "}
                        {service.providerName}
                      </p>
                      <p className="text-gray-500 mb-1">
                        <span className="font-medium">Phone:</span>{" "}
                        {service.providerPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">
                        <span className="font-medium">Email:</span>{" "}
                        {service.providerEmail}
                      </p>
                      <p className="text-gray-500">
                        <span className="font-medium">Listed:</span>{" "}
                        {new Date(service.timestamp).toLocaleDateString(
                          "en-GB"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="bg-teal-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base">
                      ₹{parseFloat(service.price.min).toFixed(2)} - ₹
                      {parseFloat(service.price.max).toFixed(2)}
                    </div>
                    <div className="text-teal-600 group-hover:text-teal-700 font-medium text-sm sm:text-base">
                      View Details →
                    </div>
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
