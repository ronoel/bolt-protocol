import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BinanceService {
  private baseUrl = 'https://api.binance.com/api/v3';

  constructor(private http: HttpClient) {}

  getBitcoinPrice(startTime: number): Observable<number> {
    return this.http.get<any[]>(`${this.baseUrl}/klines`, {
      params: {
        symbol: 'BTCUSDT',
        interval: '1d',
        startTime: startTime,
        limit: 1
      }
    }).pipe(
      map(response => Number(response[0][4])) // Close price from kline data
    );
  }

  getTimestampFromDate(date: Date): number {
    return date.getTime();
  }
}
