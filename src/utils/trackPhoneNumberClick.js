import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../lib/firebase/config";

// Function to track phone number clicks
const trackPhoneNumberClick = async (phoneNumber) => {
  try {
    // Reference to the metadata collection, with a fixed document for phone clicks
    const phoneClickDocRef = doc(db, "metadata", "phoneClicks");

    // Try to get the existing document
    const phoneClickDoc = await getDoc(phoneClickDocRef);

    if (phoneClickDoc.exists()) {
      // If document exists, update with new phone number and increment total clicks
      await updateDoc(phoneClickDocRef, {
        totalClicks: (phoneClickDoc.data().totalClicks || 0) + 1,
        clickedNumbers: arrayUnion(phoneNumber),
      });
    } else {
      // If document doesn't exist, create a new one with initial data
      await setDoc(phoneClickDocRef, {
        totalClicks: 1,
        clickedNumbers: [phoneNumber],
      });
    }
  } catch (error) {
    console.error("Error tracking phone number click:", error);
  }
};

export default trackPhoneNumberClick;
