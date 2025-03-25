import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getToken } from "next-auth/jwt";
import { cookies, headers } from "next/headers";

type ProtectedData = {
  message: string;
  timestamp: number;
  data: {
    id: number;
    content: string;
  }[];
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Please sign in to access this resource" },
      { status: 401 }
    );
  }
  console.log("server-side session=", session);
  console.log("server-side session.accessToken=", session.accessToken);

  const req = {
    headers: headers(),
    cookies: cookies(),
  };

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { accessToken, refreshToken } = token;
  console.log("server-side accessToken=", accessToken)
  console.log("server-side refreshToken=", refreshToken)

  // Simulated protected data
  const protectedData: ProtectedData = {
    message: "Successfully retrieved protected data",
    timestamp: Date.now(),
    data: [
      { id: 1, content: "Protected content 1" },
      { id: 2, content: "Protected content 2" },
      { id: 3, content: "Protected content 3" },
    ],
  };

  return NextResponse.json(protectedData);
}