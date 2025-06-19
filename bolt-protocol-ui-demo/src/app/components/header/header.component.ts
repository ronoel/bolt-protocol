import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WalletService } from '../../services/wallet.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  public identityAddress: string | undefined;
  public isLoggedIn = false;

  private walletService = inject(WalletService);
  private dialog = inject(MatDialog);

  constructor() {
    effect(() => {
      if (this.walletService.isLoggedIn()) {
        this.identityAddress = this.walletService.getSTXAddress();
        this.isLoggedIn = true;
      } else {
        this.identityAddress = undefined;
        this.isLoggedIn = false;
      }
    });
  }

  connectWallet() {
    this.walletService.signIn();
  }


  showDisconnectPrompt() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
      message: 'Do you want to disconnect your wallet?'
      },
      panelClass: 'dark-theme-dialog',
      backdropClass: 'dark-backdrop',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.walletService.signOut();
      }
    });
  }

}
