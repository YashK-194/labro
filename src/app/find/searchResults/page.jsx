"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import searchServices from "../../components/search-services";
import ServiceDetails from "../../components/service-details";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import calculateDistance from "../../components/calculate-distance";
import dynamic from 'next/dynamic';

const SearchResults = () => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("query").trim() || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const router = useRouter();
  
  const handleServiceClick = (service) => setSelectedService(service);
  const handleCloseDetails = () => setSelectedService(null);

  const handleBackClick = () => {
    router.push("/find");
  };

  // Fetch user location from Firestore
  useEffect(() => {
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
  }, []);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm || !userLocation) return;
      setLoading(true);
      try {
        const services = await searchServices(searchTerm);
        // Filter services within 10 km
        const filteredServices = services.filter(service => {
          if (!service.location) return false;
          try {
            const distance = calculateDistance(userLocation, service.location);
            return distance <= 10; // Only include services within 10km
          } catch (error) {
            console.error("Error calculating distance:", error);
            return false;
          }
        });
        setResults(filteredServices);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
      setLoading(false);
    };

    fetchResults();
  }, [searchTerm, userLocation]);

  return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Search Results for "{searchTerm}"</h1>
        <button 
          onClick={handleBackClick} 
          className="px-4 py-2 bg-teal-500 text-white text-sm rounded-lg shadow hover:bg-teal-600 transition"
        >
        <b>⇐</b> Back
        </button>
        {loading ? (
          <p>Loading...</p>
        ) : results.length === 0 ? (
          <div className="flex items-center justify-center h-screen">
            <p className="text-center text-xl text-gray-500">No services found.<br/>(कोई सेवा उपलब्ध नहीं है।)</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
          {results.map((service) => {
            const uniqueKey = `${service.title}-${service.providerName}-${service.price.min}-${service.price.max}`;
            let distance = null;
            try {
              distance = calculateDistance(userLocation, service.location);
            } catch (error) {
              console.error("Error calculating distance for service:", service, error);
            }
            return (
              <div key={uniqueKey} className="relative p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors shadow-sm" onClick={(e) => {
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
                    <div className="text-right">
                      {distance !== null ? (
                        <span className="text-md font-bold text-blue-700">
                          {distance.toFixed(2)} km
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500"><i>Distance unavailable</i></span>
                      )}
                    </div>
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

const Page = () => {
  return (
      <Suspense>
          <SearchResults />
      </Suspense>
  )
}

export default Page
