import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BoltContractSBTCService } from '../../services/bolt-contract-sbtc.service';
import { WalletService } from '../../services/wallet.service';
import { BoltProtocolService } from '../../services/bolt-protocol.service';
import { TokenDecimalsPipe } from '../../pipes/token-decimals.pipe';
// import { TokenAmountPipe } from '../../pipes/token-amount.pipe';
import { BoltTransactionInfo } from '../processing-bolt-transaction-info/processing-bolt-transaction-info.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-bolt-wallet-ui-send',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TokenDecimalsPipe,
    // TokenAmountPipe
  ],
  templateUrl: './bolt-wallet-ui-send.component.html',
  styleUrls: ['./bolt-wallet-ui-send.component.scss']
})
export class BoltWalletUiSendComponent implements OnInit {
  @Input() boltWalletBalance: bigint = BigInt(0);
  @Output() close = new EventEmitter<void>();
  @Output() transactionSubmitted = new EventEmitter<BoltTransactionInfo>();

  public amount: bigint = BigInt(0);
  public recipientAddress: string = '';
  public memo: string = ''; // Added memo field
  public isProcessing = false;
  public exceedsBalance = false;
  public displayUnit: 'sBTC' | 'SAT' = 'sBTC';

  private walletService = inject(WalletService);
  private boltContractSBTCService = inject(BoltContractSBTCService);
  private boltProtocolService = inject(BoltProtocolService);
  private snackBar = inject(MatSnackBar);
  private tokenDecimalsPipe = new TokenDecimalsPipe();

  ngOnInit() {
    // Initialize component
  }

  public onSubmit() {
    if (!this.amount || !this.recipientAddress || this.isProcessing) return;
    
    if (this.exceedsBalance) {
      this.snackBar.open('Insufficient funds. Please enter a lower amount.', 'Close', {
        duration: 5000
      });
      return;
    }

    this.isProcessing = true;
    const atomicAmount = Number(this.amount);

    // Perform bolt-to-bolt transfer with optional memo
    this.boltContractSBTCService.transferBoltToBolt(
      atomicAmount,
      this.recipientAddress,
      this.memo // Pass the memo field
    ).subscribe({
      next: (response) => {
        this.transactionSubmitted.emit({
          transaction: response,
          title: 'Bolt Transfer'
        });
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Error sending Bolt transfer:', error);
        this.snackBar.open('Error sending transaction. Please try again.', 'Close', {
          duration: 5000
        });
        this.isProcessing = false;
      }
    });
  }

  public setMaxAmount() {
    const fee = BigInt(this.getFee());
    this.amount = this.boltWalletBalance > fee ? this.boltWalletBalance - fee : BigInt(0);
    this.exceedsBalance = false;
  }

  public getFee(): number {
    return this.boltContractSBTCService.getFee();
  }

  public validateAmount(event: any) {
    // Only allow numbers
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // Invalid character, prevent input
      event.preventDefault();
    }
  }

  public onAmountInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Remove any non-numeric characters
    const cleanValue = value.replace(/[^0-9]/g, '');

    // Convert to BigInt, defaulting to 0 if empty
    const numericValue = cleanValue ? BigInt(cleanValue) : BigInt(0);

    // Set the amount
    this.amount = numericValue;
    
    // Check if amount exceeds balance
    const fee = BigInt(this.getFee());
    const maxAmount = this.boltWalletBalance > fee ? this.boltWalletBalance - fee : BigInt(0);
    this.exceedsBalance = numericValue > maxAmount;
  }

  public formatBalanceForDisplay(amount: bigint): string {
    if (this.displayUnit === 'SAT') {
      return `${amount.toLocaleString()} SAT`;
    }
    return `${this.tokenDecimalsPipe.transform(amount, 'sBTC')} sBTC`;
  }
  
  public closeModal() {
    this.close.emit();
  }
}
