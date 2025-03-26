'use client';

import React, { useEffect, useState } from 'react';

interface Order {
  orderId: number;
  orderState: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: 'INSUFFICIENT_CREDIT' | 'UNKNOWN_CUSTOMER';
}

interface OrdersResponse {
  orders: Order[];
}

const OrderTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data: OrdersResponse = await response.json();
        setOrders(data.orders);
        setError(null);
      } catch (err) {
        setError('Error loading orders');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="orders-section">
      <h2>Orders</h2>
      {loading && <p>Loading orders...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>State</th>
              <th>Rejection Reason</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{order.orderState}</td>
                <td>{order.rejectionReason || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style jsx>{`
        .orders-section {
          margin-top: 2rem;
        }
        .orders-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        .orders-table th,
        .orders-table td {
          padding: 0.75rem;
          text-align: left;
          border: 1px solid #ddd;
        }
        .orders-table th {
          background-color: #f4f4f4;
          font-weight: bold;
        }
        .orders-table tr:nth-child(even) {
          background-color: #f8f8f8;
        }
        .error {
          color: red;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default OrderTable;