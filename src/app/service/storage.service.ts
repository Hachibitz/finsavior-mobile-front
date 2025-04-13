import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private _readyPromise: Promise<void>;

  constructor(private storage: Storage) {
    this._readyPromise = this.init();
  }

  async init(): Promise<void> {
    if (!this._storage) {
      this._storage = await this.storage.create();
    }
  }

  async ready(): Promise<void> {
    return this._readyPromise;
  }

  async getStorage(): Promise<Storage> {
    await this.ready();
    if (!this._storage) {
      throw new Error('StorageService not initialized');
    }
    return this._storage;
  }

  async get(key: string): Promise<any> {
    const storage = await this.getStorage();
    return storage.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    const storage = await this.getStorage();
    return storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    const storage = await this.getStorage();
    return storage.remove(key);
  }

  async clear(): Promise<void> {
    const storage = await this.getStorage();
    return storage.clear();
  }
}