# Abstract Api Client

```typescript
import { ApiClient } from '@metacodi/node-api-client';


export class Server extends ApiClient {

  // ---------------------------------------------------------------------------------------------------
  //  request api backend examples
  // ---------------------------------------------------------------------------------------------------

  requestUsers() {
    const params = { 'deleted', 'is', null };
    const users = await this.post(`search/users`, { params });
    return Promise.resolve(users);
  }

  requestGoogleMaps(googleParams: any) {
    const params = { ...googleParams };
    // Overrides this.baseUrl during this.request calls.
    const baseUrl = `https://api.ggogle.maps/services/`;
    const response = this.get(`geolocation`, { baseUrl, params });
    return Promise.resolve(response);
  }

  // ---------------------------------------------------------------------------------------------------
  //  ApiClient implementation
  // ---------------------------------------------------------------------------------------------------

  baseUrl(): string { return this.config?.apiBackend; }

  protected async getAuthHeaders(method: HttpMethod, endpoint: string, params: any) {
    return {
      'Authorization': 'SERVER',
      'Authorization-User': this.config?.apiUserId || 1,
    }; 
  }

  async request(method: HttpMethod, endpoint: string, options?: ApiRequestOptions): Promise<any> {

    if (!options) { options = {}; }
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';

    return super.request(method, endpoint, options);
  }
}
```
