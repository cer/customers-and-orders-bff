import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

const Home: React.FC = () => {
  const { data: session, status } = useSession();

  console.log('session=', session);

  if (status === 'loading') {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 id="welcome-greeting">Welcome to Next.js!</h1>

      {session ? (
        <div>
          <p id="signin-status">Signed in as {session.user?.name}</p>
          <button
            onClick={() => signOut()}
            className="button"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div>
          <p id="signin-status">Not signed in</p>
          <button
            onClick={() => signIn('oauth2-pkce')}
            className="button"
            data-provider="oauth2-pkce"
          >
            Sign in with OAuth2 PKCE
          </button>
        </div>
      )}

      {/* Add error message container for E2E tests */}
      <div className="error-message" style={{ display: 'none' }}></div>

      <style jsx>{`
        .container {
          padding: 2rem;
          text-align: center;
        }
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

export default Home;
