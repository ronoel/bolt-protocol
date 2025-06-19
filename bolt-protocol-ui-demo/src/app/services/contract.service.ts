import { Observable, throwError } from 'rxjs';
import { TransactionInfoService } from './transaction-info.service';
import { WalletService } from './wallet.service';
import {
  AnchorMode, PostConditionMode,
  fetchCallReadOnlyFunction,
  ReadOnlyFunctionOptions,
  ClarityValue,
  PostCondition,
} from '@stacks/transactions';
import { openContractCall, ContractCallOptions, ContractCallSponsoredOptions, SponsoredFinishedTxData } from '@stacks/connect';
import { StacksNetworkName } from '@stacks/network';
import { environment } from '../../environments/environment';

export abstract class ContractService {

  // private network: StacksNetworkName = environment.network as StacksNetworkName;

  constructor(
    protected contractName: string,
    protected contractAddress: string,
    protected walletService: WalletService,
    protected transactionInfoService: TransactionInfoService
  ) {

  }

  protected callReadOnlyFunction(functionName: string, functionArgs: ClarityValue[]): Promise<ClarityValue> {
    const options = this.createGenericReadOnlyFunctionOptions(functionName, functionArgs);
    return fetchCallReadOnlyFunction(options);
  }

  protected callPublicFunction(
    functionName: string,
    functionArgs: ClarityValue[],
    resolve: Function,
    reject: Function,
    postConditions?: (string | PostCondition)[],
    postConditionMode: PostConditionMode = PostConditionMode.Deny
  ): Promise<void> {

    const options = this.createGenericContractCallOptions(
      functionName,
      functionArgs,
      resolve,
      reject,
      postConditions,
      postConditionMode);
      return openContractCall(options).then(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
  }

  protected callSponsoredFunction(
    functionName: string,
    functionArgs: ClarityValue[],
    resolve: Function,
    reject: Function,
    postConditions?: (string | PostCondition)[],
    postConditionMode: PostConditionMode = PostConditionMode.Deny
  ): Promise<void> {

    const options = this.createGenericSponsoredContractCallOptions(
      functionName,
      functionArgs,
      resolve,
      reject,
      postConditions,
      postConditionMode);
      return openContractCall(options).then(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
  }

  protected createGenericReadOnlyFunctionOptions(functionName: string, functionArgs: ClarityValue[]): ReadOnlyFunctionOptions {
    return {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      // ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hello-world
      // contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      // contractName: 'hello-world',
      functionName: functionName,
      functionArgs: functionArgs,
      network: environment.network as StacksNetworkName, // This is now properly typed
      // client: { baseUrl: environment.blockchainAPIUrl }, // optional, defaults inferred from network
      // client: { baseUrl: 'https://api.platform.hiro.so/v1/ext/d1087667a742b16e54ea8a64f12dbc28/stacks-blockchain-api' }, // optional, defaults inferred from network
      senderAddress: this.walletService.getSTXAddress()
    };
  }
  // { contractName, contractAddress, functionName, functionArgs, senderAddress, network, client: _client, 

  protected createGenericContractCallOptions(
    functionName: string,
    functionArgs: ClarityValue[],
    resolve: Function,
    reject: Function,
    postConditions?: (string | PostCondition)[],
    postConditionMode: PostConditionMode = PostConditionMode.Deny): ContractCallOptions {

    return {
      anchorMode: AnchorMode.Any,
      network: environment.network as StacksNetworkName, // Replace "devnet" with the properly typed value
      // client: { baseUrl: environment.apiUrl }, // optional, defaults inferred from network
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: functionName,
      functionArgs: functionArgs,
      postConditionMode: postConditionMode,
      postConditions: postConditions,
      onFinish: (response) => resolve(response.txId),
      onCancel: () => reject(new Error('User cancelled the transaction')),
    };
  }

  protected createGenericSponsoredContractCallOptions(
    functionName: string,
    functionArgs: ClarityValue[],
    resolve: Function,
    reject: Function,
    postConditions?: (string | PostCondition)[],
    postConditionMode: PostConditionMode = PostConditionMode.Deny): ContractCallSponsoredOptions {

    return {
      sponsored: true,
      anchorMode: AnchorMode.Any,
      network: environment.network as StacksNetworkName, // Replace "devnet" with the properly typed value
      // client: { baseUrl: environment.apiUrl }, // optional, defaults inferred from network
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: functionName,
      functionArgs: functionArgs,
      postConditionMode: postConditionMode,
      postConditions: postConditions,// (data: SponsoredFinishedTxData)
      onFinish: (response: SponsoredFinishedTxData) => resolve(response.stacksTransaction),
      onCancel: () => reject(new Error('User cancelled the transaction')),
    };
  }


  protected handleError(error: any): Observable<never> {
    console.error('Error:', error);
    return throwError(() => new Error(`An error occurred: ${error.message}`));
  }
}
