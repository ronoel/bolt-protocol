import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BoltContractSBTCService } from '../../services/bolt-contract-sbtc.service';
import { WalletService } from '../../services/wallet.service';
import { TokenDecimalsPipe } from '../../pipes/token-decimals.pipe';
import { BoltTransactionInfo } from '../processing-bolt-transaction-info/processing-bolt-transaction-info.component';

@Component({
  selector: 'app-bolt-wallet-ui-deposit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TokenDecimalsPipe,
  ],
  templateUrl: './bolt-wallet-ui-deposit.component.html',
  styleUrls: ['./bolt-wallet-ui-deposit.component.scss']
})
export class BoltWalletUiDepositComponent {
  @Input() stacksWalletBalance: bigint = BigInt(0);
  @Output() close = new EventEmitter<void>();
  @Output() transactionSubmitted = new EventEmitter<BoltTransactionInfo>();

  public amount: bigint = BigInt(0);
  public memo: string = '';
  public isProcessing = false;
  public exceedsBalance = false;
  public displayUnit: 'sBTC' | 'SAT' = 'sBTC';

  private walletService = inject(WalletService);
  private boltContractSBTCService = inject(BoltContractSBTCService);
  private snackBar = inject(MatSnackBar);
  private tokenDecimalsPipe = new TokenDecimalsPipe();

  public onSubmit() {
    if (!this.amount || this.isProcessing) return;
    
    if (this.exceedsBalance) {
      this.snackBar.open('Insufficient funds. Please enter a lower amount.', 'Close', {
        duration: 5000
      });
      return;
    }

    this.isProcessing = true;
    const atomicAmount = Number(this.amount);
    const recipientAddress = this.walletService.getSTXAddress(); // Self-transfer

    // Perform stacks-to-bolt transfer
    this.boltContractSBTCService.transferStacksToBolt(
      atomicAmount,
      recipientAddress,
      this.memo
    ).subscribe({
      next: (response) => {
        // This is a regular transaction, not a bolt transaction
        if (response.txid) {
          this.transactionSubmitted.emit({
            transaction: {
              txid: response.txid
            },
            title: 'Deposit to Bolt Wallet'
          });
        }
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Error sending deposit transaction:', error);
        this.snackBar.open('Error sending transaction. Please try again.', 'Close', {
          duration: 5000
        });
        this.isProcessing = false;
      }
    });
  }

  public setMaxAmount() {
    const fee = BigInt(this.getFee());
    this.amount = this.stacksWalletBalance > fee ? this.stacksWalletBalance - fee : BigInt(0);
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
    const maxAmount = this.stacksWalletBalance > fee ? this.stacksWalletBalance - fee : BigInt(0);
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
