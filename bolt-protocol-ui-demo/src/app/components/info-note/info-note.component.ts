import { Component } from '@angular/core';

@Component({
  selector: 'app-info-note',
  standalone: true,
  template: `
    <section class="info-note">
      <ul>
        <li>Connect your Stacks Wallet to access your Bolt Wallet.</li>
        <li>Deposit sBTC into your Bolt Wallet directly from your Stacks Wallet.</li>
        <li><strong>Instant transfer sBTC</strong> between Bolt Wallets.</li>
        <li>Retain full custody of your tokens at all times.</li>
        <li>For all transactions made with your Bolt Wallet, fees are paid in sBTC.</li>
        <!-- <li>To <strong>pay for transactions on the Stacks blockchain with sBTC</strong>, top up your Fee Fund and ensure you're using a wallet that supports Bolt Protocol.</li> -->
        <li>Benefit from a simple integration pathway that enables any wallet to adopt Bolt Protocol for fast, secure, and user-friendly crypto payments.</li>
      </ul>
    </section>
  `,
  styles: [`
    .info-note {
      background-color: var(--background-alt);
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      width: 100%;
      box-sizing: border-box;
    }

    h3 {
      color: var(--secondary);
      margin: 0 0 1.5rem;
      font-size: 1.25rem;
      font-weight: 500;
    }

    p {
      margin: 1rem 0;
      color: var(--text);
      line-height: 1.6;
      word-wrap: break-word;
    }

    ul {
      padding-left: 1.5rem;
      margin: 1rem 0;
      list-style-position: outside;
    }

    li {
      margin-bottom: 0.75rem;
      color: var(--text);
      padding-right: 1rem;
    }

    @media (max-width: 600px) {
      .info-note {
        padding: 1rem;
      }

      ul {
        padding-left: 1.25rem;
      }
    }
  `]
})
export class InfoNoteComponent { }
