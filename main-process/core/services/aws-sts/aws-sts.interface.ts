export interface MainProcessAwsStsInterface {
  argument: any,
  call: 'getCallerIdentity' | 'assumeRoleWithSAML'
}