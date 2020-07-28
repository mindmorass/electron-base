import ElectronStore, * as store from 'electron-store';
import * as yaml from 'js-yaml';

export class MainProcessConfigService {

  private store = new ElectronStore({
	fileExtension: 'yaml',
	serialize: yaml.safeDump,
	deserialize: yaml.safeLoad
  });

  constructor() {}

  public read(k: string, defaultValue: string | number) {
    // to read from application config file

    return this.store.get(k, defaultValue);
  }

  public write(k: string, v: string | number | boolean) {
    // to write into application config file

    this.store.set(k, v);
  }

  public delete(k: string) {
    // to delete a key from the application config

    this.store.delete(k);
  }


}
