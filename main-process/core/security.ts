import { session } from 'electron';

export class MainProcessSecurity {

    public contentSecurityPolicy(): void {

      // Content Security Policy (CSP)
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
      // https://electronjs.org/docs/tutorial/security#6-define-a-content-security-policy
      // TODO: find out if/how to set nonce in material/angular and remove unsafe-*

      session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({ responseHeaders: Object.assign({
          'Content-Security-Policy': [
            'script-src * \'self\' data: \'unsafe-inline\' \'unsafe-hashes\' \'unsafe-eval\'',
            'img-src * \'self\'',
            'style-src \'self\' \'unsafe-inline\'',
            'font-src \'self\' data:'
          ]
        }, details.responseHeaders)});
      });
    }

    public disableNodeEval(electronWindow: any): void {

      // disable eval, don't use eval, ever!
      // https://electronjs.org/docs/tutorial/security#7-override-and-disable-eval

      electronWindow.eval = global.eval = function () {
        throw new Error(`Sorry, this app does not support window.eval().`);
      };
    }

  }