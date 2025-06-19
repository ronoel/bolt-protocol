import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';
import { TransactionInfo } from '../../interfaces/transaction-info.interface';
import { TransactionInfoService } from '../../services/transaction-info.service';
import { Subscription } from 'rxjs';
import { SMART_CONTRACT_ERRORS } from './smart-contract-errors';

@Component({
  selector: 'app-processing-transaction-info',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './processing-transaction-info.component.html',
  styleUrls: ['./processing-transaction-info.component.scss']
})
export class ProcessingTransactionInfoComponent implements OnInit, OnDestroy {
  @Input() transactionInfo!: TransactionInfo;
  @Output() transactionComplete = new EventEmitter<string>();

  currentStatus: 'pending' | 'success' | 'abort_by_post_condition' | 'abort_by_response' = 'pending';
  uri: string = '';
  private statusSubscription?: Subscription;
  errorCode?: number;

  private readonly STATUS_MESSAGES = {
    pending: 'Your transaction is being processed. This may take a few minutes.',
    success: 'Your transaction was processed successfully!',
    abort_by_post_condition: 'The transaction was aborted due to unmet conditions.',
    abort_by_response: 'The transaction was rejected by the blockchain.'
  };

  private readonly STATUS_TITLES = {
    pending: 'Pending',
    success: 'Success',
    abort_by_post_condition: 'Aborted',
    abort_by_response: 'Rejected'
  };

  constructor(private transactionInfoService: TransactionInfoService) { }

  ngOnInit() {
    this.uri = `https://explorer.hiro.so/txid/${this.transactionInfo.txId}?api=${environment.blockchainAPIUrl}`;
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
          } else {
            if (response.status === 'abort_by_post_condition' && response.result) {
              this.errorCode = this.extractErrorCode(response.result);
            }
          }
        },
        error: (error) => {
            console.error('Error monitoring transaction:', error);
        }
      });
  }

  private extractErrorCode(result: any): number | undefined {
    // Extract error code from smart contract response
    // Example: "(err u4001)" -> 4001
    if (result.repr){
      const match = result.repr.match(/u(\d+)/);
      if (match) {
        return parseInt(match[1]);
      }
    }
    return undefined;
  }

  onComplete() {
    this.transactionComplete.emit(this.currentStatus);
  }

  getStatusTitle(): string {
    return this.STATUS_TITLES[this.currentStatus];
  }

  getMessage(): string {
    if (this.errorCode && SMART_CONTRACT_ERRORS[this.errorCode]) {
      return SMART_CONTRACT_ERRORS[this.errorCode];
    }
    return this.STATUS_MESSAGES[this.currentStatus];
  }
}