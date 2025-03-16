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
      wellKnown: "http://localhost:9000/.well-known/openid-configuration",
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
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
