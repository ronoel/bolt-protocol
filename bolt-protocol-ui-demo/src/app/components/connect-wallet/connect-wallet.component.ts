import { Component, effect, inject, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-connect-wallet',
  standalone: true,
  imports: [
    MatButtonModule
  ],
  templateUrl: './connect-wallet.component.html',
  styleUrl: './connect-wallet.component.scss'
})
export class ConnectWalletComponent {

  @Input()
  public description: string = "";

  public isLoggedIn = false;
  private walletService = inject(WalletService);

  constructor() {
    effect(() => {
      if (this.walletService.isLoggedIn()) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  connectWallet() {
    this.walletService.signIn();
  }

}
