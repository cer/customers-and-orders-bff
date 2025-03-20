import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import { HomePage } from './pageObjects/HomePage';
import { LoginPage } from './pageObjects/LoginPage';
import { ConsentPage } from './pageObjects/ConsentPage';
import { ApiHelper } from './pageObjects/ApiHelper';

describe('Protected API', () => {
  let browser: Browser;
  let page: Page;
  let homePage: HomePage;
  let loginPage: LoginPage;
  let consentPage: ConsentPage;
  let apiHelper: ApiHelper;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    consentPage = new ConsentPage(page);
    apiHelper = new ApiHelper(page);

    await page.setRequestInterception(true);

    page.on('request', (request) => {
      console.log('[DEBUG_LOG] Request:', request.url());
      request.continue();
    });

    page.on('response', (response) => {
      console.log('[DEBUG_LOG] Response:', response.url(), response.status());
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should reject unauthenticated requests to protected API', async () => {
    await homePage.navigate();
    const response = await apiHelper.fetchSecureData();

    expect(await apiHelper.isResponseUnauthorized(response)).toBe(true);
  });

  it('should return protected data for authenticated requests', async () => {
    // First sign in
    await homePage.navigate();
    await homePage.clickSignIn();

    await loginPage.login('user1', 'password');
    await consentPage.giveConsent();
    await homePage.waitForSignInStatus();

    console.log("!!!!!!!!!!!!!!!!!! ACCESSING API")

    // Now try to access the protected API
    const response = await apiHelper.fetchSecureData();
    expect(await apiHelper.isResponseSuccessful(response)).toBe(true);
  });
});
