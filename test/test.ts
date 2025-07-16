
import { Terminal } from "@metacodi/node-utils";

import { ApiClientOptions, ApiRequestOptions } from '../src/node-api-client-types';

import { TestApiClient } from './test-api-client';


// ---------------------------------------------------------------------------------------------------
//  test
// ---------------------------------------------------------------------------------------------------
//  npx ts-node test/test.ts
// ---------------------------------------------------------------------------------------------------

const exec = async (endpoint: string, options?: any) => {
  
  const api = new TestApiClient(options);
  
  const params: ApiRequestOptions = { params: { AND: [['idEntidad', '=', 8], ['idProveedor', 'is', null], ['idCliente', 'is', null]] } };

  const cuentas = await api.post<any>(`search/cuentas?rel=entidad,divisa`, params);
  return cuentas;
}

const test = async () => {
  Terminal.title(`Testing ApiClient`)

  const options: ApiClientOptions & { apiBaseUrl?: string; apiIdUser?: number} = {
    apiBaseUrl: 'https://scrownet.metacodi.com/dev/api',
    apiIdUser: 9,
  }

  try {

    // const api = new TestApiClient(options);
  
    // const params: ApiRequestOptions = { params: { AND: [['idEntidad', '=', 8], ['idProveedor', 'is', null], ['idCliente', 'is', null]] } };
  
    const cuentas = await exec(`search/cuentas?rel=entidad,divisa`, options);
    
    Terminal.success(cuentas);

  } catch (error: any) {
    Terminal.error(error, /* exit */ false);
  }

};

// test();