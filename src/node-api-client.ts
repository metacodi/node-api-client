import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import https from 'https';
import { createHmac } from 'crypto';

import { Terminal, concatError } from '@metacodi/node-utils';

import { ApiClientOptions, ApiRequestOptions, HttpMethod } from './node-api-client-types';


export abstract class ApiClient {

  abstract baseUrl(): string;

  protected options: ApiClientOptions;
  
  constructor(
    options?: ApiClientOptions,
  ) {
    this.options = { ...this.defaultOptions, ...options };
  }

  // ---------------------------------------------------------------------------------------------------
  //  options
  // ---------------------------------------------------------------------------------------------------

  get apiKey(): string { return this.options?.apiKey; }

  get apiSecret(): string { return this.options?.apiSecret; }

  get apiPassphrase(): string { return this.options?.apiPassphrase; }

  get isTest(): boolean { return !!this.options?.isTest; }

  get defaultOptions(): Partial<ApiClientOptions> {
    return {
      isTest: false,
    }
  }

  public setCredentials(data: { apiKey: string; apiSecret: string; apiPassphrase: string }): void {
    this.options.apiKey = data.apiKey;
    this.options.apiSecret = data.apiSecret;
    this.options.apiPassphrase = data.apiPassphrase;
  }


  // ---------------------------------------------------------------------------------------------------
  //  request helpers
  // ---------------------------------------------------------------------------------------------------

  public get(endpoint: string, options?: ApiRequestOptions): Promise<any> { return this.request('GET', endpoint, options); }

  public post(endpoint: string, options?: ApiRequestOptions): Promise<any> { return this.request('POST', endpoint, options); }
  
  public put(endpoint: string, options?: ApiRequestOptions): Promise<any> { return this.request('PUT', endpoint, options); }

  public delete(endpoint: string, options?: ApiRequestOptions): Promise<any> { return this.request('DELETE', endpoint, options); }


  // ---------------------------------------------------------------------------------------------------
  //  request
  // ---------------------------------------------------------------------------------------------------

  async request(method: HttpMethod, endpoint: string, options?: ApiRequestOptions): Promise<any> {
    try {
      if (!options) { options = {}; }
      const isPublic = options.isPublic === undefined ? false : !!options.isPublic;
      const headers = options.headers === undefined ? undefined : options.headers;
      const params = options.params === undefined ? undefined : options.params;
      const encodeParams = options.encodeParams === undefined ? true : !!options.encodeParams;
      const strictValidation = options.strictValidation === undefined ? false : options.strictValidation;
      const timeout = options.timeout === undefined ? undefined : options.timeout;
      const timeoutErrorMessage = options.timeoutErrorMessage === undefined ? undefined : options.timeoutErrorMessage;
  
      const baseUrl = options.baseUrl || this.baseUrl();
  
      const config: AxiosRequestConfig<any> = {
        method,
        headers: { ...headers as any },
      };
  
      if (!!timeout) { config.timeout = timeout; }
      if (!!timeoutErrorMessage) { config.timeoutErrorMessage = timeoutErrorMessage; }
  
      const { body, query } = this.resolveData(method, params || {}, { encodeParams, strictValidation });
  
      if (query) {
        const concat = endpoint.includes('?') ? (endpoint.endsWith('?') ? '' : '&') : '?';
        endpoint += concat + query;
      }
  
      if (method === 'POST' || method === 'PUT') {
        config.data = body;
      }
  
      if (!isPublic) {
        try {
          const authHeaders = await this.getAuthHeaders(method, `/${endpoint}`, body);
          config.headers = { ...config.headers, ...authHeaders } as any;
  
        } catch (error: any) {
          throw concatError(error, `Error establint els headers d'autenticació del client API.`);
        }
      }
  
      const protocol = baseUrl.startsWith('http') ? '' : 'https://';
      config.url = protocol + [baseUrl, endpoint].join('/');
  
      // console.log(config);

      return axios(config).then(response => {
        // console.log(config.url, response);
        if (response.status >= 300) { throw response; }
        return response.data;
      }).catch(e => this.parseAxiosException(e, config.url, options.errorMessage));

    } catch (error: any) {
      const url = (endpoint || '').split('?')[0];
      throw concatError(error, `Error executant la consulta ${method} ${url} del client API.`);
    }
  }

  requestSyncTestNotWorking(method: HttpMethod, endpoint: string, options?: ApiRequestOptions) {
    try {
      if (!options) { options = {}; }
      const isPublic = options.isPublic === undefined ? false : !!options.isPublic;
      const headers = options.headers === undefined ? undefined : options.headers;
      const params = options.params === undefined ? undefined : options.params;
      const encodeParams = options.encodeParams === undefined ? true : !!options.encodeParams;
      const strictValidation = options.strictValidation === undefined ? false : options.strictValidation;
      const timeout = options.timeout === undefined ? undefined : options.timeout;
      const timeoutErrorMessage = options.timeoutErrorMessage === undefined ? undefined : options.timeoutErrorMessage;
  
      const baseUrl = options.baseUrl || this.baseUrl();
  
      const config: AxiosRequestConfig<any> = {
        method,
        headers: { ...headers as any },
      };
  
      if (!!timeout) { config.timeout = timeout; }
      if (!!timeoutErrorMessage) { config.timeoutErrorMessage = timeoutErrorMessage; }
  
      const { body, query } = this.resolveData(method, params || {}, { encodeParams, strictValidation });
  
      if (query) {
        const concat = endpoint.includes('?') ? (endpoint.endsWith('?') ? '' : '&') : '?';
        endpoint += concat + query;
      }
  
      if (method === 'POST' || method === 'PUT') {
        config.data = body;
      }

      // if (!isPublic) {
      //   try {
      //     const authHeaders = await this.getAuthHeaders(method, `/${endpoint}`, body);
      //     config.headers = { ...config.headers, ...authHeaders } as any;
  
      //   } catch (error: any) {
      //     throw concatError(error, `Error establint els headers d'autenticació del client API.`);
      //   }
      // }
  
      const protocol = baseUrl.startsWith('http') ? '' : 'https://';
      config.url = protocol + [baseUrl, endpoint].join('/');
  
      // console.log(config);
 
      // return axios(config).then(response => {
      //   // console.log(config.url, response);
      //   if (response.status >= 300) { throw response; }
      //   return response.data;
      // }).catch(e => this.parseAxiosException(e, config.url, options.errorMessage));


      // const splitted = this.splitURL(config.url);

      // // const httpHeaders: OutgoingHttpHeaders = { ...config.headers as { [header: string]: number | string } };
      // const opts: https.RequestOptions = {
      //   method,
      //   hostname: splitted.hostname,
      //   // port: splitted.port,
      //   path: `${splitted.path}${splitted.query}`,
      //   // query: splitted.query,
      //   protocol: splitted.protocol || 'https:',
      //   sessionTimeout: 30, /* in seconds */
      //   headers: { ...config.headers as { [header: string]: number | string } },
      // };

      // const parseResponse = (data: any[]) => {
      //   const response = Buffer.concat(data).toString();
      //   try {
      //     const json = JSON.parse(response);
      //     return json;
      //   } catch(error: any) {
      //     return response;
      //   }
      // }
      
      // return new Promise<any>((resolve: any, reject: any) => {        
      //   https.request(opts, (res) => {
      //     console.log('statusCode:', res.statusCode);
      //     console.log('headers:', res.headers);
      //     let data: any[] = [];
      //     res.on('data', chunk => {
      //       process.stdout.write(chunk);
      //       data.push(chunk);
      //     });
      //     res.on('end', () => {
      //       const response = parseResponse(data);
      //       if (res.statusCode < 300) {
      //         resolve(response);
      //         // const response = Buffer.concat(data).toString();
      //         // try {
      //         //   const json = JSON.parse(response);
      //         //   resolve(json);
      //         // } catch(error: any) {
      //         //   resolve(response);
      //         // }
      //       } else {
      //         throw response;              
      //       }
      //       // console.log('Response ended: ', response);
      //     });
      //   }).on('error', error => {
      //     console.error(error);
      //     this.parseAxiosException(error as any, config.url, options.errorMessage);
      //     // reject(error);
      //   }).end();
      // });

    } catch (error: any) {
      const url = (endpoint || '').split('?')[0];
      throw concatError(error, `Error executant la consulta ${method} ${url} del client API.`);
    }
  }

  protected splitURL(url: string) {
    // Ex: 'https://test.typicode.com/users/dom?query=12&foo=bar' => [
    //   "https://www.google.com:80/users/dom?query=12&foo=bar",
    //   'https://',
    //   "www.google.com",
    //   ':80',
    //   "/users/dom",
    //   "?query=12&foo=bar",
    // ];
    // Ex: 'test.typicode.com/users/dom?query=12&foo=bar' => [
    //   "www.google.com/users/dom?query=12&foo=bar",
    //   undefined,
    //   "www.google.com",
    //   undefined,
    //   "/users/dom",
    //   "?query=12&foo=bar",
    // ];
    const res = /^(https:\/\/|http:\/\/)?([^\/]*)(:\d+)?([^?]*)(.*)/gi.exec(url);
    return {
      protocol: res[1].replace(/\/\/$/gi, '') || '',
      hostname: res[2] || '',
      port: (res[3] || '').replace(':', ''),
      path: res[4] || '',
      query: (res[5] || ''),
    }
  }

  protected resolveData(method: HttpMethod, data: { [key: string]: any } = {}, options?: { encodeParams?: boolean, strictValidation?: boolean }) {
    if (!options) { options = {}; }
    const strictValidation = options.strictValidation === undefined ? false : options.strictValidation;
    const encodeParams = options.encodeParams === undefined ? true : options.encodeParams;
    const d: { [key: string]: any } = {};
    Object.keys(data).map(key => {
      const value = data[key];
      if (strictValidation && value === undefined) {
        throw { code: 500, message: `Failed to sign API request due to undefined data parameter` };
      }
      const canEncode = method === 'GET' || method === 'DELETE';
      const encodedValue = encodeParams && canEncode ? encodeURIComponent(value) : value;
      d[key] = encodedValue;
    });

    if (method === 'GET' || method === 'DELETE') {
      return {
        query: Object.keys(d).map(v => `${v}=${d[v]}`).join('&'),
        body: undefined,
      }
    } else {
      return {
        query: '',
        body: JSON.stringify(d),
      }
    }
  }

  protected async getAuthHeaders(method: HttpMethod, endpoint: string, params: any) {
    const { apiKey, apiSecret, apiPassphrase } = this;

    const timestamp = Date.now();
    const message = this.buildSignMessage(timestamp, method, endpoint, params);
    const signature = await this.signMessage(message, apiSecret);
    const headers: { [header: string]: number | string } = {
      'ACCESS-SIGN': signature,
      'ACCESS-TIMESTAMP': timestamp,
      'ACCESS-KEY': apiKey,
      'ACCESS-PASSPHRASE': apiPassphrase,
    };
    return headers;
  }

  protected buildSignMessage(timestamp: number | string, method: HttpMethod, endpoint: string, params: any): string {
    const mParams = String(JSON.stringify(params)).slice(1, -1);
    const formatedParams = String(mParams).replace(/\\/g, '');
    const data = (method === 'GET' || method === 'DELETE') ? this.formatQuery(params) : formatedParams;
    return `${timestamp}${method}${endpoint}${data}`;
  }

  protected formatQuery(params: any) {
    if (!!params && JSON.stringify(params).length !== 2) {
      const serialisedParams = this.serialiseParams(params, { encodeValues: true });
      return '?' + serialisedParams;
    } else {
      return '';
    }
  }

  protected serialiseParams(request: { [key: string]: any } = {}, options?: { encodeValues?: boolean, strictValidation?: boolean }): string {
    if (!options) { options = {}; }
    const strictValidation = options.strictValidation === undefined ? false : options.strictValidation;
    const encodeValues = options.encodeValues === undefined ? true : options.encodeValues;
    return Object.keys(request).map(key => {
      const value = request[key];
      if (strictValidation && (value === null || value === undefined || isNaN(value))) {
        throw { code: 500, message: `Failed to sign API request due to undefined parameter` };
      }
      const encodedValue = value ? (encodeValues ? encodeURIComponent(value) : value) : null;
      return `${key}=${encodedValue}`;
    }).join('&');
  };

  async signMessage(message: string, secret: string): Promise<string> {
    try {
      // Si és possible, fem servir la funció de crypto.
      if (typeof createHmac === 'function') {
        return createHmac('sha256', secret).update(message).digest('base64');
      }
      // Si no s'ha pogut importar la funció en entorn browser, li donem suport.
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const algorithm = { name: 'HMAC', hash: { name: 'SHA-256' } };
      const extractable = false;
      const keyUsages: KeyUsage[] = ['sign'];
      const key = await window.crypto.subtle.importKey('raw', keyData, algorithm, extractable, keyUsages);
      const signature = await window.crypto.subtle.sign('HMAC', key, encoder.encode(message));
      return Buffer.from(signature).toString('base64');
      
    } catch (error: any) {
      throw concatError(error, `Error creant la signatura d'autenticació del client API.`);
    }
  };

  protected parseAxiosException(e: AxiosError, url: string, errorMessage: ApiRequestOptions['errorMessage']): any {
    const { response, request, message } = e;
    if (!errorMessage) { errorMessage = {}; }
    // Si no hem rebut una resposta...
    if (!response) {
      throw { code: 500, message: request ? e : message };
    }
    const data: any = response.data;
    // Api d'exchanges.
    if (data?.msg) { errorMessage.message = `${errorMessage.message || ''} ${data.msg}${data.msg.endsWith('.') ? '' : '.'}`.trim(); }
    // Api de metacodi.
    if (!!data?.http_code && !!data.message) {
      if (data.message) { errorMessage.message = `${errorMessage.message || ''} ${data.message}${data.message.endsWith('.') ? '' : '.'}`.trim(); }
      throw {
        code: errorMessage?.code || data.api_code || data.http_code,
        message: errorMessage?.message || data.message,
      }
    }
    throw {
      ...errorMessage,
      requestCode: response.status,
      requestMessage: response.statusText,
      body: response.data,
      headers: response.headers,
      requestUrl: url,
      requestBody: request.body,
    };
  }

}


// ---------------------------------------------------------------------------------------------------
//  test
// ---------------------------------------------------------------------------------------------------
//  npx ts-node src/node-api-client.ts
// ---------------------------------------------------------------------------------------------------


export class TestApiClient extends ApiClient {
  debug = false;

  constructor(
    public options: ApiClientOptions & { apiBaseUrl?: string; apiIdUser?: number },
  ) {
    super(options);
    console.log('options =>', options);
  }


  // ---------------------------------------------------------------------------------------------------
  //  ApiClient implementation
  // ---------------------------------------------------------------------------------------------------

  override baseUrl(): string { return this.options?.apiBaseUrl || ''; }

  protected override async getAuthHeaders(method: HttpMethod, endpoint: string, params: any) {
    return {
      'Authorization': 'SERVER',
      'Authorization-User': this.options?.apiIdUser || 1,
    };
  }

  override async request(method: HttpMethod, endpoint: string, options?: ApiRequestOptions): Promise<any> {
    if (!options) { options = {}; } 
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    return super.request(method, endpoint, options);
  }

}

const test = async () => {
  Terminal.title(`Testing ApiClient`)

  const options: ApiClientOptions & { apiBaseUrl?: string; apiIdUser?: number} = {
    apiBaseUrl: 'https://scrownet.metacodi.com/dev/api',
    apiIdUser: 9,
  }

  try {

    const api = new TestApiClient(options);
  
    const params: ApiRequestOptions = { params: { AND: [['idEntidad', '=', 8], ['idProveedor', 'is', null], ['idCliente', 'is', null]] } };
  
    const cuentas = await api.post(`search/cuentas?rel=entidad,divisa`, params);
    
    Terminal.success(cuentas);

  } catch (error: any) {
    Terminal.error(error, /* exit */ false);
  }

};

test();