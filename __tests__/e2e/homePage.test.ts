import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import { HomePage } from './pageObjects/HomePage';
import { LoginPage } from './pageObjects/LoginPage';
import { ConsentPage } from './pageObjects/ConsentPage';

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



});
