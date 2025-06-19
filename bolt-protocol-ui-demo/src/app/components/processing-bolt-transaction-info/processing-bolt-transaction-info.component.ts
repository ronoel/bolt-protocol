import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';
import { BoltTransactionResponse } from '../../services/bolt-contract-sbtc.service';

export interface BoltTransactionInfo {
  title: string;
  transaction: BoltTransactionResponse;
}

@Component({
  selector: 'app-processing-bolt-transaction-info',
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './processing-bolt-transaction-info.component.html',
  styleUrl: './processing-bolt-transaction-info.component.scss'
})
export class ProcessingBoltTransactionInfoComponent implements OnInit {

  @Input() boltTransaction!: BoltTransactionInfo;
  @Output() transactionComplete = new EventEmitter<string>();

  currentStatus: 'pending' | 'success' | 'abort_by_post_condition' | 'abort_by_response' = 'pending';
  uri: string = '';

  private readonly STATUS_TITLES = {
    pending: 'Pending',
    success: 'Success',
    abort_by_post_condition: 'Aborted',
    abort_by_response: 'Rejected'
  };
  
  ngOnInit() {
    console.log('boltTransaction: ',this.boltTransaction);

    if(this.boltTransaction.transaction?.txid) {
      this.currentStatus = 'success';
      this.uri = `https://explorer.hiro.so/txid/${this.boltTransaction.transaction.txid}?api=${environment.blockchainAPIUrl}`;
    } else {
      this.currentStatus = 'abort_by_response';
    }
  }

  getStatusTitle(): string {
    return this.STATUS_TITLES[this.currentStatus];
  }

  onComplete() {
    this.transactionComplete.emit(this.currentStatus);
  }
}
