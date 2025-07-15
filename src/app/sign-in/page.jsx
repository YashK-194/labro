"use client";
import { useState, useEffect } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase/config.js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import labroLogo from "../../assets/icons/Labro_logo.png";
import Image from "next/image";
import ShowPass from "../../assets/icons/Show_pass.png";
import HidePass from "../../assets/icons/Hide_pass.png";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [signInWithEmailAndPassword, user, loading, userError] =
    useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push("/find");
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700 text-sm sm:text-base">
            Signing you in...
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signInWithEmailAndPassword(email, password);
      if (result) {
        sessionStorage.setItem("user", email);
        setEmail("");
        setPassword("");
      } else {
        setError("Failed to sign in. Please check your credentials.");
      }
    } catch (err) {
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError(
          "User does not exist or incorrect password. Please check your email and password or create an account."
        );
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format. Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-sm sm:max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="p-2 sm:p-3 bg-white rounded-2xl shadow-lg border border-gray-200">
            <Image
              src={labroLogo}
              alt="Labro"
              width={70}
              height={56}
              className="w-[70px] h-auto sm:w-[90px]"
            />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-teal-600">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
          Sign in to continue to Labro
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-xl relative mb-4 sm:mb-6 flex items-start sm:items-center text-sm">
            <span className="text-red-500 mr-2 flex-shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email Address (ईमेल एड्रेस)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white text-sm sm:text-base"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Password (पासवर्ड)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-3 pr-12 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white text-sm sm:text-base"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <Image
                  src={showPassword ? HidePass : ShowPass}
                  alt={showPassword ? "Hide" : "Show"}
                  width={18}
                  height={18}
                  className="sm:w-5 sm:h-5 opacity-60 hover:opacity-80 transition-opacity"
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
          >
            Sign In
          </button>
        </form>

        <div className="text-center mt-5 sm:mt-6 text-sm">
          <Link
            href="/sign-in/forgotPassword"
            className="text-teal-600 hover:text-teal-700 font-medium hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="text-center mt-4 sm:mt-6 text-sm text-gray-600">
          Don't have an account?
          <Link
            href="/sign-up"
            className="text-teal-600 hover:text-teal-700 font-semibold ml-1 hover:underline transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
