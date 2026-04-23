"use client";
import React, { useState, useEffect } from "react";
import {
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase/config";
import withAuth from "../../lib/firebase/withAuth";
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Image from "next/image";
import PfpPlaceholder from "../../assets/icons/Pfp_placeholder.png";
import yashKumarImg from "../../assets/icons/Yash_kumar.jpg";
import akanshKumarImg from "../../assets/icons/Akansh_kumar.jpg";
import labroLogo from "../../assets/icons/Labro_logo.png";

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
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Confirm deletion
      if (
        !window.confirm(
          "Are you sure you want to permanently delete your account?"
        )
      ) {
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
    <div className="min-h-screen bg-white py-4 sm:py-8 px-4">
      {/* Header */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="relative">
          <Image
            src={labroLogo}
            alt="Labro"
            width={100}
            height={80}
            className="w-[100px] h-auto sm:w-[120px] drop-shadow-lg"
          />
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-md mx-auto">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-200 relative overflow-hidden">
          <div className="relative">
            <div className="flex flex-col items-center">
              {/* Profile Image with Ring */}
              <div className="relative">
                <Image
                  src={PfpPlaceholder}
                  alt="Profile"
                  className="relative rounded-full border-4 border-white shadow-lg"
                  width={80}
                  height={80}
                />
              </div>

              <div className="text-center mt-4 sm:mt-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-teal-600">
                  {userDetails?.name || "User"}
                </h2>
                <p className="text-gray-600 mt-2 font-medium text-sm sm:text-base">
                  {userDetails?.email}
                </p>
                <p className="text-gray-600 font-medium text-sm sm:text-base">
                  +91 {userDetails?.phone}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full py-3 sm:py-3 bg-teal-600 text-white rounded-xl font-semibold
                  hover:bg-teal-700 transform hover:scale-[1.02] transition-all duration-200
                  shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-3 sm:py-3 bg-red-500 text-white rounded-xl font-semibold
                  hover:bg-red-600 transform hover:scale-[1.02] transition-all duration-200
                  shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Profile
                </span>
              </button>

              <button
                onClick={() => setShowAboutModal(true)}
                className="w-full py-3 sm:py-3 bg-teal-600 text-white rounded-xl font-semibold
                  hover:bg-teal-700 transform hover:scale-[1.02] transition-all duration-200
                  shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  About Us
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-teal-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Confirm Logout
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to log out?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 text-white rounded-xl bg-teal-600 
                  hover:bg-teal-700 transition-all font-semibold shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Delete Account
              </h2>
              <p className="text-gray-600 mb-4">
                Please enter your password to proceed.
              </p>
            </div>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                className={`flex-1 px-4 py-3 text-white rounded-xl bg-red-500 
                  hover:bg-red-600 transition-all font-semibold shadow-lg
                  ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4 pt-20">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-lg border border-gray-200 max-h-[85vh] overflow-y-auto relative">
            {/* Close button positioned to avoid nav bar */}
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-teal-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-teal-600">
                About Us
              </h2>
            </div>

            <div className="bg-teal-50 p-4 sm:p-6 rounded-xl mb-4 sm:mb-6">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                We are solving a real problem. Many daily wage workers don't get
                work when they need it, and on the other end, many people can't
                find these workers when they need them. We're on a mission to
                offer them a platform to connect with each other without a
                middleman, at fair prices.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Person 1 */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={yashKumarImg}
                      alt="Yash Kumar"
                      width={80}
                      height={80}
                      className="relative rounded-full border-2 border-white shadow-lg sm:w-[100px] sm:h-[100px]"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-teal-600">
                      Yash Kumar
                    </h3>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                      Co-Founder & Developer
                    </p>
                    <a
                      href="https://www.linkedin.com/in/yashk194/"
                      className="inline-flex items-center gap-2 mt-2 text-teal-600 hover:text-teal-700 transition-colors text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn Profile
                    </a>
                  </div>
                </div>
              </div>

              {/* Person 2 */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={akanshKumarImg}
                      alt="Akansh Kumar"
                      width={80}
                      height={80}
                      className="relative rounded-full border-2 border-white shadow-lg sm:w-[100px] sm:h-[100px]"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-teal-600">
                      Akansh Kumar
                    </h3>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                      Co-Founder & Developer
                    </p>
                    <a
                      href="https://www.linkedin.com/in/akanshkumar/"
                      className="inline-flex items-center gap-2 mt-2 text-teal-600 hover:text-teal-700 transition-colors text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn Profile
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Socials */}
      <div className="mt-8 sm:mt-12 mb-6 sm:mb-8 text-center max-w-md mx-auto">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
          <h3 className="text-lg sm:text-xl font-bold text-teal-600 mb-4 sm:mb-6">
            Find Us On Socials
          </h3>
          <div className="flex justify-center space-x-6 sm:space-x-8">
            {/* Instagram */}
            <a
              href="https://instagram.com/labro.in"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              aria-label="Follow us on Instagram"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  className="sm:w-6 sm:h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
            </a>

            {/* Twitter */}
            <a
              href="https://x.com/labroapp"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              aria-label="Follow us on Twitter"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-full flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  className="sm:w-6 sm:h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </div>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61572705791291"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              aria-label="Follow us on Facebook"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  className="sm:w-6 sm:h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-600 max-w-md mx-auto">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200">
          <p className="font-semibold text-sm sm:text-base">
            © 2025 Labro. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm mt-1">
            Developed and maintained by Yash Kumar.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default withAuth(Profile);
