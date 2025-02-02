'use client';

import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useRouter } from "next/navigation";

const LocationManager = ({ userId, onLocationUpdate }) => {
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualAddress, setManualAddress] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    setShowManualInput(false);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      setShowManualInput(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log("Getting current position...");
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );

          const data = await response.json();
          console.log("Location data received:", data);

          const locationData = {
            latitude,
            longitude,
            address: data.display_name,
            timestamp: new Date().toISOString(),
          };

          console.log("Updating user location...");
          await updateUserLocation(userId, locationData);
          console.log("Location updated successfully");

          setLocation(locationData);
          onLocationUpdate(locationData);
          setLoading(false);
          setShowPopup(false);
          
          // Use Next.js router to refresh
          console.log("Refreshing page...");
          router.refresh();

        } catch (err) {
          console.error("Error in getCurrentLocation:", err);
          setError("Failed to fetch location details");
          setLoading(false);
          setShowManualInput(true);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(`Error getting location: ${err.message}`);
        setLoading(false);
        setShowManualInput(true);
      },
    );
  };

  const updateUserLocation = async (uid, locationData) => {
    try {
      const userRef = doc(db, "Users", uid);
      await updateDoc(userRef, { location: locationData });
    } catch (err) {
      console.error("Error updating location in database:", err);
      throw new Error("Failed to update location in database");
    }
  };

  const handleManualAddressUpdate = async () => {
    if (!manualAddress.trim()) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching address data...");
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          manualAddress
        )}`
      );
      const data = await response.json();
      console.log("Address data received:", data);

      if (data && data[0]) {
        const locationData = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          address: data[0].display_name,
          timestamp: new Date().toISOString(),
        };

        console.log("Updating user location...");
        await updateUserLocation(userId, locationData);
        console.log("Location updated successfully");

        setLocation(locationData);
        onLocationUpdate(locationData);
        setShowPopup(false);
        
        // Use Next.js router to refresh
        console.log("Refreshing page...");
        router.refresh();
        
      } else {
        setError("Address not found");
      }
    } catch (err) {
      console.error("Error in handleManualAddressUpdate:", err);
      setError("Failed to update location");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedLocation = async () => {
    try {
      const userRef = doc(db, "Users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().location) {
        setLocation(userDoc.data().location);
      } else {
        setLocation(null);
      }
    } catch (err) {
      console.error("Error loading saved location:", err);
    }
  };

  useEffect(() => {
    loadSavedLocation();
  }, [userId]);

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "8px" }}>
      {error && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#fee2e2",
            border: "1px solid #ef4444",
            borderRadius: "4px",
            marginBottom: "16px",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      {location ? (
        <div
          onClick={() => setShowPopup(true)}
          style={{
            padding: "12px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            marginBottom: "16px",
            color: "#008080",
            cursor: "pointer",
            backgroundColor: "#f0fdfa",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>📍</span>
            <span>{location.address}</span>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "12px",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            marginBottom: "16px",
            color: "#991b1b",
            backgroundColor: "#fee2e2",
            textAlign: "center",
          }}
          onClick={() => setShowPopup(true)}
        >
          No location available. Click to update your location.
        </div>
      )}

      {showPopup && (
        <>
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
              width: "400px",
            }}
          >
            <p className="text-gray-500 text-center text-lg">
              Click "Detect Location" first. If it fails, enter manually.
            </p>

            <button
              onClick={getCurrentLocation}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "white",
                color: "#008080",
                border: "1px solid #008080",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginBottom: "16px",
              }}
            >
              {loading ? "Detecting..." : "Detect Location"}
            </button>

            {showManualInput && (
              <>
                <input
                  type="text"
                  placeholder="Enter address manually"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                    marginBottom: "16px",
                  }}
                />

                <button
                  onClick={handleManualAddressUpdate}
                  disabled={loading || !manualAddress.trim()}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#008080",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                      loading || !manualAddress.trim() ? "not-allowed" : "pointer",
                    opacity: loading || !manualAddress.trim() ? 0.7 : 1,
                    marginBottom: "16px",
                  }}
                >
                  {loading ? "Updating..." : "Enter Manually"}
                </button>
              </>
            )}

            <button
              onClick={() => setShowPopup(false)}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#006767",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>

          <div
            onClick={() => setShowPopup(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
            }}
          />
        </>
      )}
    </div>
  );
};

export default LocationManager;