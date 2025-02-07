'use client'
import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/config.js';
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import labroLogo from "../../icons/Labro_logo.png";
import Image from 'next/image';


const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState('');
  const router = useRouter();

  const[createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try{
        const res = await createUserWithEmailAndPassword(email, password);
        // console.log('res', res);
        sessionStorage.setItem('user', email);
        const user = auth.currentUser;
         
        setTimeout(() => {
          console.log('User', user);
        }, 500);
        
        if(user) {
          await setDoc(doc(db, 'Users', user.uid), {
            email: user.email,
            name: name,
            phone: phone,
          });
        }

      setEmail('');
      setPassword('');
      console.log("User signed up and data stored successfully!");
      router.push('/sign-in');

    } catch (error) {
         // If Firestore fails, delete the user from Auth
        if (auth.currentUser) {
            await deleteUser(auth.currentUser);
            console.log("User deleted due to Firestore failure.");
        }
        console.error(error);
    }
    console.log('Signup submitted', { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 text-black p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Image src={labroLogo} alt="Labro" width={90} height={70} style={{ width: 'auto', height: 'auto' }} />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Create Your Account</h2>
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
            <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
              Full Name (पूरा नाम)
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-black mb-2">
              Phone Number (फ़ोन नंबर)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                +91
              </span>
              <input
                type="phone"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 pl-12" 
                placeholder="1234567890"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
              Password (पासवर्ड)
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="Enter at least 8 characters"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </form>
        <div className="text-center mt-4 text-sm text-black">
          Already have an account? <a href="../sign-in" className="text-teal-600 hover:underline">Log in</a>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;