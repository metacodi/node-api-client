import { ApiClient } from '../src/node-api-client';
import { ApiClientOptions, ApiRequestOptions, HttpMethod } from '../src/node-api-client-types';


export class TestApiClient extends ApiClient {
  debug = false;

  constructor(
    // public options: ApiClientOptions & { apiBaseUrl?: string; apiIdUser?: number },
    public options: any,
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