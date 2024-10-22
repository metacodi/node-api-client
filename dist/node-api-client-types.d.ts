export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface ApiCredentials {
    apiKey?: string;
    apiSecret?: string;
    apiPassphrase?: string;
}
export interface ApiClientOptions extends ApiCredentials {
    isTest?: boolean;
}
export interface ApiRequestOptions {
    baseUrl?: string;
    encodeParams?: boolean;
    strictValidation?: boolean;
    params?: any;
    headers?: {
        [key: string]: string | number;
    };
    isPublic?: boolean;
    errorMessage?: {
        code?: number;
        message?: string;
    };
    timeout?: number;
    timeoutErrorMessage?: string;
}
export interface ErrorObject {
    code?: number;
    message: string;
    data?: any;
}
//# sourceMappingURL=node-api-client-types.d.ts.map