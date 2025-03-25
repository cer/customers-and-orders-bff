import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'oauth2-pkce',
      name: 'OAuth2 PKCE Provider',
      type: 'oauth',
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      wellKnown: process.env.OAUTH_WELL_KNOWN_URL,
      issuer: process.env.OAUTH_ISSUER_URL,
      authorization: {
        url: process.env.OAUTH_AUTHORIZATION_URL,
        params: {
          scope: 'openid profile email',
          response_type: 'code',
          code_challenge_method: 'S256',
        },
      },
      token: {
        url: process.env.OAUTH_TOKEN_URL,
      },
      userinfo: {
        url: process.env.OAUTH_USERINFO_URL,
      },
      checks: ['pkce', 'state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expires_at = account.expires_at;
      }
      if (user) {
        token.user = user;
      }
      if (profile) {
        token.authorities = profile.authorities;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.name = token.name; // Ensure the name is set in the session
      session.authorities = token.authorities; // Add authorities to the session
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export const GET = handler;
export const POST = handler;