import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";


const FeaturedServices = async () => {
    
  try {
    const usersCollection = collection(db, "Users");
    const snapshot = await getDocs(usersCollection);
    const results = [];

    if (!snapshot.empty) {
      for (const doc of snapshot.docs) {
        const userData = doc.data();
        const userId = doc.id;

        if (userData.services) {
          userData.services.forEach((service) => {
            results.push({
              ...service,
              userId,
              providerName: userData.name || "Unknown",
              providerPhone: userData.phone || "N/A",
              providerEmail: userData.email || "N/A",
              location: userData.location || null, // Include location if available
              price: service.price || { min: "0", max: "0" }, // Ensure price is structured
            });
          });
        }

        if (results.length >= 6) break; // Stop once 6 services are fetched
      }
    }

    return results.slice(0, 6); // Ensure only 6 services are returned
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

export default FeaturedServices;
