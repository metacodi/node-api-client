# @metacodi/node-api-client

Abstracció d'una API basada en el paquet `axios` per implementar en el runtime de NodeJS.

> Si el projecte necessita implementar un websocket, aleshores és millor instal·lar el package `@metacodi/node-ws-client` que també implementa les funcionalitats per realitzar consultes a una api de backend a més de les pròpies d'un websocket.


## Install

```sh
npm i @metacodi@node-api-client
```

## Use

`my-server-types.ts`
```typescript
import { ApiClientOptions } from '@metacodi/node-api-client';

export interface ServerOptions extends ApiClientOptions {
  apiBaseUrl: string;
  apiIdUser: number;
}
```


`my-server.ts`

```typescript
import { ApiClient } from '@metacodi/node-api-client';

import { ServerOptions } from './my-server-types';


export class MyServer extends ApiClient {

  constructor(
    public options: ServerOptions,
  ) {
    super(options);
  }


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
    const baseUrl = `https://api.google.maps/services/`;
    const response = this.get(`geolocation`, { baseUrl, params });
    return Promise.resolve(response);
  }

  // ---------------------------------------------------------------------------------------------------
  //  ApiClient implementation
  // ---------------------------------------------------------------------------------------------------

  baseUrl(): string { return this.options.apiBaseUrl; }

  protected async getAuthHeaders(method: HttpMethod, endpoint: string, params: any) {
    return {
      'Authorization': 'SERVER',
      'Authorization-User': this.options.apiIdUser || 1,
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
