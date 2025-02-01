'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { auth } from './config';
import { useEffect } from 'react';

const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/sign-up'); // Redirect to the sign-up page if not authenticated
      }
    }, [user, loading, router]);

    if (loading || !user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      ); // Show a loading state until authentication is verified
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
