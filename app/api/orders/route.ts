import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { cookies, headers } from "next/headers";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Please sign in to access this resource" },
      { status: 401 }
    );
  }

  const req = {
    headers: headers(),
    cookies: cookies(),
  };

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { accessToken, refreshToken } = token;
  console.log("server-side accessToken=", accessToken)
  console.log("server-side refreshToken=", refreshToken)

  try {
    const ordersApiUrl = process.env.ORDERS_API_URL || 'http://localhost:50962';
    console.log("ordersApiUrl=", ordersApiUrl);

    const response = await fetch(`${ordersApiUrl}/orders`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}