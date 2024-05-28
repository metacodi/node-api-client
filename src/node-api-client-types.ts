

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiCredentials {
  apiKey?: string;
  apiSecret?: string;
  apiPassphrase?: string;
};

export interface ApiClientOptions extends ApiCredentials {
  /** Indica si l'api està en mode test o en real. */
  isTest?: boolean,
}

export interface ApiRequestOptions {
  /** Overrides `baseUrl() => string` function in the inherited class. */
  baseUrl?: string;
  /** Automatically call encodeURIComponent for each param value. Default is `true`.*/
  encodeParams?: boolean;
  /** When `true` is set, throws exception if some param value is null, undefined or NaN. Default is `false`. */
  strictValidation?: boolean;
  /** List of query params (GET | DELETE) or json body (POST | PUT) for the request. */
  params?: any;
  headers?: { [key: string]: string | number };
  /** If `false` is set, `getAuthHeaders()` is automatically called. To avoid this, you must override this method in the inherited class. */
  isPublic?: boolean;
  errorMessage?: { code?: number; message?: string; };
  /** Timeout in ms => 1000 * 60 * 5 <=> 5 min. */
  timeout?: number;
  timeoutErrorMessage?: string;
}
