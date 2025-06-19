import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoingeckoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';

  constructor(private http: HttpClient) {}

  /**
   * It's not being used in the current version of the app due the limitation of the free plan of the API
   * @param date 
   * @returns 
   */
  getBitcoinPriceByDate(date: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/coins/bitcoin/history?vs_currency=usd&date=${date}`);
  }

  formatDateForApi(date: Date): string {
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  }
}
