"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import searchServices from "../../../components/services/SearchServices";
import ServiceDetails from "../../../components/services/ServiceDetails";
import { auth, db } from "../../../lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import calculateDistance from "../../../utils/calculateDistance";
import dynamic from "next/dynamic";

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
        const filteredServices = services.filter((service) => {
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
    <div className="min-h-screen bg-white px-2 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={handleBackClick}
            className="group flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm text-emerald-700 rounded-xl shadow-lg border border-white/20 hover:bg-white hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-teal-600">
              Search Results
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Found services for "
              <span className="font-semibold text-emerald-700">
                {searchTerm}
              </span>
              "
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
              <p className="text-base sm:text-lg font-semibold text-gray-700">
                Searching for services...
              </p>
              <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
                Please wait while we find the best matches
              </p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <div className="text-center max-w-md px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                No Services Found
              </h3>
              <p className="text-gray-600 mb-1 sm:mb-2 text-sm sm:text-base">
                We couldn't find any services matching "{searchTerm}" in your
                area.
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">
                (आपके पास कोई सेवा उपलब्ध नहीं है।)
              </p>
              <button
                onClick={handleBackClick}
                className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg text-sm sm:text-base"
              >
                Try Another Search
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {results.map((service) => {
              const uniqueKey = `${service.title}-${service.providerName}-${service.price.min}-${service.price.max}`;
              let distance = null;
              try {
                distance = calculateDistance(userLocation, service.location);
              } catch (error) {
                console.error(
                  "Error calculating distance for service:",
                  service,
                  error
                );
              }

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
    </div>
  );
};

const Page = () => {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
};

export default Page;
