import { render, screen, waitFor } from '@testing-library/react';
import OrderTable from '../../components/OrderTable';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('OrderTable', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders orders table with data', async () => {
    // Mock successful orders API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        orders: [
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
        ]
      })
    });

    render(<OrderTable />);

    // Check loading state
    expect(screen.getByText('Loading orders...')).toBeInTheDocument();

    // Wait for orders to load
    await waitFor(() => {
      expect(screen.queryByText('Loading orders...')).not.toBeInTheDocument();
    });

    // Check if orders table is rendered
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Order ID')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText('Rejection Reason')).toBeInTheDocument();

    // Check if orders are displayed
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('REJECTED')).toBeInTheDocument();
    expect(screen.getByText('INSUFFICIENT_CREDIT')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('handles API error', async () => {
    // Mock failed orders API response
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<OrderTable />);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Error loading orders')).toBeInTheDocument();
    });
  });

  it('displays dash for missing rejection reason', async () => {
    // Mock successful orders API response with null rejection reason
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        orders: [
          {
            orderId: 1,
            orderState: 'APPROVED',
            rejectionReason: null
          }
        ]
      })
    });

    render(<OrderTable />);

    // Wait for orders to load
    await waitFor(() => {
      expect(screen.queryByText('Loading orders...')).not.toBeInTheDocument();
    });

    // Check if dash is displayed for null rejection reason
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('handles non-ok API response', async () => {
    // Mock non-ok API response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    render(<OrderTable />);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Error loading orders')).toBeInTheDocument();
    });
  });
});