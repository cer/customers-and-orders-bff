import { Page } from 'puppeteer';

interface SecureDataResponse {
    message: string;
    timestamp?: string;
    data?: string[];
    error?: string;
}

interface ApiResponse {
    status: number;
    data: SecureDataResponse;
}

export class ApiHelper {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async fetchSecureData(): Promise<ApiResponse> {
        return await this.page.evaluate(async () => {
            const res = await fetch('/api/secure/data', {
                method: 'GET',
                credentials: 'include',
            });
            return {
                status: res.status,
                data: await res.json()
            };
        });
    }

    async isResponseUnauthorized(response: ApiResponse): boolean {
        return response.status === 401 && 
               response.data.error === 'Unauthorized: Please sign in to access this resource';
    }

    async isResponseSuccessful(response: ApiResponse): boolean {
        return response.status === 200 && 
               response.data.message === 'Successfully retrieved protected data' &&
               Array.isArray(response.data.data) &&
               response.data.data.length === 3;
    }
}