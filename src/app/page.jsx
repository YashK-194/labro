"use client";
import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase/config";
import { useRouter } from "next/navigation";
import labroLogo from "../icons/Labro_logo.png";
import Image from 'next/image';
import AnimatedHeadline from "./components/AnimatedHeadline";

function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleRedirectToList = () => {
    if (user) {
      router.push("/find");
    } else {
      router.push("/sign-up");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem("user");
      router.push("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const fetchUserDetails = async () => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      // Redirect to list page if user is authenticated
      if (user) {
        router.push("/find");
      }
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Only render the home page content if user is not authenticated
  if (user) {
    return null; // This will briefly show before the redirect happens
  }

  return (
    // Rest of your existing JSX remains exactly the same
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Image src={labroLogo} alt="Labro" width={100} height={80} />
            {user && (
              <button
                onClick={handleSignOut}
                className="text-teal-600 hover:text-teal-800 font-medium"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <AnimatedHeadline />
            <span className="block text-teal-600">All in One Place</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Connect with skilled professionals in your area. From home repairs to personal services,
            find exactly what you need, when you need it.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <button
              onClick={handleRedirectToList}
              className="inline-flex flex-col items-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              <span><strong>Create Account</strong></span>
              <span className="mt-1">(अकाउंट बनाएं)</span>
            </button>

            {!user && (
              <button
                onClick={() => router.push("/sign-in")}
                className="inline-flex flex-col items-center px-8 py-3 border border-teal-600 text-base font-medium rounded-lg text-teal-600 bg-white hover:bg-teal-50 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              >
                <span><strong>Log In</strong></span>
                <span className="mt-1">(लॉग इन करें)</span>
              </button>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <div className="text-teal-600 text-2xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Easy Search</h3>
            <p className="text-gray-500">Find the perfect service provider in your area quickly and easily.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <div className="text-teal-600 text-2xl mb-4">⭐</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Various Services</h3>
            <p className="text-gray-500">All Your Essential Services in One Convenient Platform</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <div className="text-teal-600 text-2xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Direct Communication</h3>
            <p className="text-gray-500">Connect directly with service providers through our platform.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white mt-20">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
         <p className="text-center text-gray-500 text-sm">
            © 2025 Labro. All rights reserved. <br />
            Developed and maintained by Yash Kumar. <br />
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;