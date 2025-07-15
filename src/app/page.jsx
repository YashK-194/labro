"use client";
import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase/config";
import { useRouter } from "next/navigation";
import labroLogo from "../assets/icons/Labro_logo.png";
import Image from "next/image";
import AnimatedHeadline from "../components/ui/AnimatedHeadline";

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
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-teal-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-teal-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-teal-600 font-medium text-sm sm:text-base">
            Loading Labro...
          </p>
        </div>
      </div>
    );
  }

  // Only render the home page content if user is not authenticated
  if (user) {
    return null; // This will briefly show before the redirect happens
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Image
                src={labroLogo}
                alt="Labro"
                width={80}
                height={64}
                className="w-20 h-auto sm:w-24 drop-shadow-sm"
                priority
              />
            </div>
            {user && (
              <button
                onClick={handleSignOut}
                className="px-3 py-2 sm:px-4 text-sm sm:text-base text-teal-600 hover:text-white hover:bg-teal-600 font-medium rounded-lg transition-all duration-300 border border-teal-600"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              <AnimatedHeadline />
              <span className="block text-teal-600 mt-2 sm:mt-4">
                All in One Place
              </span>
            </h2>
            <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-sm sm:text-lg md:text-xl text-gray-600 leading-relaxed px-4">
              Connect with skilled professionals in your area. From home repairs
              to personal services, find exactly what you need, when you need
              it.
            </p>

            <div className="mt-8 sm:mt-12 flex flex-col gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto px-4">
              <button
                onClick={handleRedirectToList}
                className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative flex flex-col items-center">
                  <span className="text-base sm:text-lg">Create Account</span>
                  <span className="text-xs sm:text-sm opacity-90">
                    (अकाउंट बनाएं)
                  </span>
                </div>
              </button>

              {!user && (
                <button
                  onClick={() => router.push("/sign-in")}
                  className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-teal-600 text-teal-600 font-semibold rounded-xl bg-white hover:bg-teal-50 transform hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-base sm:text-lg">Log In</span>
                    <span className="text-xs sm:text-sm opacity-80">
                      (लॉग इन करें)
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="mt-12 sm:mt-16 lg:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4">
          <div className="group bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-teal-200 transform hover:-translate-y-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl sm:text-3xl text-white">🔍</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Easy Search
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Find the perfect service provider in your area quickly and easily
              with our smart search system.
            </p>
          </div>

          <div className="group bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-teal-200 transform hover:-translate-y-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl sm:text-3xl text-white">⭐</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Various Services
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              All your essential services in one convenient platform, from
              repairs to specialized tasks.
            </p>
          </div>

          <div className="group bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-teal-200 transform hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl sm:text-3xl text-white">💬</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Direct Communication
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Connect directly with service providers through our secure
              platform messaging system.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gray-50 mt-12 sm:mt-16 lg:mt-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-3 sm:mb-4">
              <Image
                src={labroLogo}
                alt="Labro"
                width={60}
                height={48}
                className="w-16 h-auto sm:w-20 mx-auto opacity-80"
              />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed px-4">
              © 2025 Labro. All rights reserved.
              <br />
              <span className="text-teal-600 font-medium">
                Developed and maintained by Yash Kumar
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
