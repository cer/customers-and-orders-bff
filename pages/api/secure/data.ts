import { getServerSession } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { getToken } from "next-auth/jwt";

type ProtectedData = {
  message: string;
  timestamp: number;
  data: {
    id: number;
    content: string;
  }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProtectedData | { error: string }>
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized: Please sign in to access this resource" });
  }
  console.log("server-side session=", session);
  console.log("server-side session.accessToken=", session.accessToken);

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

  res.status(200).json(protectedData);
}
