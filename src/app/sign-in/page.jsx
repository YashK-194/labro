'use client'
import { useState, useEffect } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config.js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import labroLogo from "../../icons/Labro_logo.png";
import Image from 'next/image';
import ShowPass from '../../icons/Show_pass.png'
import HidePass from '../../icons/Hide_pass.png'

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [signInWithEmailAndPassword, user, loading, userError] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/find');
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await signInWithEmailAndPassword(email, password);
      if (result) {
        sessionStorage.setItem('user', email);
        setEmail('');
        setPassword('');
      } else {
        setError('Failed to sign in. Please check your credentials.');
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('User does not exist or incorrect password. Please check your email and password or create an account.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format. Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 text-black p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Image src={labroLogo} alt="Labro" width={90} height={70} style={{ width: 'auto', height: 'auto' }} />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
              Email Address (ईमेल एड्रेस)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="you@example.com"
            />
          </div>
          <div>
          <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
            Password (पासवर्ड)
          </label>
          <div className="flex items-center gap-2">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="Enter your password"
            />
            <button type="button" onClick={togglePasswordVisibility}>
              {showPassword ? <Image src={HidePass} alt="Hide" width={20} height={20} style={{ width: 'auto', height: 'auto' }} /> : <Image src={ShowPass} alt="Show" width={20} height={20} style={{ width: 'auto', height: 'auto' }} />}
            </button>
          </div>
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            Log In
          </button>
        </form>
        <div className="text-center mt-2 text-sm text-black">
          <Link href="/sign-in/forgotPassword" className="text-teal-600 hover:underline">
            Forgot Password?
          </Link>
        </div>
        <div className="text-center mt-4 text-sm text-black">
          Don't have an account? <Link href="/sign-up" className="text-teal-600 hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;