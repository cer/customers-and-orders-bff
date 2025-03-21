import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import { HomePage } from './pageObjects/HomePage';
import { LoginPage } from './pageObjects/LoginPage';
import { ConsentPage } from './pageObjects/ConsentPage';
import expect from "expect";
import {afterAll, beforeAll, describe, it} from "@jest/globals";

describe('Home Page', () => {
  let browser: Browser;
  let page: Page;
  let homePage: HomePage;
  let loginPage: LoginPage;
  let consentPage: ConsentPage;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    consentPage = new ConsentPage(page);
  });

  afterAll(async () => {
    await browser.close();
  });

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

  it('should display orders table after signing in', async () => {
    await homePage.expectSignInStatusToBe('Signed in as user1');

    // Verify table is visible
    expect(await homePage.isOrdersTableVisible()).toBe(true);

    // Get all rows and verify structure
    const rows = await homePage.getOrdersTableRows();
    expect(rows.length).toBeGreaterThan(0);

    // Verify table headers are present
    const headers = await page.$$eval('.orders-table th', ths => ths.map(th => th.textContent));
    expect(headers).toEqual(['Order ID', 'State', 'Rejection Reason']);

    // Verify each row has correct number of columns
    for (const row of rows) {
      expect(row.length).toBe(3); // orderId, orderState, rejectionReason
    }
  });


});
