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
ST3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02W1N0YJF.boltproto-sbtc-rc-1-0-0
```

### 1. Deposit Funds on Bolt Contract

This function allows users to deposit sBTC into the Bolt Contract. The transaction is processed on the Stacks blockchain and requires STX for transaction fees. Once deposited, funds can be used for instant transfers within the protocol.

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

### 1.1 Sponsored Deposit

This function allows users to deposit funds into the Bolt Contract while paying fees in sBTC. The Bolt Operator acts as a sponsor to enable fee payment in sBTC instead of STX. The deposited amount must be greater than the fee.

```lisp
;;   Deposits tokens from an authorized sponsor operator with fee handling.
;;   Parameters:
;;     amount: uint                   The deposit amount (must exceed fee).
;;     recipient: principal           The recipient wallet.
;;     memo: (optional (buff 34))      Optional memo.
;;     fee: uint                      The fee amount for the deposit.
(sponsored-deposit 
    (amount uint)
    (recipient principal)
    (memo (optional (buff 34)))
    (fee uint))
```

### 2. Withdraw Funds from Bolt Contract

This function initiates a withdrawal request for funds from the Bolt Contract. The withdrawal process includes a timelock protection mechanism. When called, it validates the user's balance, moves the requested amount to a withdrawal-requested state, and records the block height for timelock purposes. The withdrawal can only be completed after the timelock period expires.

```lisp
;;   Initiates a withdrawal request with timelock protection.
;;   Parameters:
;;     amount: uint  The amount to request for withdrawal.
(request-withdrawal 
    (amount uint))
```

### 3. Internal Transfer*

This transaction enables fund transfers between wallets within the protocol. It must be marked as sponsored and submitted to the Bolt API. The transaction is confirmed by the Bolt Protocol.

> Note: The minimum fee accepted by the protocol is 10 satoshis.
> 
> [See example implementation](cookbook/transfer.md)

```lisp
;;   Executes a transfer between wallets within the contract.
;;   Parameters:
;;     amount: uint                   The transfer amount.
;;     recipient: principal           The destination wallet.
;;     memo: (optional (buff 34))      Optional memo.
;;     fee: uint                      Fee amount
(internal-transfer 
    (amount uint)
    (recipient principal)
    (memo (optional (buff 34)))
    (fee uint))
```

### 4. External Transfer*

This transaction enables fund transfers from Bolt Protocol to a Stacks wallet. It must be marked as sponsored and submitted to the Bolt API. Although Bolt Protocol confirms the transaction for the sender, the final settlement occurs on the Stacks blockchain. Therefore, the receiver must wait for confirmation on the Stacks network before moving the funds.

This function can also be used as an alternative to "Withdraw Funds from Bolt Contract" when users want to withdraw their funds immediately without the timelock protection. In this case, users pay the fee in sBTC instead of STX.

```lisp
;;   Executes an external transfer from the contract to a Stacks wallet.
;;   Parameters:
;;     amount: uint                   The transfer amount.
;;     recipient: principal           The destination wallet.
;;     memo: (optional (buff 34))      Optional memo.
;;     fee: uint                      Fee amount
(external-transfer 
    (amount uint)
    (recipient principal)
    (memo (optional (buff 34)))
    (fee uint))
```

### 5. Direct Transfer

This function enables users to transfer their sBTC directly on the Stacks blockchain while paying fees in sBTC instead of STX. The Bolt Operator's role is limited to sponsoring the transaction, making it possible to pay fees in sBTC. Unlike other transfer types, this is a direct transfer between Stacks wallets that settles immediately on the Stacks blockchain.

> [See example implementation](cookbook/transfer.md)

```lisp
;;   Initiates a direct token transfer from the sender to a recipient.
;;   Parameters:
;;     amount: uint                   The amount of tokens to transfer.
;;     recipient: principal           The destination wallet.
;;     memo: (optional (buff 34))      Optional memo attached to the transfer.
;;     fee: uint                      The fee amount for the transfer.
(transfer 
    (amount uint)
    (recipient principal)
    (memo (optional (buff 34)))
    (fee uint))
```

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


