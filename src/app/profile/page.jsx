"use client";
import React, { useState, useEffect } from "react";
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase/config";
import withAuth from "../firebase/withAuth";
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import Image from "next/image";
import PfpPlaceholder from "../../icons/Pfp_placeholder.png";
import labroLogo from "../../icons/Labro_logo.png";

const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleDeleteProfile = async () => {
    if (!auth.currentUser || !password) return;

    setLoading(true);
    const userId = auth.currentUser.uid;
    const userDocRef = doc(db, "Users", userId);
    const servicesCollectionRef = collection(db, "Services");

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Confirm deletion
      if (!window.confirm("Are you sure you want to permanently delete your account?")) {
        setLoading(false);
        return;
      }

      // Delete user's services
      const q = query(servicesCollectionRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (serviceDoc) => {
        await deleteDoc(doc(db, "Services", serviceDoc.id));
      });

      // Delete user document from Firestore
      await deleteDoc(userDocRef);

      // Delete user from Firebase Authentication
      await deleteUser(auth.currentUser);

      // Sign out and redirect
      await signOut(auth);
      sessionStorage.removeItem("user");
      alert("Your account has been deleted successfully.");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert(error.message);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-teal-50">
      {/* Header */}
      <div className="flex justify-center">
        <Image src={labroLogo} alt="Labro" width={100} height={80} className="mb-6" />
      </div>

      {/* Profile Card */}
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md border border-gray-200">
        <div className="flex flex-col items-center">
          <Image src={PfpPlaceholder} alt="Profile" className="rounded-full border border-gray-300" width={90} height={90} />
          <div className="text-center mt-4">
            <h2 className="text-2xl font-bold text-gray-800">{userDetails?.name || "User"}</h2>
            <p className="text-gray-600">{userDetails?.email}</p>
            <p className="text-gray-600">{userDetails?.phone}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button 
            onClick={() => setShowLogoutModal(true)} 
            className="w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition">
            Logout
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)} 
            className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Delete Profile
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800">Confirm Logout</h2>
            <p className="text-sm text-gray-600 mt-2">Are you sure you want to log out?</p>

            <div className="flex justify-end mt-4 space-x-2">
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                Cancel
              </button>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 text-white rounded-lg bg-teal-600 hover:bg-teal-700 transition">
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800">Confirm Account Deletion</h2>
            <p className="text-sm text-gray-600 mt-2">Please enter your password to proceed.</p>
            
            <input 
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <div className="flex justify-end mt-4 space-x-2">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                Cancel
              </button>
              <button 
                onClick={handleDeleteProfile} 
                className={`px-4 py-2 text-white rounded-lg bg-red-600 hover:bg-red-700 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-10 text-center text-gray-500 text-sm">
        <p>© 2025 Labro. All rights reserved.</p>
        <p>Developed and maintained by Yash Kumar.</p>
        <p>
          Email: <a href="mailto:yashkm194@gmail.com" className="text-teal-500 hover:underline">yashkm194@gmail.com</a>
        </p>
        <p>
          LinkedIn: <a href="https://www.linkedin.com/in/yashk194/" target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:underline">
            linkedin.com/in/yashk194
          </a>
        </p>
      </footer>
    </div>
  );
};

export default withAuth(Profile);
