"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorObject = exports.getErrorMessage = exports.concatError = void 0;
;
const concatError = (error, message) => {
    const internal = (0, exports.getErrorMessage)(error);
    const err = message ? `${message} ${internal}` : internal;
    error = (0, exports.getErrorObject)(error);
    error.message = err;
    return error;
};
exports.concatError = concatError;
const getErrorMessage = (error) => {
    var _a;
    if (typeof error === 'string') {
        return error;
    }
    if (typeof (error === null || error === void 0 ? void 0 : error.message) === 'string') {
        return error.message;
    }
    if (typeof ((_a = error === null || error === void 0 ? void 0 : error.error) === null || _a === void 0 ? void 0 : _a.message) === 'string') {
        return error.error.message;
    }
    if (typeof error === 'object') {
        return JSON.stringify(error);
    }
    if (typeof (error === null || error === void 0 ? void 0 : error.toString) === 'function') {
        return error.toString();
    }
    return `${error}`;
};
exports.getErrorMessage = getErrorMessage;
const getErrorObject = (error) => {
    if (typeof error === 'string') {
        return { message: error };
    }
    if (typeof error === 'object') {
        if (typeof error.message !== 'string') {
            error.message = 'Unknown error.';
        }
        return error;
    }
    if (typeof (error === null || error === void 0 ? void 0 : error.toString) === 'function') {
        return { message: error.toString() };
    }
    return { message: 'Unknown error.' };
};
exports.getErrorObject = getErrorObject;
//# sourceMappingURL=functions.js.map