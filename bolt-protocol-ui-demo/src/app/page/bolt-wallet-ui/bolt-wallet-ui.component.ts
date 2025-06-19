import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConnectWalletComponent } from '../../components/connect-wallet/connect-wallet.component';
import { InfoNoteComponent } from '../../components/info-note/info-note.component';
import { ProcessingTransactionInfoComponent } from '../../components/processing-transaction-info/processing-transaction-info.component';
import { ProcessingBoltTransactionInfoComponent } from '../../components/processing-bolt-transaction-info/processing-bolt-transaction-info.component';
import { BoltTransactionNotificationComponent } from '../../components/bolt-transaction-notification/bolt-transaction-notification.component';
import { BoltWalletUiSendComponent } from '../../components/bolt-wallet-ui-send/bolt-wallet-ui-send.component';
import { BoltWalletUiDepositComponent } from '../../components/bolt-wallet-ui-deposit/bolt-wallet-ui-deposit.component';
import { BoltWalletUiWithdrawComponent } from '../../components/bolt-wallet-ui-withdraw/bolt-wallet-ui-withdraw.component';
import { BoltWalletUiFeeFundComponent } from '../../components/bolt-wallet-ui-fee-fund/bolt-wallet-ui-fee-fund.component';

import { WalletService } from '../../services/wallet.service';
import { BoltProtocolService } from '../../services/bolt-protocol.service';
import { SseClientService } from '../../services/sse.service';
import { BoltContractSBTCService } from '../../services/bolt-contract-sbtc.service';
import { sBTCTokenService } from '../../services/sbtc-token.service';

import { TokenDecimalsPipe } from '../../pipes/token-decimals.pipe';
import { environment } from '../../../environments/environment';
import { TransactionInfo } from '../../interfaces/transaction-info.interface';
import { BoltTransactionInfo } from '../../components/processing-bolt-transaction-info/processing-bolt-transaction-info.component';

@Component({
  selector: 'app-bolt-wallet-ui',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    ConnectWalletComponent,
    InfoNoteComponent,
    ProcessingTransactionInfoComponent,
    ProcessingBoltTransactionInfoComponent,
    BoltTransactionNotificationComponent,
    BoltWalletUiSendComponent,
    BoltWalletUiDepositComponent,
    BoltWalletUiWithdrawComponent,
    BoltWalletUiFeeFundComponent
  ],
  templateUrl: './bolt-wallet-ui.component.html',
  styleUrl: './bolt-wallet-ui.component.scss'
})
export class BoltWalletUiComponent {
  public isLoggedIn = false;
  public isProcessing = false;
  
  public walletAddress: string = '';
  public boltWalletBalance: bigint = BigInt(0);
  public feeFundBalance: bigint = BigInt(0);
  public displayUnit: 'sBTC' | 'SAT' = 'SAT';
  
  public transactionInfo: TransactionInfo | null = null;
  public boltTransactionInfo: BoltTransactionInfo | null = null;
  public paymentReceived: any;
  public showSendModal = false;
  public showDepositModal = false;
  public showWithdrawModal = false;
  public showFeeFundModal = false;
  public stacksWalletBalance: bigint = BigInt(0);

  public readonly tokenImageUrl = environment.supportedAsset.sBTC.image;
  public network = environment.network;

  private walletService = inject(WalletService);
  private boltProtocolService = inject(BoltProtocolService);
  private boltContractSBTCService = inject(BoltContractSBTCService);
  private sbtcTokenService = inject(sBTCTokenService);
  private snackBar = inject(MatSnackBar);

  constructor(private sseClientService: SseClientService) {
    effect(() => {
      if (this.walletService.isLoggedIn()) {
        this.initialize();
        this.setupSseConnection();
        this.getTransactions();
        this.getFeeRate();
      } else {
        this.reset();
      }
    });
  }

  private initialize() {
    this.isLoggedIn = true;
    this.walletAddress = this.walletService.getSTXAddress();

    // Get Stacks wallet balance
    this.sbtcTokenService.getBalance().subscribe({
      next: (balance) => this.stacksWalletBalance = balance,
      error: (error) => console.error('Error fetching sBTC balance:', error)
    });

    // Get Bolt wallet balance
    this.boltProtocolService.getWalletBalance(
      this.walletAddress,
      environment.supportedAsset.sBTC.contractToken
    ).subscribe({
      next: (wallet) => this.boltWalletBalance = wallet.balance,
      error: (error) => console.error('Error fetching Bolt wallet balance:', error)
    });
    
    // Get Fee Fund balance
    this.boltProtocolService.getFeeFundBalance(
      this.walletAddress,
      environment.supportedAsset.sBTC.contractToken
    ).subscribe({
      next: (balance) => this.feeFundBalance = balance,
      error: (error) => console.error('Error fetching fee fund balance:', error)
    });
  }

  private getFeeRate() {
    this.boltProtocolService.getFeeRate(environment.supportedAsset.sBTC.contractToken)
      .subscribe({
        next: (feeRate) => {
          console.log('Fee Rate:', feeRate);
        },
        error: (error) => console.error('Error fetching fee rate:', error)
      });
  }

  private reset() {
    this.isLoggedIn = false;
    this.isProcessing = false;
    this.boltWalletBalance = BigInt(0);
    this.feeFundBalance = BigInt(0);
  }

  private setupSseConnection(): void {
    const address = this.walletService.getSTXAddress();
    if (!address) return;

    this.sseClientService.connect(address).subscribe({
      next: (data: any) => {
        if (!environment.production) {
          console.log('SSE Event received:', data);
        }
        if (data.type === 'new-transaction') {
          this.paymentReceived = data.transaction;
        }
      },
      error: (error) => {
        if (!environment.production) {
          console.error('SSE connection error:', error);
        }
      }
    });
  }

  private getTransactions() {
    this.boltProtocolService.getWalletTransactions(
      this.walletAddress, 
      environment.supportedAsset.sBTC.contractToken
    ).subscribe({
      next: (transactions) => {
        console.log('Transactions:', transactions);
      },
      error: (error) => {
        console.error('Error fetching transactions:', error);
      }
    });
  }

  public copyAddress() {
    navigator.clipboard.writeText(this.walletAddress);
    this.snackBar.open('Address copied', 'Close', {
      duration: 3000
    });
  }

  public formatBalance(amount: bigint): string {
    if (this.displayUnit === 'SAT') {
      return `${amount.toLocaleString()} SAT`;
    }
    return `${new TokenDecimalsPipe().transform(amount, 'sBTC')} sBTC`;
  }

  public toggleDisplayUnit() {
    this.displayUnit = this.displayUnit === 'sBTC' ? 'SAT' : 'sBTC';
  }

  public topUpBoltWallet() {
    this.showDepositModal = true;
  }

  public closeDepositModal() {
    this.showDepositModal = false;
  }

  public handleDepositTransaction(boltTransactionInfo: BoltTransactionInfo) {
    // For Stacks->Bolt transfers, we need to use transactionInfo instead of boltTransactionInfo
    // as it's a regular blockchain transaction, not a bolt transaction
    if (boltTransactionInfo.transaction && boltTransactionInfo.transaction.txid) {
      this.transactionInfo = {
        txId: boltTransactionInfo.transaction.txid,
        title: boltTransactionInfo.title || 'Deposit to Bolt Wallet'
      };
    } else {
      // Fallback to bolt transaction info if needed
      this.boltTransactionInfo = boltTransactionInfo;
    }
    this.showDepositModal = false;
  }

  public withdrawToBitcoin() {
    this.showWithdrawModal = true;
  }

  public closeWithdrawModal() {
    this.showWithdrawModal = false;
  }

  public handleWithdrawTransaction(boltTransactionInfo: BoltTransactionInfo) {
    // For Bolt->Stacks transfers, we need to use transactionInfo instead of boltTransactionInfo
    // as it's a regular blockchain transaction, not a bolt transaction
    if (boltTransactionInfo.transaction && boltTransactionInfo.transaction.txid) {
      this.transactionInfo = {
        txId: boltTransactionInfo.transaction.txid,
        title: boltTransactionInfo.title || 'Withdraw to Stacks Wallet'
      };
    } else {
      // Fallback to bolt transaction info if needed
      this.boltTransactionInfo = boltTransactionInfo;
    }
    this.showWithdrawModal = false;
  }

  public sendToBoltWallet() {
    this.showSendModal = true;
  }

  public closeSendModal() {
    this.showSendModal = false;
  }

  public handleSendTransaction(boltTransactionInfo: BoltTransactionInfo) {
    this.boltTransactionInfo = boltTransactionInfo;
    this.showSendModal = false;
  }

  public chargeFeeFund() {
    this.showFeeFundModal = true;
  }

  public closeFeeFundModal() {
    this.showFeeFundModal = false;
  }

  public handleFeeFundTransaction(boltTransactionInfo: BoltTransactionInfo) {
    if (boltTransactionInfo.transaction && boltTransactionInfo.transaction.txid) {
      this.transactionInfo = {
        txId: boltTransactionInfo.transaction.txid,
        title: boltTransactionInfo.title || 'Deposit to Fee Fund'
      };
    } else {
      this.boltTransactionInfo = boltTransactionInfo;
    }
    this.showFeeFundModal = false;
  }

  public onTransactionComplete() {
    this.initialize();
    this.transactionInfo = null;
    this.boltTransactionInfo = null;
    this.paymentReceived = null;
  }
}
