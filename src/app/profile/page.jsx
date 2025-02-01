'use client';
import React, {useState, useEffect} from "react";
import {signOut} from 'firebase/auth';
import { auth, db } from "../firebase/config";
import withAuth from "../firebase/withAuth"
import { doc, getDoc } from "firebase/firestore";
import Image from 'next/image';
import PfpPlaceholder from '../../icons/Pfp_placeholder.png';
import labroLogo from "../../icons/Labro_logo.png";


const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);

    const fetchUserDetails = async () => {
      auth.onAuthStateChanged(async (user) => {
        console.log(user);
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()){
          setUserDetails(docSnap.data());
          console.log(docSnap.data())
        } else {
          console.log("User is not logged in")
        }
      });
    }
  useEffect(() => {
    fetchUserDetails();
  }, []);
  return (
    <div className="p-4 min-h-screen flex flex-col items-center justify-center">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Image src={labroLogo} alt="Labro" width={90} height={70} style={{ width: 'auto', height: 'auto' }} />
      </div>
      <div className="flex items-center border p-4 rounded-lg shadow-md w-full max-w-md mb-6">
        <div className="w-20 h-20 rounded-full flex-shrink-0 mr-4">
          <Image src={PfpPlaceholder} alt="Profile" className="rounded-full" width={80} height={80} />
        </div>
        <div className="flex flex-col">
          <div className="text-2xl font-bold">{userDetails?.name}</div>
          <div>{userDetails?.email}</div>
          <div>{userDetails?.phone}</div>
        </div>
      </div>
      {/* Options */}
      <div className="w-full max-w-md">
        <button className="w-full text-left px-4 py-2 border rounded-md mb-2 hover:bg-gray-100">
          Edit Details
        </button>
        <button className="w-full text-left px-4 py-2 border rounded-md mb-2 hover:bg-gray-100">
          Settings
        </button>
        <button 
          onClick={async () => {
            await auth.signOut();
            sessionStorage.removeItem('user');
          }} 
          className="w-full text-left px-4 py-2 border rounded-md text-red-500 hover:bg-red-100">
          Logout
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white mt-20">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Developed and maintained by Yash Kumar.<br/>
            Contact me: yashkm194@gmail.com
          </p>
        </div>
      </footer>
    </div>
  );
};

export default withAuth(Profile);
