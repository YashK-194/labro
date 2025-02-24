"use client";
import React, { useState, useEffect } from "react";
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase/config";
import withAuth from "../firebase/withAuth";
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import Image from "next/image";
import PfpPlaceholder from "../../icons/Pfp_placeholder.png";
import yashKumarImg from "../../icons/Yash_kumar.jpg";
import akanshKumarImg from "../../icons/Akansh_kumar.jpg"; 
import labroLogo from "../../icons/Labro_logo.png";

const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
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
            <p className="text-gray-600">+91 {userDetails?.phone}</p>
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
          <button 
            onClick={() => setShowAboutModal(true)} 
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            About Us
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

      {/* About Us Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800">About Us</h2>
            <p className="text-sm text-gray-600 mt-2">We are trying to solving a problem. A lot of daily wage workers dont get work when they need it, and on the other end of the spectrum a lot of people dont find these workers when they need them. We are on a mission to offer them a platform to connect with each other without a middleman, at the fair price.</p>
            <div className="flex flex-col space-y-4 mt-4">
              {/* Person 1 */}
              <div className="flex items-center space-x-4">
                <Image src={yashKumarImg} alt="Yash Kumar" width={150} height={150} className="rounded-full border border-gray-300" />
                <div>
                  <h3 className="text-xl font-bold text-teal-700 italic">Yash Kumar</h3>
                  <p className="text-lg text-gray-600 mt-1">LinkedIn: <br/><a href="https://www.linkedin.com/in/yashk194/" className="text-sm text-blue-500 hover:underline">linkedin.com/in/yashk194/</a></p>
                </div>
              </div>
              {/* Person 2 */}
              <div className="flex items-center space-x-4">
                <Image src={akanshKumarImg} alt="Akansh Kumar" width={150} height={150} className="rounded-full border border-gray-300" />
                <div>
                  <h3 className="text-xl font-bold text-teal-700 italic">Akansh Kumar</h3>
                  <p className="text-lg text-gray-600 mt-1">LinkedIn: <br/><a href="https://www.linkedin.com/in/akanshkumar/" className="text-sm text-blue-500 hover:underline">linkedin.com/in/akanshkumar/</a></p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setShowAboutModal(false)} 
                className="w-full py-3 bg-teal-700 text-white rounded-md hover:bg-teal-800">
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Socials */}
      <div className="mt-8 mb-6 text-center">
        <h3 className="text-gray-700 font-semibold mb-4">Find Us On Socials</h3>
        <div className="flex justify-center space-x-6">
          {/* Instagram */}
          <a 
            href="https://instagram.com/labro.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-pink-600 hover:text-pink-700 transition-colors"
            aria-label="Follow us on Instagram"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>

          {/* Twitter */}
          <a 
            href="https://x.com/labroapp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 transition-colors"
            aria-label="Follow us on Twitter"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
            </svg>
          </a>

          {/* Facebook */}
          <a 
            href="https://www.facebook.com/profile.php?id=61572705791291" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 transition-colors"
            aria-label="Follow us on Facebook"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
        </div>
      </div>



      {/* Footer */}
      <footer className="mt-10 text-center text-gray-500 text-sm">
        <p>© 2025 Labro. All rights reserved.</p>
        <p>Developed and maintained by Yash Kumar.</p>
      </footer>
    </div>
  );
};

export default withAuth(Profile);
