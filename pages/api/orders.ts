import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "./auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import {getToken} from "next-auth/jwt";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized: Please sign in to access this resource" });
  }
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { accessToken, refreshToken } = token;
  console.log("server-side accessToken=", accessToken)
  console.log("server-side refreshToken=", refreshToken)


  try {
    const response = await fetch('http://localhost:50962/orders', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
}
