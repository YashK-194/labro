'use client';
import React, { useState, useEffect } from "react";
import { signOut, deleteUser } from 'firebase/auth';
import { auth, db } from "../firebase/config";
import withAuth from "../firebase/withAuth";
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import Image from 'next/image';
import PfpPlaceholder from '../../icons/Pfp_placeholder.png';
import labroLogo from "../../icons/Labro_logo.png";

const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);

  const fetchUserDetails = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          console.log("User not found in Firestore.");
        }
      }
    });
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleDeleteProfile = async () => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const userDocRef = doc(db, "Users", userId);
    const servicesCollectionRef = collection(db, "Services");

    try {
      // Delete user's services
      const q = query(servicesCollectionRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (serviceDoc) => {
        await deleteDoc(doc(db, "Services", serviceDoc.id));
      });

      // Confirm deletion
      if (!window.confirm("Are you sure you want to delete your account?")) {
        return;
      }

      // Delete user document from Firestore
      await deleteDoc(userDocRef);

      // Delete user from Firebase Authentication
      await deleteUser(auth.currentUser);

      // Sign out the user and clear session
      await signOut(auth);
      sessionStorage.removeItem('user');

      alert("Your account has been deleted successfully.");
      window.location.href = "/"; // Redirect after deletion
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Failed to delete profile. Please try again.");
    }
  };

  return (
    <div className="p-4 min-h-screen flex flex-col items-center justify-center">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Image src={labroLogo} alt="Labro" width={90} height={70} style={{ width: 'auto', height: 'auto' }} />
      </div>
      <div className="flex items-center border p-4 rounded-lg shadow-md w-full max-w-md mb-6">
        <div className="w-20 h-20 rounded-full flex-shrink-0 mr-4">
          <Image src={PfpPlaceholder} alt="Profile" className="rounded-full" width={80} height={80} />
        </div>
        <div className="flex flex-col">
          <div className="text-2xl font-bold">{userDetails?.name}</div>
          <div>{userDetails?.email}</div>
          <div>{userDetails?.phone}</div>
        </div>
      </div>
      
      {/* Options */}
      <div className="w-full max-w-md">
        <button className="w-full text-left px-4 py-2 border rounded-md mb-2 hover:bg-gray-100">
          Edit Details
        </button>
        <button className="w-full text-left px-4 py-2 border rounded-md mb-2 hover:bg-gray-100">
          Settings
        </button>
        <button 
          onClick={async () => {
            await auth.signOut();
            sessionStorage.removeItem('user');
          }} 
          className="w-full text-left px-4 py-2 border rounded-md text-red-500 hover:bg-red-100">
          Logout
        </button>
        <button 
          onClick={handleDeleteProfile} 
          className="w-full text-left px-4 py-2 border rounded-md text-white bg-red-600 hover:bg-red-700">
          Delete Profile
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white mt-20">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
          © 2025 Labro. All rights reserved. <br />
            Developed and maintained by Yash Kumar. <br />
            Email: <a href="mailto:yashkm194@gmail.com" className="text-blue-500 hover:underline">yashkm194@gmail.com</a> <br />
            LinkedIn: <a href="https://www.linkedin.com/in/yashk194/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          linkedin.com/in/yashk194
                      </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default withAuth(Profile);
