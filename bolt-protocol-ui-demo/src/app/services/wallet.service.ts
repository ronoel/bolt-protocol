import { Injectable, signal } from '@angular/core';
import { AppConfig, UserData, UserSession } from '@stacks/connect';
import { showConnect } from '@stacks/connect';
import { environment } from './../../environments/environment';
import { Observable } from 'rxjs';

const appConfig = new AppConfig(['store_write', 'publish_data']);

const myAppName = 'BoltProto'; // shown in wallet pop-up
const myAppIcon = 'https://storage.googleapis.com/bitfund/boltproto-icon.png'; // shown in wallet pop-up
// const myAppIcon = 'https://boostaid.net/images/logo/boostaid-logo.png'; // shown in wallet pop-up

/**
 * Service responsible for managing the user's wallet and authentication status.
 */
@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private readonly userSession = new UserSession({ appConfig });;

  private readonly isLoggedInSignal = signal(false);
  private readonly network = environment.network;
    // environment.network === 'mainnet'
    //   ? new StacksMainnet()
    //   : environment.network === 'testnet'
    //     ? new StacksTestnet({ url: environment.apiUrl })
    //     : new StacksMocknet({ url: environment.apiUrl });

  constructor() {
    this.checkAuth();
    console.log('Wallet Service environment', environment.network);
  }

  /**
   * Checks if the user is authenticated and updates the `isLoggedInSignal` accordingly.
   */
  private checkAuth() {
    if (this.userSession.isUserSignedIn()) {
      const userData = this.userSession.loadUserData();
      this.isLoggedInSignal.set(true);

      

    } else {
      this.isLoggedInSignal.set(false);
    }
  }

  /**
   * Initiates the sign-in process for the user.
   * If the user is already signed in, it logs a message and returns.
   * If the user is not signed in, it shows a connect pop-up and updates the `isLoggedInSignal` when finished.
   */
  public signIn() {
    if (this.isLoggedInSignal()) {
      return;
    }
    showConnect({
      appDetails: {
        name: myAppName,
        icon: myAppIcon,
      },
      redirectTo: '/',
      onFinish: () => {
        this.isLoggedInSignal.set(true);
      },
      onCancel: () => {
        console.log('User cancelled'); // WHEN user cancels/closes pop-up
      }
    });
  }

  /**
   * Signs out the user if they are signed in.
   * If the user is not signed in, it logs a message and returns.
   */
  public signOut() {
    if (!this.isLoggedInSignal()) {
      return;
    }
    this.userSession.signUserOut();
    this.isLoggedInSignal.set(false);
  }

  /**
   * Checks if the user is currently signed in.
   * @returns `true` if the user is signed in, `false` otherwise.
   */
  public isLoggedIn() {
    return this.isLoggedInSignal();
  }

  /**
   * Retrieves the user data of the currently signed-in user.
   * @returns The user data.
   */
  public getUserData(): UserData {
    return this.userSession.loadUserData();
  }

  /**
   * Retrieves the identity address of the currently signed-in user.
   * @returns The identity address.
   */
  public getIdentityAddress() {
    return this.getUserData().identityAddress;
  }

  public getPublicKey() {
    return this.userSession.generateAndStoreTransitKey();
  }

  /**
   * Retrieves the STX address of the currently signed-in user.
   * @returns The STX address.
   */
  public getSTXAddress() {
    return environment.network === 'mainnet'
      ? this.getUserData().profile.stxAddress.mainnet
      : this.getUserData().profile.stxAddress.testnet;
  }

  public getNetwork() {
    return this.network;
  }

  public getApiUrl() {
    return environment.blockchainAPIUrl;
  }

  /**
   * Retrieves the balance of STX tokens in the user's wallet.
   * @returns An Observable that emits the balance of STX tokens.
   */
  public getSTXBalance(): Observable<number> {
    const address = this.getSTXAddress();
    return new Observable<number>((observer) => {
      fetch(`${this.getApiUrl()}/v2/accounts/${address}`)
        .then(response => response.json())
        .then(data => {
          observer.next(data.balance); // Convert from microSTX to STX
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
}
