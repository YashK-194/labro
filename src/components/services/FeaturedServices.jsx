import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase/config";

const FeaturedServices = async () => {
  try {
    const servicesCollection = collection(db, "Services");
    const servicesSnapshot = await getDocs(servicesCollection);
    const results = [];

    if (!servicesSnapshot.empty) {
      for (const serviceDoc of servicesSnapshot.docs) {
        const serviceData = serviceDoc.data();
        const userId = serviceData.userId;

        // Fetch user details using userId
        const userRef = doc(db, "Users", userId);
        const userSnap = await getDoc(userRef);
        let providerDetails = {
          providerName: "Unknown",
          providerPhone: "N/A",
          providerEmail: "N/A",
          location: null,
        };

        if (userSnap.exists()) {
          const userData = userSnap.data();
          providerDetails = {
            providerName: userData.name || "Unknown",
            providerPhone: userData.phone || "N/A",
            providerEmail: userData.email || "N/A",
            location: userData.location || null,
          };
        }

        results.push({
          ...serviceData,
          ...providerDetails,
          price: serviceData.price || { min: "0", max: "0" },
        });

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
