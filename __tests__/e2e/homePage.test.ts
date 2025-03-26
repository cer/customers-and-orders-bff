import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import { HomePage } from './pageObjects/HomePage';
import { LoginPage } from './pageObjects/LoginPage';
import { ConsentPage } from './pageObjects/ConsentPage';
import expect from "expect";
import {afterAll, beforeAll, describe, it} from "@jest/globals";
import { startMockServer } from './mockServer/ordersMock';
import { Server } from 'http';
import { exec } from 'child_process';

/**
 * End-to-end tests for the Home Page
 * These tests verify the integration between the frontend and the Orders API,
 * using a mock server to simulate the API responses.
 */
describe('Home Page', () => {
  let browser: Browser;
  let page: Page;
  let homePage: HomePage;
  let loginPage: LoginPage;
  let consentPage: ConsentPage;
  let mockServer: Server;

  beforeAll(async () => {
    try {
      // Kill any existing process on port 3001
      // await new Promise<void>((resolve) => {
      //   exec('lsof -ti:3001 | xargs kill -9', () => {
      //     // Ignore error as it means no process was running on that port
      //     resolve();
      //   });
      // });

      console.log("starting mock server");
      mockServer = await startMockServer();
      console.log("started mock server");
      process.env.ORDERS_API_URL = 'http://localhost:3001';
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      page = await browser.newPage();
      homePage = new HomePage(page, 'http://localhost:3001');
      loginPage = new LoginPage(page);
      consentPage = new ConsentPage(page);
    } catch (error) {
      console.error('Error in beforeAll:', error);
      // Ensure cleanup if setup fails
      if (mockServer) {
        await new Promise<void>((resolve) => {
          mockServer.close(() => resolve());
        });
      }
      if (browser) {
        await browser.close();
      }
      throw error;
    }
  });

  afterAll(async () => {
    try {
      if (browser) {
        await browser.close();
      }
      if (mockServer) {
        await new Promise<void>((resolve, reject) => {
          mockServer.close((err) => {
            if (err) {
              console.error('Error closing mock server:', err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
    } catch (error) {
      console.error('Error in afterAll:', error);
    } finally {
      delete process.env.ORDERS_API_URL;
      // Kill any remaining process on port 3001
      // await new Promise<void>((resolve) => {
      //   exec('lsof -ti:3001 | xargs kill -9', () => resolve());
      // });
    }
  });

  it('should start mock server', async() => {
    expect(mockServer).toBeTruthy();
  })

  it('should display the home page', async () => {
    await homePage.navigate();

    await homePage.expectWelcomeTextToBe('Welcome to Next.js!');
    await homePage.expectSignInStatusToBe('Not signed in');
  });

  it('should sign in and display signed in status', async () => {
    await homePage.navigate();
    await homePage.clickSignIn();

    await loginPage.login('user1', 'password');
    await consentPage.giveConsent();

    await homePage.expectSignInStatusToBe('Signed in as user1');
  });

  /**
   * Verifies that the orders table is properly displayed after signing in.
   * Tests:
   * - Table visibility
   * - Correct number of orders from mock data
   * - Table headers match specification
   * - Order data matches mock server response
   * - All order states (APPROVED, REJECTED, PENDING) are properly displayed
   * - Rejection reasons are shown when applicable
   */
  it('should display orders table after signing in', async () => {
    await homePage.expectSignInStatusToBe('Signed in as user1');

    await homePage.waitForOrdersTable();

    // Get all rows and verify structure
    const rows = await homePage.getOrdersTableRows();
    expect(rows.length).toBe(3); // Should match the number of sample orders

    // Verify table headers are present
    const headers = await page.$$eval('.orders-table th', ths => ths.map(th => th.textContent));
    expect(headers).toEqual(['Order ID', 'State', 'Rejection Reason']);

    // Verify specific orders from the mock data
    await homePage.expectOrderInTable('1', 'APPROVED', '');
    await homePage.expectOrderInTable('2', 'REJECTED', 'INSUFFICIENT_CREDIT');
    await homePage.expectOrderInTable('3', 'PENDING', '');
  });



});
