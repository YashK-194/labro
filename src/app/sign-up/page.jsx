"use client";
import { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "../../lib/firebase/config.js";
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import labroLogo from "../../assets/icons/Labro_logo.png";
import Image from "next/image";
import ShowPass from "../../assets/icons/Show_pass.png";
import HidePass from "../../assets/icons/Hide_pass.png";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(email, password);
      // console.log('res', res);
      sessionStorage.setItem("user", email);
      const user = auth.currentUser;

      setTimeout(() => {
        console.log("User", user);
      }, 500);

      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          name: name,
          phone: phone,
        });
      }

      setEmail("");
      setPassword("");
      console.log("User signed up and data stored successfully!");
      router.push("/sign-in");
    } catch (error) {
      // If Firestore fails, delete the user from Auth
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
        console.log("User deleted due to Firestore failure.");
      }
      console.error(error);
    }
    console.log("Signup submitted", { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-2 sm:p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-8 border border-white/20">
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

        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-1 sm:mb-2 text-teal-600">
          Join Labro
        </h2>
        <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
          Create your account to get started
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-xl relative mb-4 sm:mb-6 flex items-center text-sm sm:text-base">
            <span className="text-red-500 mr-2">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2"
            >
              Email Address (ईमेल एड्रेस)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white text-sm sm:text-base"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2"
            >
              Full Name (पूरा नाम)
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white text-sm sm:text-base"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2"
            >
              Phone Number (फ़ोन नंबर)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none text-gray-500 font-medium text-sm sm:text-base">
                +91
              </span>
              <input
                type="phone"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                maxLength={10}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white pl-12 sm:pl-14 text-sm sm:text-base"
                placeholder="1234567890"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2"
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
                minLength={8}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white text-sm sm:text-base"
                placeholder="Enter at least 8 characters"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <Image
                  src={showPassword ? HidePass : ShowPass}
                  alt={showPassword ? "Hide" : "Show"}
                  width={18}
                  height={18}
                  className="opacity-60 hover:opacity-80 transition-opacity sm:w-5 sm:h-5"
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 sm:py-3 rounded-xl hover:bg-teal-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
          >
            Create Account
          </button>
        </form>

        <div className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="../sign-in"
            className="text-teal-600 hover:text-teal-700 font-semibold hover:underline transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
