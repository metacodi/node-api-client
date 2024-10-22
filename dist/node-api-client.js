"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestApiClient = exports.ApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const functions_1 = require("./functions");
class ApiClient {
    constructor(options) {
        this.options = Object.assign(Object.assign({}, this.defaultOptions), options);
    }
    get apiKey() { var _a; return (_a = this.options) === null || _a === void 0 ? void 0 : _a.apiKey; }
    get apiSecret() { var _a; return (_a = this.options) === null || _a === void 0 ? void 0 : _a.apiSecret; }
    get apiPassphrase() { var _a; return (_a = this.options) === null || _a === void 0 ? void 0 : _a.apiPassphrase; }
    get isTest() { var _a; return !!((_a = this.options) === null || _a === void 0 ? void 0 : _a.isTest); }
    get defaultOptions() {
        return {
            isTest: false,
        };
    }
    setCredentials(data) {
        this.options = Object.assign(Object.assign({}, this.options), data);
    }
    get(endpoint, options) { return this.request('GET', endpoint, options); }
    post(endpoint, options) { return this.request('POST', endpoint, options); }
    put(endpoint, options) { return this.request('PUT', endpoint, options); }
    delete(endpoint, options) { return this.request('DELETE', endpoint, options); }
    request(method, endpoint, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!options) {
                    options = {};
                }
                const isPublic = options.isPublic === undefined ? false : !!options.isPublic;
                const headers = options.headers === undefined ? undefined : options.headers;
                const params = options.params === undefined ? undefined : options.params;
                const encodeParams = options.encodeParams === undefined ? true : !!options.encodeParams;
                const strictValidation = options.strictValidation === undefined ? false : options.strictValidation;
                const timeout = options.timeout === undefined ? undefined : options.timeout;
                const timeoutErrorMessage = options.timeoutErrorMessage === undefined ? undefined : options.timeoutErrorMessage;
                const baseUrl = options.baseUrl || this.baseUrl();
                const config = {
                    method,
                    headers: Object.assign({}, headers),
                };
                if (!!timeout) {
                    config.timeout = timeout;
                }
                if (!!timeoutErrorMessage) {
                    config.timeoutErrorMessage = timeoutErrorMessage;
                }
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
                        const authHeaders = yield this.getAuthHeaders(method, `/${endpoint}`, body);
                        config.headers = Object.assign(Object.assign({}, config.headers), authHeaders);
                    }
                    catch (error) {
                        throw (0, functions_1.concatError)(error, `Error establint els headers d'autenticació del client API.`);
                    }
                }
                const protocol = baseUrl.startsWith('http') ? '' : 'https://';
                config.url = protocol + [baseUrl, endpoint].join('/');
                return (0, axios_1.default)(config).then(response => {
                    if (response.status >= 300) {
                        throw response;
                    }
                    return response.data;
                }).catch(e => this.parseAxiosException(e, config.url, options.errorMessage));
            }
            catch (error) {
                const url = (endpoint || '').split('?')[0];
                throw (0, functions_1.concatError)(error, `Error executant la consulta ${method} ${url} del client API.`);
            }
        });
    }
    requestSyncTestNotWorking(method, endpoint, options) {
        try {
            if (!options) {
                options = {};
            }
            const isPublic = options.isPublic === undefined ? false : !!options.isPublic;
            const headers = options.headers === undefined ? undefined : options.headers;
            const params = options.params === undefined ? undefined : options.params;
            const encodeParams = options.encodeParams === undefined ? true : !!options.encodeParams;
            const strictValidation = options.strictValidation === undefined ? false : options.strictValidation;
            const timeout = options.timeout === undefined ? undefined : options.timeout;
            const timeoutErrorMessage = options.timeoutErrorMessage === undefined ? undefined : options.timeoutErrorMessage;
            const baseUrl = options.baseUrl || this.baseUrl();
            const config = {
                method,
                headers: Object.assign({}, headers),
            };
            if (!!timeout) {
                config.timeout = timeout;
            }
            if (!!timeoutErrorMessage) {
                config.timeoutErrorMessage = timeoutErrorMessage;
            }
            const { body, query } = this.resolveData(method, params || {}, { encodeParams, strictValidation });
            if (query) {
                const concat = endpoint.includes('?') ? (endpoint.endsWith('?') ? '' : '&') : '?';
                endpoint += concat + query;
            }
            if (method === 'POST' || method === 'PUT') {
                config.data = body;
            }
            const protocol = baseUrl.startsWith('http') ? '' : 'https://';
            config.url = protocol + [baseUrl, endpoint].join('/');
        }
        catch (error) {
            const url = (endpoint || '').split('?')[0];
            throw (0, functions_1.concatError)(error, `Error executant la consulta ${method} ${url} del client API.`);
        }
    }
    splitURL(url) {
        const res = /^(https:\/\/|http:\/\/)?([^\/]*)(:\d+)?([^?]*)(.*)/gi.exec(url);
        return {
            protocol: res[1].replace(/\/\/$/gi, '') || '',
            hostname: res[2] || '',
            port: (res[3] || '').replace(':', ''),
            path: res[4] || '',
            query: (res[5] || ''),
        };
    }
    resolveData(method, data = {}, options) {
        if (!options) {
            options = {};
        }
        const strictValidation = options.strictValidation === undefined ? false : options.strictValidation;
        const encodeParams = options.encodeParams === undefined ? true : options.encodeParams;
        const d = {};
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
            };
        }
        else {
            return {
                query: '',
                body: JSON.stringify(d),
            };
        }
    }
    getAuthHeaders(method, endpoint, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { apiKey, apiSecret, apiPassphrase } = this;
            const timestamp = Date.now();
            const message = this.buildSignMessage(timestamp, method, endpoint, params);
            const signature = yield this.signMessage(message, apiSecret);
            const headers = {
                'ACCESS-SIGN': signature,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-KEY': apiKey,
                'ACCESS-PASSPHRASE': apiPassphrase,
            };
            return headers;
        });
    }
    buildSignMessage(timestamp, method, endpoint, params) {
        const mParams = String(JSON.stringify(params)).slice(1, -1);
        const formatedParams = String(mParams).replace(/\\/g, '');
        const data = (method === 'GET' || method === 'DELETE') ? this.formatQuery(params) : formatedParams;
        return `${timestamp}${method}${endpoint}${data}`;
    }
    formatQuery(params) {
        if (!!params && JSON.stringify(params).length !== 2) {
            const serialisedParams = this.serialiseParams(params, { encodeValues: true });
            return '?' + serialisedParams;
        }
        else {
            return '';
        }
    }
    serialiseParams(request = {}, options) {
        if (!options) {
            options = {};
        }
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
    }
    ;
    signMessage(message, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (typeof crypto_1.createHmac === 'function') {
                    return (0, crypto_1.createHmac)('sha256', secret).update(message).digest('base64');
                }
                const encoder = new TextEncoder();
                const keyData = encoder.encode(secret);
                const algorithm = { name: 'HMAC', hash: { name: 'SHA-256' } };
                const extractable = false;
                const keyUsages = ['sign'];
                const key = yield window.crypto.subtle.importKey('raw', keyData, algorithm, extractable, keyUsages);
                const signature = yield window.crypto.subtle.sign('HMAC', key, encoder.encode(message));
                return Buffer.from(signature).toString('base64');
            }
            catch (error) {
                throw (0, functions_1.concatError)(error, `Error creant la signatura d'autenticació del client API.`);
            }
        });
    }
    ;
    parseAxiosException(e, url, errorMessage) {
        const { response, request, message } = e;
        if (!errorMessage) {
            errorMessage = {};
        }
        if (!response) {
            throw { code: 500, message: request ? e : message };
        }
        const data = response.data;
        if (data === null || data === void 0 ? void 0 : data.msg) {
            errorMessage.message = `${errorMessage.message || ''} ${data.msg}${data.msg.endsWith('.') ? '' : '.'}`.trim();
        }
        if (!!(data === null || data === void 0 ? void 0 : data.http_code) && !!data.message) {
            if (data.message) {
                errorMessage.message = `${errorMessage.message || ''} ${data.message}${data.message.endsWith('.') ? '' : '.'}`.trim();
            }
            throw {
                code: (errorMessage === null || errorMessage === void 0 ? void 0 : errorMessage.code) || data.api_code || data.http_code,
                message: (errorMessage === null || errorMessage === void 0 ? void 0 : errorMessage.message) || data.message,
            };
        }
        throw Object.assign(Object.assign({}, errorMessage), { requestCode: response.status, requestMessage: response.statusText, body: response.data, headers: response.headers, requestUrl: url, requestBody: request.body });
    }
}
exports.ApiClient = ApiClient;
class TestApiClient extends ApiClient {
    constructor(options) {
        super(options);
        this.options = options;
        this.debug = false;
        console.log('options =>', options);
    }
    baseUrl() { var _a; return ((_a = this.options) === null || _a === void 0 ? void 0 : _a.apiBaseUrl) || ''; }
    getAuthHeaders(method, endpoint, params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return {
                'Authorization': 'SERVER',
                'Authorization-User': ((_a = this.options) === null || _a === void 0 ? void 0 : _a.apiIdUser) || 1,
            };
        });
    }
    request(method, endpoint, options) {
        const _super = Object.create(null, {
            request: { get: () => super.request }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (!options) {
                options = {};
            }
            options.headers = options.headers || {};
            options.headers['Content-Type'] = 'application/json';
            return _super.request.call(this, method, endpoint, options);
        });
    }
}
exports.TestApiClient = TestApiClient;
const test = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Testing ApiClient`);
    const options = {
        apiBaseUrl: 'https://scrownet.metacodi.com/dev/api',
        apiIdUser: 9,
    };
    try {
        const api = new TestApiClient(options);
        const params = { params: { AND: [['idEntidad', '=', 8], ['idProveedor', 'is', null], ['idCliente', 'is', null]] } };
        const cuentas = yield api.post(`search/cuentas?rel=entidad,divisa`, params);
        console.log(cuentas);
    }
    catch (error) {
        console.log("ERROR:", error);
    }
});
//# sourceMappingURL=node-api-client.js.map