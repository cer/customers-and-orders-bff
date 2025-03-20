import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import Home from '../../pages/index';

// Mock next-auth
jest.mock('next-auth/react');

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Home', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock session by default
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User' },
        authorities: ['ROLE_USER']
      },
      status: 'authenticated'
    });
  });

  it('renders signed-in state with orders table', async () => {
    // Mock successful orders API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        orders: [
          {
            orderId: 1,
            orderState: 'PENDING',
          },
          {
            orderId: 2,
            orderState: 'APPROVED',
          },
          {
            orderId: 3,
            orderState: 'REJECTED',
            rejectionReason: 'INSUFFICIENT_CREDIT'
          }
        ]
      })
    });

    render(<Home />);

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
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('REJECTED')).toBeInTheDocument();
    expect(screen.getByText('INSUFFICIENT_CREDIT')).toBeInTheDocument();
  });

  it('handles API error', async () => {
    // Mock failed orders API response
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<Home />);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Error loading orders')).toBeInTheDocument();
    });
  });

  it('renders sign-in button when not authenticated', () => {
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });

    render(<Home />);

    expect(screen.getByText('Sign in with OAuth2 PKCE')).toBeInTheDocument();
  });
});
