import { Injectable } from '@angular/core';
import { catchError, from, map, Observable } from 'rxjs';
import { TransactionInfoService } from './transaction-info.service';
import { WalletService } from './wallet.service';
import { environment } from '../../environments/environment';
import {
  AssetString,
  Cl,
  cvToValue,
  FungiblePostCondition,
  PostConditionMode,
} from '@stacks/transactions';
import { ClarityUtil } from './utils/clarity.util';
import { ContractService } from './contract.service';

@Injectable({
  providedIn: 'root'
})
export class sBTCTokenService extends ContractService {

  private readonly contractTokenName = environment.supportedAsset.sBTC.contractToken;
  private asset: AssetString = `${environment.supportedAsset.sBTC.contractAddress}.${environment.supportedAsset.sBTC.contractName}::${environment.supportedAsset.sBTC.contractToken}`;

  constructor(
    walletService: WalletService,
    transactionInfoService: TransactionInfoService
  ) {
    super(
      environment.supportedAsset.sBTC.contractName,
      environment.supportedAsset.sBTC.contractAddress,
      walletService,
      transactionInfoService);
  }

  getAsset(): AssetString {
    return this.asset;
  }

  getContractAddress(): `${string}.${string}` {
    return `${this.contractAddress}.${this.contractName}`;
  }

  getContractTokenName(): string {
    return this.contractTokenName;
  }

  getBalance(): Observable<bigint> {
    return from(this.callReadOnlyFunction('get-balance', [Cl.principal(this.walletService.getSTXAddress())])).pipe(
      map(ClarityUtil.extractResponse),
      map((response) => cvToValue(response)),
      catchError(this.handleError)
    );
  }

  mint(amount: number, recipient: string): Observable<any> {
          return from(new Promise<any>((resolve, reject) => {

              this.callPublicFunction(
                  'mint',
                  [
                      Cl.uint(amount),
                      Cl.principal(recipient),
                  ],
                  resolve,
                  reject,
                  [],
                  PostConditionMode.Deny
              );
          }));
      }

}
