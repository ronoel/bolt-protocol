<p align="center">
  <img src="https://storage.googleapis.com/bitfund/boltproto-icon.png" width="100" alt="Bolt Protocol Logo">
</p>

# Bolt Protocol

Bolt Protocol unlocks seamless Bitcoin utility across the Stacks ecosystem. By enabling users to pay fees directly in sBTC, Bolt removes the friction of dual-token systems and brings pure-Bitcoin flow to smart contracts, games, and dApps.
No STX required. No extra steps. Just Bitcoin — fast, efficient, and secure.

Power your app with Bolt. Build for the Bitcoin era.

* **Website**: [https://boltproto.org/](https://boltproto.org/)

## Table of Contents
- [Overview](#bolt-protocol)
- [Key Features](#key-features)
- [Demo Video](#demo-video)
- [How It Works](#how-it-works)
- [Integration Overview](#integration-overview)
- [Integration Details](#integration-details)
  - [For Wallets](#for-wallets)
  - [For dApps](#for-dapps)
- [Smart Contract](#main-functions-of-the-smart-contract-v2)
- [Contract Functions](#contract-functions-native-sbtc-transfers)
- [Bolt API](#bolt-api-v1)
- [Roadmap](#roadmap)
- [Contact Us](#contact-us)

Bolt Protocol solves two critical pain points for Stacks users:
1. **Pay transaction fees with sBTC**: Users no longer need to hold STX to pay for transactions. All fees can be paid directly in sBTC.
2. **Instant transfers**: Transactions between Bolt wallets are confirmed instantly, avoiding the typical Stacks blockchain confirmation times.

> Note: Bolt Protocol currently supports only sBTC. Support for other SIP-10 tokens will be added in future releases.

We offer a Bolt Wallet implementation on our website for users to use:

* **Bolt Wallet**: [https://boltproto.org/wallet](https://boltproto.org/wallet)
> Note: This is a Bolt Wallet implementation (dApp) to transfer sBTC between wallets (instant transfers and Stacks transfer). To pay transaction fees in other dApps using sBTC, you'll need a wallet that integrates with Bolt Protocol like "Wallet Extension".

* **Wallet Extension** [Github Repository](https://github.com/ronoel/leather-io-extension)

> Note: The current version of this extension is just a proof of concept for the Bolt Protocol integration, allowing you to pay transaction fees with sBTC on the Stacks Blockchain.

---

## How Bolt Protocol Works

<p align="center">
  <img src="https://github.com/ronoel/bolt-protocol/blob/main/bolt-protocol-diagram.jpg" width="600" alt="Bolt Protocol Architecture">
</p>

The architecture shows how Bolt Protocol serves as a layer between dApps, wallets, and the blockchain:

1. **dApps** connect directly to Bolt Protocol through the API or via wallet integrations
2. **Wallets** can integrate with Bolt to provide sBTC fee payment capabilities
3. **The Operator** handles three core functions:
   - Standard sBTC transfers
   - Instant sBTC transfers between Bolt wallets
   - sBTC transaction fee payment for any contract
4. **Smart Contract** provides the secure foundation for all operations

This design allows users to interact with any Stacks dApp while paying fees in sBTC instead of STX, creating a seamless Bitcoin-native experience.

---

## Demo Video

Watch our demonstration video that showcases how Bolt Protocol enables seamless Bitcoin transactions on the Stacks blockchain:

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

### 2. Enable Users to Pay Transaction Fees with sBTC for Any Contract

Integrate Bolt Protocol into your wallet to allow users to pay transaction fees with sBTC (instead of STX) for *any* contract call on the Stacks blockchain. This enables a seamless experience where users never need STX for gas, even when interacting with third-party contracts. Users must deposit sBTC into their Fee Fund to use this feature.

- See [How to Enable Users to Pay Transaction Fees with sBTC in Your Wallet on Stacks](guides/pay-fee-with-sbtc.md) for integration steps.

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

## Enable Users to Pay Transaction Fees with sBTC for Any Contract

Bolt Protocol enables wallets to let users pay transaction fees in sBTC for contract calls to *any* Stacks smart contract, not just Bolt's own contract. Users must deposit sBTC into their Fee Fund to use this feature.

- See [How to Enable Users to Pay Transaction Fees with sBTC in Your Wallet on Stacks](guides/pay-fee-with-sbtc.md) for a step-by-step integration guide.

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

# Roadmap

---

## ✅ Phase 1: MVP & Core Infrastructure

**🎯 Goal:** Launch the base protocol and demonstrate its utility.

- ✅ Implement Bolt Protocol smart contracts on Stacks  
- ✅ Enable sBTC as gas (pay fees in sBTC, not STX)  
- ✅ Release Bolt Wallet demo with instant sBTC transfers  
- ✅ Open-source reference integrations for developers  

---

## ⚙️ Phase 2: Developer Ecosystem & Wallet Integrations  
**🗓 Short-Term: Q2 2025**  
**🎯 Goal:** Build momentum with developers and strengthen infrastructure.

- ✅ Launch Portal (docs, showcase, access points)  
- ✅ Track usage metrics  
- ✅ Launch demo apps:  
  - ✅ Block Constellation — first 100% sBTC game  
- 🔄 Add support for wallet integrations (Boom, Xverse, Leather...) *(in progress)*  
- 🔄 Community outreach to align with Stacks app developers  

---

## 🌐 Phase 3: Ecosystem Expansion & Incentivization  
**🗓 Mid-Term: Q3–Q4 2025**  
**🎯 Goal:** Scale usage and introduce governance mechanisms.

- [ ] Launch Bolt DAO for governance and upgrades  
- [ ] Enable staking & rewards  
- [ ] Onboard partner apps: DeFi, marketplaces, tools  
- [ ] Promote Bolt + Stacks as a Lightning Alternative for Bitcoin scaling
- [ ] Launch incentive program for developers (grants, rewards)
- [ ] Run hackathons and workshops for new use cases  

---

## 🌍 Phase 4: Multi-Token Support  
**🗓 Long-Term: Q4 2025+**  
**🎯 Goal:** Establish Bolt as the default transaction layer on Bitcoin + expand token support.

- [ ] Expand Bolt Protocol to support other tokens (e.g. USDh, stablecoins)  

---

# Contact Us

* **X (Twitter)**: [@boltprotobtc](https://x.com/boltprotobtc)

---
