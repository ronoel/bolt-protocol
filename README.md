<p align="center">
  <img src="https://storage.googleapis.com/bitfund/boltproto-icon.png" width="200" alt="Bolt Protocol Logo">
</p>

# Bolt Protocol

Bolt Protocol is designed to enable near-instant transactions for SIP-10 assets (tokens on the Stacks blockchain, like sBTC), improving the user experience and secured by the Bitcoin network.

# Introduction

Any dApp or wallet on Stacks can integrate Bolt Protocol to enable instant transactions and eliminate the friction of paying transaction fees with STX.

> Note: The current version (v1) only supports sBTC. Support for other SIP-10 tokens will be added in future releases.

We also offer a demo dApp on our website for users who want to try it out:

* **Website**: [https://boltproto.org/](https://boltproto.org/)

# Contact Us

* **X (Twitter)**: [@boltprotobtc](https://x.com/boltprotobtc)


## Key Features

-   **Instant Transfers:** Experience near real-time confirmed transactions.
-   **Trustless Verification:** Users can independently verify that transactions processed by the operator are valid and have been submitted to the Stacks blockchain.
-   **No Separate Gas Token:** Fees are paid in the same token being transferred (sBTC), simplifying the user experience—no need to acquire separate STX tokens.
-   **Non-Custodial:** Users always retain control of their private keys. Funds cannot be moved without the user's signature.
-   **Smart Contract:** Ensures a controlled environment where Bolt Protocol can quickly verify and process transactions, then persist them on-chain.
-   **Operator Model:** The protocol utilizes an operator that is responsible for coordinating and finalizing transactions on Stacks.
-   **No Channel Required:** Unlike other Bitcoin scaling solutions, Bolt Protocol doesn't require users to create channels, improving the user experience.

## Architecture

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

## Main functions of the Smart Contract (v1)

Contract address on Testnet:

```
ST3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02W1N0YJF.boltproto-sbtc-rc-1-1-0
```

## Non-Sponsored Functions

These functions must be submitted directly to the Stacks blockchain and require STX for transaction fees.

### 1. Deposit Funds on Bolt Contract

This function allows users to deposit sBTC into the Bolt Contract. The transaction requires STX for network fees and is processed directly on the Stacks blockchain.

```lisp
;;   Deposits tokens into a recipients wallet.
;;   Parameters:
;;     amount: uint                   The amount to deposit.
;;     recipient: principal           The recipient wallet.
;;     memo: (optional (buff 34))      Optional memo.
(deposit
    (amount uint)
    (recipient principal)
    (memo (optional (buff 34))))
```

### 2. Withdraw Funds from Bolt Contract

This function initiates a withdrawal request with timelock protection. The transaction requires STX for network fees and is processed directly on the Stacks blockchain.

```lisp
;;   Initiates a withdrawal request with timelock protection.
;;   Parameters:
;;     amount: uint  The amount to request for withdrawal.
(request-withdrawal 
    (amount uint))
```

## Sponsored Functions

These functions are sponsored by the Bolt Protocol operator, allowing users to pay fees in sBTC instead of STX. All sponsored functions must be submitted through the Bolt API.

> Note: The minimum fee accepted by the protocol is 10 satoshis.
> 
> [See example implementation](cookbook/transfer.md)

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

## Bolt API (v1)

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

### Submit Transaction

Submits a serialized transaction to the Bolt Protocol.

```http
POST /api/v1/transaction
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
    "success": true,
    "txid": "5bed517eb7b58082d39df49240b75f1246584cd56a1b1af69c64295b86334291"
}
```


## Network Availability

Bolt Protocol is currently operational on Testnet. Mainnet support is coming soon.

<!-- ## Roadmap

[List of planned future features]

## Security Considerations

[Detailed explanation of security assumptions, risks, and mitigations] -->


