

// ---------------------------------------------------------------------------------------------------
//  tractament d'errors
// ---------------------------------------------------------------------------------------------------

export interface ErrorObject {
  code?: number;
  message: string,
  data?: any;
};

/** Concatena errors retornats en cascada ascendent.
 *
 * ```typescript
 * // Exemple d'una funció de baix nivell que propaga l'error informant del nivell actual des d'on s'ha capturat.
 * function executeQuery(sql: string) {
 *   try {
 *     db.execute(query);  
 *   } catch (error: any) {
 *     throw concatError(error, `Error executing query: ${sql}.`);
 *   }
 * }
 * ```
 * @param error 
 * @param message 
 * @returns 
 */
export const concatError = (error: any, message: string): ErrorObject => {
  const internal = getErrorMessage(error);
  const err = message ? `${message} ${internal}` : internal;
  error = getErrorObject(error);
  error.message = err;
  return error;
};

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') { return error; }
  if (typeof error?.message === 'string') { return error.message; }
  if (typeof error?.error?.message === 'string') { return error.error.message; }
  if (typeof error === 'object') { return JSON.stringify(error); }
  if (typeof error?.toString === 'function') { return error.toString(); }
  return `${error}`;
};

export const getErrorObject = (error: any): ErrorObject => {
  if (typeof error === 'string') { return { message: error }; }
  if (typeof error === 'object') {
    if (typeof error.message !== 'string') { error.message = 'Unknown error.'; }
    return error;
  }
  if (typeof error?.toString === 'function') { return { message: error.toString() }; }
  return { message: 'Unknown error.' };
};
