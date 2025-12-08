import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FS_COIN_BALANCE, FS_COIN_EARN } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class FsCoinService {

  private balanceSubject = new BehaviorSubject<number>(0);
  public balance$ = this.balanceSubject.asObservable();

  constructor(private http: HttpClient) {
    this.refreshBalance();
  }

  refreshBalance() {
      this.getBalanceRequest().then(bal => this.balanceSubject.next(bal));
  }

  private getBalanceRequest(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.http.get<number>(`${FS_COIN_BALANCE}`).subscribe({
          next: balance => resolve(balance),
          error: e => reject(e.error)
        });
    });
  }

  async getBalance(): Promise<number> {
    const bal = await this.getBalanceRequest();
    this.balanceSubject.next(bal); // Atualiza quem está ouvindo
    return bal;
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

  updateLocalBalance(newBalance: number) {
      this.balanceSubject.next(newBalance);
  }
}
