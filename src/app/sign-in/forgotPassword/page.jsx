'use client'
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config.js';
import Link from 'next/link';
import Image from 'next/image';
import labroLogo from "../../../icons/Labro_logo.png";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccessMessage('');
      setLoading(true);
  
      try {
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage('Password reset email sent! Please check your inbox.');
        setEmail('');
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          setError('No user found with this email address.');
        } else if (err.code === 'auth/invalid-email') {
          setError('Invalid email format. Please enter a valid email address.');
        } else if (err.code === 'auth/too-many-requests') {
          setError('Too many requests. Please try again later.');
        } else {
          setError('Failed to send reset email. Please try again.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 text-black p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center">
            <Image src={labroLogo} alt="Labro" width={90} height={70} style={{ width: 'auto', height: 'auto' }} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              {successMessage}
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
            
            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            >
              Send Reset Link
            </button>
          </form>
  
          <div className="text-center mt-4 text-sm text-black">
            Remember your password? <Link href="/sign-in" className="text-teal-600 hover:underline">Log in</Link>
          </div>
        </div>
      </div>
    );
  };
  
  export default ForgotPasswordPage;