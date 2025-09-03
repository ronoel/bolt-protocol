# How to Enable Users to Pay Transaction Fees with sBTC in Your Wallet on Stacks

This guide explains how wallet developers can integrate Bolt Protocol to allow users to pay transaction fees with sBTC (instead of STX) for *any* Stacks smart contract call.

---

## Overview

Bolt Protocol enables wallets to let users pay transaction fees in sBTC for any contract call on the Stacks blockchain. Users deposit sBTC into a personal Fee Fund managed by Bolt, and all transactions submitted through the Bolt API will consume fees from this fund.

---

## Step 1: Top Up the User's Fee Fund

To pay transaction fees in sBTC, users must first deposit sBTC into their Fee Fund.

Call the `deposit-fee-fund` function on the Bolt Protocol smart contract:

### Complete Example

```typescript
import { STACKS_TESTNET } from "@stacks/network";
import { bytesToHex } from "@stacks/common";
import {
  Cl,
  FungiblePostCondition,
  makeContractCall,
  PostConditionMode,
  SignedContractCallOptions,
} from "@stacks/transactions";

async function depositFeeFund() {
  const amount = 50000; // Amount to deposit in satoshis
  const fee = 10;       // Transaction fee in satoshis

  const ftPostCondition: FungiblePostCondition = {
    type: 'ft-postcondition',
    address: "<sender-wallet-address>",
    condition: 'eq',
    amount: amount + fee,
    asset: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token'
  };

  const txOptions: SignedContractCallOptions = {
    sponsored: true,
    senderKey: "<sender-private-key>",
    network: STACKS_TESTNET,
    contractAddress: "SP3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02ZHQCMVJ",
    contractName: "boltproto-sbtc-v2",
    functionName: "deposit-fee-fund",
    functionArgs: [
      Cl.uint(amount),
      Cl.uint(fee)
    ],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [ftPostCondition],
  };

  const transaction = await makeContractCall(txOptions);
  const serializedTx = bytesToHex(transaction.serializeBytes());

  // This transaction must be submitted to Bolt Protocol's exclusive transaction endpoint
  const response = await fetch('https://boltproto.org/api/v1/sponsor/sbtc-token/transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serializedTx, fee })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log('Fee Fund deposit submitted:', data.txid);
  return data;
}
```

- Submit the transaction to the Bolt Protocol API endpoint.

---

## Step 2: Check the User's Fee Fund Balance

Query the user's Fee Fund balance via the Bolt API:

```http
GET /api/v1/sponsor/sbtc-token/balance/{address}
```

Example response:
```json
{
  "balance": "50000"
}
```

---

## Step 3: Submit a Contract Call Paying Fee in sBTC

To submit a contract call and pay the transaction fee in sBTC:

1. Construct the contract call transaction as usual.
2. Set the transaction option `sponsored: true`.
3. Calculate and specify the transaction fee in sBTC.
4. Submit the serialized transaction to the Bolt Protocol endpoint:

```http
POST /api/v1/sponsor/sbtc-token/transaction
```

Request body:
```json
{
  "serializedTx": "<serialized_transaction_here>",
  "fee": 10
}
```

API response:
```json
{
  "txid": "<transaction_id>",
  "fee": 10
}
```

---

## Important Notes

- Ensure the user's Fee Fund has sufficient balance for transaction fees.
- This method works for *any* contract call.
- See the [Bolt Protocol GitHub](https://github.com/ronoel/leather-io-extension) for wallet integration examples.

---