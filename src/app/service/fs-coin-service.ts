import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FS_COIN_BALANCE, FS_COIN_EARN } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class FsCoinService {

  constructor(private http: HttpClient) {}

  // Recupera o saldo atual de FScoins
  getBalance(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.http
        .get<number>(`${FS_COIN_BALANCE}`)
        .subscribe({
          next: balance => resolve(balance),
          error: e => reject(e.error)
        });
    });
  }

  // Dispara um anúncio e retorna quantas coins foram geradas
  earnCoins(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.http
        .post<number>(`${FS_COIN_EARN}`, {})
        .subscribe({
          next: earned => resolve(earned),
          error: e => reject(e.error)
        });
    });
  }
}
