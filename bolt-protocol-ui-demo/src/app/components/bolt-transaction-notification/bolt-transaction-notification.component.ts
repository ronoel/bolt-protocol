import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BoltTransaction } from '../../interfaces/transaction-info.interface';
import { TokenDecimalsPipe } from "../../pipes/token-decimals.pipe";
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bolt-transaction-notification',
  imports: [TokenDecimalsPipe, MatIconModule],
  templateUrl: './bolt-transaction-notification.component.html',
  styleUrl: './bolt-transaction-notification.component.scss'
})
export class BoltTransactionNotificationComponent {

  @Input() boltTransaction!: BoltTransaction;
  @Output() transactionComplete = new EventEmitter<string>();

  onComplete() {
    this.transactionComplete.emit();
  }

}
