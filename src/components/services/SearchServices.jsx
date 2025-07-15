import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase/config";

const searchServices = async (searchTerm, onServiceSelect) => {
  try {
    if (!searchTerm.trim()) return []; // Prevent empty searches

    const search = searchTerm.toLowerCase();
    const servicesCollection = collection(db, "Services");
    const snapshot = await getDocs(servicesCollection);
    const results = [];

    if (!snapshot.empty) {
      for (const serviceDoc of snapshot.docs) {
        const service = serviceDoc.data();
        const userId = service.userId;

        if (service.title.toLowerCase().includes(search)) {
          let providerDetails = {
            name: "Unknown",
            phone: "N/A",
            email: "N/A",
            location: null,
          };

          if (userId) {
            const userRef = doc(db, "Users", userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              providerDetails = {
                name: userData.name || "Unknown",
                phone: userData.phone || "N/A",
                email: userData.email || "N/A",
                location: userData.location || null,
              };
            }
          }

          const serviceData = {
            ...service,
            userId,
            providerName: providerDetails.name,
            providerPhone: providerDetails.phone,
            providerEmail: providerDetails.email,
            providerLocation: providerDetails.location,
          };

          serviceData.onClick = () => {
            if (onServiceSelect) {
              onServiceSelect(serviceData);
            }
          };

          results.push(serviceData);
        }
      }
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
