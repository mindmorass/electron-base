// standardize log formats

export interface LogServiceInterface {
  severity: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly';
  message: string;
}
  