import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { bytesToHex } from "@stacks/common";
import { environment } from '../../environments/environment';

interface WalletBalance {
  address: string;
  balance: bigint;
}

@Injectable({
  providedIn: 'root'
})
export class BoltProtocolService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private feeRateCache = new Map<string, Observable<number>>();
  
  private getClientHeaders(): HttpHeaders {
    return new HttpHeaders().set('x-client-source', 'boltproto-website');
  }

  sendTransaction(transaction: any): Observable<any> {
    const serializedTx = bytesToHex(transaction.serializeBytes());
    return this.http.post(
      `${this.apiUrl}/transaction/${environment.supportedAsset.sBTC.contractToken}`, 
      { serializedTx },
      { headers: this.getClientHeaders() }
    );
  }
  getWalletBalance(address: string, token: string): Observable<WalletBalance> {
    return this.http.get<any>(`${this.apiUrl}/wallet/${address}/${token}/balance`).pipe(
      map(response => ({
        address: response.address,
        balance: BigInt(response.balance)
      }))
    );
  }

  getWalletTransactions(address: string, token: string): Observable<WalletBalance> {
    return this.http.get<any>(`${this.apiUrl}/wallet/${address}/${token}/transactions`);
    // .pipe(
    //   map(response => ({
    //     address: response.address,
    //     balance: BigInt(response.balance)
    //   }))
    // );
  }

  sponsorTransaction(transaction: any, fee: bigint): Observable<any> {
    const serializedTx = bytesToHex(transaction.serializeBytes());
    return this.http.post(
      `${this.apiUrl}/sponsor/${environment.supportedAsset.sBTC.contractToken}/transaction`, 
      { serializedTx, fee: fee.toString() },
      { headers: this.getClientHeaders() }
    );
  }

  getFeeFundBalance(address: string, token: string): Observable<bigint> {
    return this.http.get<any>(`${this.apiUrl}/sponsor/${token}/balance/${address}`).pipe(
      map(response => (BigInt(response.balance)))
    );
  }

  getFeeRate(token: string): Observable<number> {
    if (!this.feeRateCache.has(token)) {
      const feeRate$ = this.http.get<any>(`${this.apiUrl}/transaction/${token}/fee-rate`).pipe(
        map(response => response.feeRate),
        shareReplay({ bufferSize: 1, refCount: true, windowTime: 300000 })
      );
      this.feeRateCache.set(token, feeRate$);
    }
    return this.feeRateCache.get(token)!;
  }
}