import { ClientRequest } from 'electron';

export interface MainProcessWebrequestsInterface extends ClientRequest {
   headers?: object[];
}
