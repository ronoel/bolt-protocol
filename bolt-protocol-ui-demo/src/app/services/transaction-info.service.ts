import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TransactionInfoComponent } from '../components/transaction-info/transaction-info.component';
import { Observable, from, switchMap, map, catchError, of, timer, expand, takeWhile } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Possible transaction status values returned by the blockchain API
 */
type TransactionStatus = 'pending' | 'success' | 'abort_by_post_condition' | 'abort_by_response';

/**
 * Structure of the transaction status response
 */
interface TransactionResponse {
  status: TransactionStatus;
  result?: any;
  block_height?: number;
}

/**
 * Service responsible for handling blockchain transaction information and status monitoring.
 * Provides functionality to track transaction status and display transaction information to users.
 */
@Injectable({
  providedIn: 'root'
})
export class TransactionInfoService {
  /**
   * Interval in milliseconds between transaction status checks
   */
  private readonly TRANSACTION_CHECK_INTERVAL = 5000;

  constructor(public dialog: MatDialog) { }

  /**
   * Displays a dialog with transaction information
   * @param txId The transaction ID to display
   * @param title Custom title for the dialog (defaults to 'Transaction submitted')
   */
  showTransactionDialog(txId: string, title: string = 'Transaction submitted'): void {
    this.dialog.open(TransactionInfoComponent, {
      data: {
        title: title,
        txId: txId
      }
    });
  }

  /**
   * Validates if a given status string is a valid TransactionStatus
   * @param status The status string to validate
   * @returns True if the status is valid, acts as type guard
   */
  private isValidStatus(status: string): status is TransactionStatus {
    return ['pending', 'success', 'abort_by_post_condition', 'abort_by_response'].includes(status);
  }

  /**
   * Makes a single request to fetch the current status of a transaction
   * @param txId The transaction ID to check
   * @returns Observable of TransactionResponse
   * @throws Error if the status is invalid
   */
  private fetchTransactionStatus(txId: string): Observable<TransactionResponse> {
    return from(fetch(`${environment.blockchainAPIUrl}/extended/v1/tx/${txId}`))
      .pipe(
        switchMap(response => from(response.json())),
        map(data => {
          const status = data.tx_status;
          
          if (!this.isValidStatus(status)) {
            throw new Error(`Invalid transaction status: ${status}`);
          }

          return status !== 'pending'
            ? { status, result: data.tx_result, block_height: data.block_height }
            : { status };
        }),
        catchError(error => {
          console.error('Error fetching transaction status:', error);
          throw error; // Re-throw to handle in the component
        })
      );
  }

  /**
   * Monitors a transaction's status by polling the blockchain API at regular intervals
   * until a final status is received.
   * 
   * @param txId The transaction ID to monitor
   * @returns Observable that emits transaction status updates
   * 
   * @example
   * ```typescript
   * this.transactionInfoService.getTransactionStatus(txId).subscribe({
   *   next: (response) => {
   *     if (response.status === 'success') {
   *       // Handle successful transaction
   *     }
   *   },
   *   error: (error) => {
   *     // Handle error
   *   }
   * });
   * ```
   */
  getTransactionStatus(txId: string): Observable<TransactionResponse> {
    return timer(this.TRANSACTION_CHECK_INTERVAL).pipe(
      switchMap(() => this.fetchTransactionStatus(txId)),
      expand(result => 
        result.status === 'pending' 
          ? timer(this.TRANSACTION_CHECK_INTERVAL).pipe(switchMap(() => this.fetchTransactionStatus(txId)))
          : of(result)
      ),
      takeWhile(result => result.status === 'pending', true)
    );
  }
}