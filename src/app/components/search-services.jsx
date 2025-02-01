// import React, {Suspense } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

const searchServices = async (searchTerm, onServiceSelect) => {
  try {
    if (!searchTerm.trim()) return []; // Prevent empty searches

    const search = searchTerm.toLowerCase();
    const usersCollection = collection(db, "Users");
    const snapshot = await getDocs(usersCollection);
    const results = [];

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        const userData = doc.data();
        const userId = doc.id;

        if (userData.services) {
          userData.services.forEach((service) => {
            if (service.title.toLowerCase().includes(search)) {
              const serviceData = {
                ...service,
                userId,
                providerName: userData.name || "Unknown",
                providerPhone: userData.phone || "N/A",
                providerEmail: userData.email || "N/A",
              };
              serviceData.onClick = () => {
                if (onServiceSelect) {
                  onServiceSelect(serviceData);
                }
              };
              results.push(serviceData);
            }
          });
        }
      });
    }

    // Sort results by timestamp (most recent first)
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return results;
  } catch (error) {
    console.error("Error searching services:", error);
    throw error;
  }
};

export default searchServices;
