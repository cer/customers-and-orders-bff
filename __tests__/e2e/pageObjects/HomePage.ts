import { Page } from 'puppeteer';

export class HomePage {
    private page: Page;
    private readonly url = 'http://localhost:3000';
    private readonly apiUrl: string;

    // Selectors
    private readonly welcomeGreetingSelector = '#welcome-greeting';
    private readonly signinStatusSelector = '#signin-status';
    private readonly signInButtonSelector = 'button[data-provider="oauth2-pkce"]';
    private readonly ordersTableSelector = '.orders-table';
    private readonly loadingSelector = 'text/Loading orders...';
    private readonly errorSelector = '.error';

    constructor(page: Page, apiUrl: string = 'http://localhost:3001') {
        this.page = page;
        this.apiUrl = apiUrl;
    }

    async navigate(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForSelector(this.welcomeGreetingSelector);
    }

    async getWelcomeText(): Promise<string> {
        const element = await this.page.$('h1');
        return element ? (await element.evaluate(el => el.textContent)) || '' : '';
    }

    async waitForSignInStatus(): Promise<void> {
        await this.page.waitForSelector(this.signinStatusSelector, { timeout: 10000 });
    }

    async getSignInStatus(): Promise<string> {
        await this.waitForSignInStatus();
        const element = await this.page.$(this.signinStatusSelector);
        return element ? (await element.evaluate(el => el.textContent)) || '' : '';
    }

    async clickSignIn(): Promise<void> {
        await this.page.waitForSelector(this.signInButtonSelector);
        await this.page.click(this.signInButtonSelector);
    }

    async isSignedIn(): Promise<boolean> {
        const status = await this.getSignInStatus();
        return status.includes('Signed in as');
    }

    async expectWelcomeTextToBe(expectedText: string): Promise<void> {
        const welcomeText = await this.getWelcomeText();
        expect(welcomeText).toBe(expectedText);
    }

    async expectSignInStatusToBe(expectedStatus: string): Promise<void> {
        const signinStatus = await this.getSignInStatus();
        expect(signinStatus).toBe(expectedStatus);
    }

    async waitForOrdersTable(): Promise<void> {
        await this.page.waitForSelector(this.ordersTableSelector, { timeout: 10000 });
    }

    async isOrdersTableVisible(): Promise<boolean> {
        await this.page.waitForSelector(this.ordersTableSelector, { timeout: 10000 });
        const table = await this.page.$(this.ordersTableSelector);
        return !!table;
    }

    async getOrdersTableRows(): Promise<string[][]> {
        await this.waitForOrdersTable();
        return this.page.evaluate((selector) => {
            const rows = Array.from(document.querySelector(selector)?.querySelectorAll('tbody tr') || []);
            return rows.map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                return cells.map(cell => cell.textContent || '');
            });
        }, this.ordersTableSelector);
    }

    async waitForLoadingToComplete(): Promise<void> {
        try {
            await this.page.waitForFunction(
                (selector) => !document.querySelector(selector),
                { timeout: 5000 },
                this.loadingSelector
            );
        } catch (_error) {
            throw new Error('Loading indicator did not disappear');
        }
    }

    async getErrorMessage(): Promise<string | null> {
        const errorElement = await this.page.$(this.errorSelector);
        if (!errorElement) return null;
        return (await errorElement.evaluate(el => el.textContent)) || null;
    }

    async expectOrderInTable(orderId: string, orderState: string, rejectionReason?: string): Promise<void> {
        const rows = await this.getOrdersTableRows();
        const orderRow = rows.find(row => row[0] === orderId);
        expect(orderRow).toBeTruthy();
        expect(orderRow![1]).toBe(orderState);
        if (rejectionReason) {
            expect(orderRow![2]).toBe(rejectionReason);
        }
    }
}
