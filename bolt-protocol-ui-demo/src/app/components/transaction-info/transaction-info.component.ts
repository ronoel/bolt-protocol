import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';
import { TransactionInfo } from '../../interfaces/transaction-info.interface';
import { TransactionInfoService } from '../../services/transaction-info.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transaction-info',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: 'transaction-info.component.html',
  styleUrls: ['transaction-info.component.scss']
})
export class TransactionInfoComponent implements OnInit, OnDestroy {
  transactionInfo!: TransactionInfo;
  currentStatus: 'pending' | 'success' | 'abort_by_post_condition' | 'abort_by_response' = 'pending';
  uri: string = '';
  private statusSubscription?: Subscription;
  errorCode?: number;

  constructor(
    private dialogRef: MatDialogRef<TransactionInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TransactionInfo,
    private transactionInfoService: TransactionInfoService
  ) {
    this.transactionInfo = data;
  }

  ngOnInit() {
    this.uri = `https://explorer.hiro.so/txid/0x${this.transactionInfo.txId}?api=${environment.blockchainAPIUrl}`;
    this.monitorTransaction();
  }

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  private monitorTransaction() {
    this.statusSubscription = this.transactionInfoService
      .getTransactionStatus(this.transactionInfo.txId)
      .subscribe({
        next: (response) => {
          this.currentStatus = response.status;
          if (response.status === 'abort_by_response' && response.result) {
            this.errorCode = this.extractErrorCode(response.result);
          }
        },
        error: (error) => {
          console.error('Error monitoring transaction:', error);
        }
      });
  }

  private extractErrorCode(result: any): number | undefined {
    if (typeof result === 'string' && result.startsWith('u')) {
      return parseInt(result.substring(1));
    }
    return undefined;
  }

  onComplete() {
    this.dialogRef.close(this.currentStatus);
  }

  // get currentStatusInfo() {
  //   return this.transactionInfo.statusInfo[this.currentStatus];
  // }

  getMessage(): string {
    // if (this.currentStatus === 'abort_by_response') {
    //   const statusInfo = this.transactionInfo.statusInfo[this.currentStatus];
    //   if (this.errorCode && statusInfo.errors[this.errorCode]) {
    //     return statusInfo.errors[this.errorCode];
    //   }
      // return statusInfo.defaultMessage;
    // }
    // return 'message' in this.currentStatusInfo ? this.currentStatusInfo.message : this.currentStatusInfo.defaultMessage;
    return '';
  }
}
