import { startMockServer } from './ordersMock';

(async () => {
  try {
    const server = await startMockServer();
    console.log('Mock server started successfully');
  } catch (error) {
    console.error('Failed to start mock server:', error);
  }
})();