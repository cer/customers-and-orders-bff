/**
 * Mock server implementation for the Orders API
 * This server simulates the behavior of the real Orders service during E2E tests.
 * It implements the endpoints according to the OpenAPI specification and returns sample data.
 */

import express from 'express';
import cors from 'cors';
import { GetOrderResponse, GetOrdersResponse } from '../../../types/api';

const app = express();
app.use(cors());
const port = 3001;

/**
 * Sample order data that matches the OpenAPI specification.
 * Includes examples of all possible order states and rejection reasons
 * to ensure comprehensive test coverage.
 */
const sampleOrders: GetOrderResponse[] = [
  {
    orderId: 1,
    orderState: 'APPROVED',
    rejectionReason: null
  },
  {
    orderId: 2,
    orderState: 'REJECTED',
    rejectionReason: 'INSUFFICIENT_CREDIT'
  },
  {
    orderId: 3,
    orderState: 'PENDING',
    rejectionReason: null
  }
];

app.get('/orders', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const response: GetOrdersResponse = {
    orders: sampleOrders
  };
  res.json(response);
});

export const startMockServer = async (): Promise<Server> => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Mock server is running on http://localhost:${port}`);
      resolve(server);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
        reject(new Error(`Port ${port} is already in use`));
      } else {
        console.error(`Server error: ${err}`);
        reject(err);
      }
    });
  });
};
