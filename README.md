<p align="center">
  <img src="https://storage.googleapis.com/bitfund/boltproto-icon.png" width="100" alt="Bolt Protocol Logo">
</p>

# Bolt Protocol

Bolt Protocol is designed to improve the user experience for wallets and dApps on the Stacks blockchain.

Bolt Protocol solves two critical pain points for Stacks users:
1. **Pay transaction fees with sBTC**: Users no longer need to hold STX to pay for transactions. All fees can be paid directly in sBTC.
2. **Instant transfers**: Transactions between Bolt wallets are confirmed instantly, avoiding the typical Stacks blockchain confirmation times.

> Note: Bolt Protocol currently supports only sBTC. Support for other SIP-10 tokens will be added in future releases.

We offer a Bolt Wallet implementation on our website for users to use:

* **Website**: [https://boltproto.org/](https://boltproto.org/)
> Note: This is a Bolt Wallet implementation. To pay transaction fees in other dApps using sBTC, you'll need a wallet that integrates with Bolt Protocol.

* **Wallet Extension** [Github Repository](https://github.com/ronoel/leather-io-extension)

> Note: The current version of this extension is just a proof of concept for the Bolt Protocol integration, allowing you to pay transaction fees with sBTC on the Stacks Blockchain.

## Demo Video

Watch our demo showcasing:

[![Bolt Protocol Demo](https://img.youtube.com/vi/GtUmMsOsCnE/0.jpg)](https://youtu.be/GtUmMsOsCnE)

---

## How It Works

The [Bolt Wallet](https://boltproto.org/) lets you connect any Stacks wallet and experience the benefits of the protocol:

1. **Deposit**: Transfer your sBTC to your Bolt Wallet
2. **Transfer**: Send sBTC between Bolt Wallets instantly
3. **Withdraw**: Move your tokens back to your Stacks wallet

All operations within the dApp require only sBTC—no STX is needed for transaction fees.

---

# Integration Overview

Bolt Protocol enables two main integration paths for developers and wallets:

### 1. Native sBTC Transfers (Bolt Contract Functions)

Use Bolt Protocol's smart contract to transfer sBTC between wallets, with fees paid in sBTC and enable instant transfers.

- See [Native sBTC Transfer Guide](cookbook/transfer-stacks-to-stacks.md) for example usage.

### 2. Pay Transaction Fees with sBTC for Any Contract

Use Bolt Protocol to pay transaction fees in sBTC for *any* contract call on the Stacks blockchain. This allows wallets to offer a seamless experience where users never need STX for gas, even when interacting with third-party contracts.

- See [How to Pay Transaction Fees with sBTC for Any Contract](guides/pay-fee-with-sbtc.md) for integration steps.

---

# Contact Us

* **X (Twitter)**: [@boltprotobtc](https://x.com/boltprotobtc)

---

# Integration Details

## For Wallets

Wallets can integrate Bolt Protocol to:
- Allow users to pay transaction fees with sBTC instead of STX
- Enable instant sBTC transfers between Bolt wallets

Refer to the guides above for implementation details.

## For dApps

dApps can support Bolt Protocol directly, enabling users to pay fees in sBTC even if their wallet does not natively support Bolt.

---

## Key Features

-   **Instant Transfers:** Experience near real-time confirmed transactions.
-   **Trustless Verification:** Users can independently verify that transactions processed by the operator are valid and have been submitted to the Stacks blockchain.
-   **No Separate Gas Token:** Fees are paid in the same token being transferred (sBTC), simplifying the user experience—no need to acquire separate STX tokens.
-   **Non-Custodial:** Users always retain control of their private keys. Funds cannot be moved without the user's signature.
-   **Smart Contract:** Ensures a controlled environment where Bolt Protocol can quickly verify and process transactions, then persist them on-chain.
-   **Operator Model:** The protocol utilizes an operator that is responsible for coordinating and finalizing transactions on Stacks.
-   **No Channel Required:** Unlike other Bitcoin scaling solutions, Bolt Protocol doesn't require users to create channels, improving the user experience.

---

## How Bolt Protocol Works

```pgsql
                           |
                           | (1) Deposit sBTC
                           |     into contract
            +--------------v-------------+
            |       Smart Contract       |
            +--------------+-------------+
                           |
                           | (2) & (3) Transfer sBTC
                           v
            +------------------------------+
            |          Operator            |
            | (Processes transactions)     |
            +------------------------------+
                           | (4) Confirm transaction
                           | (5) Submit final transaction
                           v
        +-----------------------------------+
        |         Stacks Blockchain         |
        +-----------------------------------+
```

---

## Main functions of the Smart Contract (v2)

Contract address on Mainnet:

[SP3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02ZHQCMVJ.boltproto-sbtc-v2](https://explorer.hiro.so/txid/SP3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02ZHQCMVJ.boltproto-sbtc-v2?chain=mainnet)

Contract address on Testnet:

[ST3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02W1N0YJF.boltproto-sbtc-rc-2-0-0](https://explorer.hiro.so/txid/ST3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02W1N0YJF.boltproto-sbtc-rc-2-0-0?chain=testnet)

---

## Contract Functions: Native sBTC Transfers

These functions are sponsored by the Bolt Protocol operator, allowing users to pay fees in sBTC instead of STX. All sponsored functions must be submitted through the Bolt API.

> [See example implementation](cookbook/transfer-stacks-to-stacks.md)

### Transfer Function Matrix

Choose the appropriate function based on the source and destination of your transfer:

| From \ To      | Bolt Wallet        | Stacks Wallet      |
|----------------|--------------------|--------------------|
| Bolt Wallet    | `transfer-bolt-to-bolt`| `transfer-bolt-to-stacks`|
| Stacks Wallet  | `transfer-stacks-to-bolt`| `transfer-stacks-to-stacks`|

All sponsored functions share the same parameter structure:

```lisp
;;   Parameters for all sponsored functions:
;;     amount: uint                   The transfer amount.
;;     recipient: principal           The destination wallet.
;;     memo: (optional (buff 34))      Optional memo.
;;     fee: uint                      Fee amount in sBTC (min 10 satoshis)
(function-name 
    (amount uint)
    (recipient principal)
    (memo (optional (buff 34)))
    (fee uint))
```

Function descriptions:
- `transfer-bolt-to-bolt`: Transfer between Bolt Protocol wallets
- `transfer-bolt-to-stacks`: Transfer from Bolt Protocol to Stacks wallet
- `transfer-stacks-to-bolt`: Deposit from Stacks wallet to Bolt Protocol
- `transfer-stacks-to-stacks`: Direct transfer between Stacks wallets

---

## Pay Transaction Fees with sBTC for Any Contract

Bolt Protocol enables users to pay transaction fees in sBTC for contract calls to *any* Stacks smart contract, not just Bolt's own contract.

- See [How to Pay Transaction Fees with sBTC for Any Contract](guides/pay-fee-with-sbtc.md) for a step-by-step integration guide.

---

## Bolt API (v1)

**API Endpoints:**

- **Mainnet:** `https://boltproto.org/api/v1`
- **Testnet:** `https://test.boltproto.org/api/v1`

### Get Wallet Balance

Retrieves the balance information for a specific wallet address and token.

```http
GET /api/v1/wallet/:address/:token/balance
```

Example:
```http
GET https://boltproto.org/api/v1/wallet/ST3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02W1N0YJF/sbtc-token/balance
```

Response:
```json
{
    "address": "<address>",
    "balance": "1000000"
}
```

### Get Transaction History

Retrieves transaction history for a specific wallet address and token.

```http
GET /api/v1/wallet/:address/:token/transactions/sbtc-token
```

Example:
```http
GET https://boltproto.org/api/v1/wallet/ST3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02W1N0YJF/sbtc-token/transactions
```

Response:
```json
{
    "items": [
        {
            "txId": "faac8c81f79a7740341861dc689b03809145c3756450881018c8fa4859fe8495",
            "token": "sbtc-token",
            "amount": "1000000",
            "fee": "10",
            "sender": "ST3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02W1N0YJF",
            "recipient": "ST3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02W1N0YJF",
            "functionName": "transfer-bolt-to-stacks",
            "timestamp": {}
        }
    ],
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1
}
```

The response includes pagination details and a list of transaction items with the following fields:
- `txId`: The transaction identifier- `token`: The token type (currently only "sbtc-token")
- `amount`: Transaction amount in satoshis
- `fee`: Fee amount in satoshis
- `sender`: The sending wallet address
- `recipient`: The receiving wallet address
- `functionName`: The smart contract function used
- `timestamp`: Transaction timestamp

### Fee Calculation in sBTC

To estimate the fee in sBTC:

1. **Get the estimated fee in microSTX** for your contract call (using standard Stacks fee estimation).
2. **Fetch the current fee rate** by making a GET request:

    ```http
    GET https://boltproto.org/api/v1/transaction/sbtc-token/fee-rate
    ```

    Example response:
    ```json
    {
        "feeRate": 200
    }
    ```

3. **Calculate the sBTC fee** by dividing the estimated fee in microSTX by the `feeRate` value:

    ```
    sBTC fee (in sats) = estimated fee in microSTX / feeRate
    ```

    For example, if the estimated fee is `4,000` microSTX and the `feeRate` is `200`:

    ```
    sBTC fee = 4,000 / 200 = 20 sats
    ```

### Submit Transaction

Submits a serialized transaction to the Bolt Protocol.

```http
POST /api/v1/transaction/sbtc-token
```

Request Body:
```json
{
    "serializedTx": "<serializedTx>"
}
```

Response:
```json
{
        "txid": "5bed517eb7b58082d39df49240b75f1246584cd56a1b1af69c64295b86334291"
}
```

---

## Roadmap

Here are the next steps planned for Bolt Protocol:

1. **Fee Optimization**: Improve the fee calculation mechanism for sBTC transactions to ensure optimal efficiency and cost-effectiveness.

2. **Wallet Integration**: Implement Bolt Protocol support in major Stacks wallets:
   - Leather Wallet integration
   - XVerse Wallet integration

3. **Governance Model**: Introduce a governance token to decentralize the protocol's decision-making process and allow community participation in the protocol's evolution.


