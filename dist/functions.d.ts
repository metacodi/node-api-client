export interface ErrorObject {
    code?: number;
    message: string;
    data?: any;
}
export declare const concatError: (error: any, message: string) => ErrorObject;
export declare const getErrorMessage: (error: any) => string;
export declare const getErrorObject: (error: any) => ErrorObject;
//# sourceMappingURL=functions.d.ts.map