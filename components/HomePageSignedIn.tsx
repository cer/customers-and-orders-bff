import React from 'react';
import { useSession, signOut } from 'next-auth/react';

const HomePageSignedIn: React.FC = () => {
  const { data: session } = useSession();
  return (
    <div>
      <p id="signin-status">Signed in as {session.user?.name}</p>
      <p>{session.authorities ? session.authorities[0] : "none"}</p>
      <button
        onClick={() => signOut()}
        className="button"
      >
        Sign out
      </button>

      <style jsx>{`
        .button {
          padding: 0.5rem 1rem;
          margin: 1rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .button:hover {
          background-color: #0051cc;
        }
      `}</style>
    </div>
  );
};

export default HomePageSignedIn;
