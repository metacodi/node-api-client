import { AxiosError } from 'axios';
import { ApiClientOptions, ApiRequestOptions, HttpMethod } from './node-api-client-types';
export declare abstract class ApiClient {
    abstract baseUrl(): string;
    protected options: ApiClientOptions;
    constructor(options?: ApiClientOptions);
    get apiKey(): string;
    get apiSecret(): string;
    get apiPassphrase(): string;
    get isTest(): boolean;
    get defaultOptions(): Partial<ApiClientOptions>;
    setCredentials(data: {
        apiKey: string;
        apiSecret: string;
        apiPassphrase: string;
    }): void;
    get(endpoint: string, options?: ApiRequestOptions): Promise<any>;
    post(endpoint: string, options?: ApiRequestOptions): Promise<any>;
    put(endpoint: string, options?: ApiRequestOptions): Promise<any>;
    delete(endpoint: string, options?: ApiRequestOptions): Promise<any>;
    request(method: HttpMethod, endpoint: string, options?: ApiRequestOptions): Promise<any>;
    requestSyncTestNotWorking(method: HttpMethod, endpoint: string, options?: ApiRequestOptions): void;
    protected splitURL(url: string): {
        protocol: string;
        hostname: string;
        port: string;
        path: string;
        query: string;
    };
    protected resolveData(method: HttpMethod, data?: {
        [key: string]: any;
    }, options?: {
        encodeParams?: boolean;
        strictValidation?: boolean;
    }): {
        query: string;
        body: string;
    };
    protected getAuthHeaders(method: HttpMethod, endpoint: string, params: any): Promise<{
        [header: string]: string | number;
    }>;
    protected buildSignMessage(timestamp: number | string, method: HttpMethod, endpoint: string, params: any): string;
    protected formatQuery(params: any): string;
    protected serialiseParams(request?: {
        [key: string]: any;
    }, options?: {
        encodeValues?: boolean;
        strictValidation?: boolean;
    }): string;
    signMessage(message: string, secret: string): Promise<string>;
    protected parseAxiosException(e: AxiosError, url: string, errorMessage: ApiRequestOptions['errorMessage']): any;
}
export declare class TestApiClient extends ApiClient {
    options: ApiClientOptions & {
        apiBaseUrl?: string;
        apiIdUser?: number;
    };
    debug: boolean;
    constructor(options: ApiClientOptions & {
        apiBaseUrl?: string;
        apiIdUser?: number;
    });
    baseUrl(): string;
    protected getAuthHeaders(method: HttpMethod, endpoint: string, params: any): Promise<{
        Authorization: string;
        'Authorization-User': number;
    }>;
    request(method: HttpMethod, endpoint: string, options?: ApiRequestOptions): Promise<any>;
}
//# sourceMappingURL=node-api-client.d.ts.map