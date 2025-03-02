# Sponsored sBTC Transfer Example

This guide demonstrates how to transfer sBTC between Stacks wallets while paying the fee in sBTC instead of STX using Bolt Protocol's sponsorship feature.

## Prerequisites

```bash
npm install @stacks/network @stacks/common @stacks/transactions
```

## Complete Example

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

async function transferSbtc() {
    // Amount and fee in satoshis
    const amount = 100000000; // 1 sBTC
    const fee = 10;          // 10 satoshis minimum fee

    // Post condition to ensure exact amount+fee is spent
    const ftPostCondition: FungiblePostCondition = {
        type: 'ft-postcondition',
        address: "<sender-wallet-address>",    // Replace with actual sender address
        condition: 'eq',
        amount: amount + fee,
        asset: 'ST3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02W1N0YJF.sbtc-token::sbtc-token'
    };

    // Transaction options
    const txOptions: SignedContractCallOptions = {
        sponsored: true,  // Enable sponsorship
        senderKey: "<sender-key>",  // Replace with sender's private key
        network: STACKS_TESTNET,
        contractAddress: "ST3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02W1N0YJF",
        contractName: "boltproto-sbtc-rc-1-1-0",
        functionName: "transfer",
        functionArgs: [
            Cl.uint(amount),
            Cl.principal("<recipient-address>"),  // Replace with recipient address
            Cl.none(),  // No memo
            Cl.uint(fee)
        ],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [ftPostCondition],
    };

    // Create and serialize the transaction
    const transaction = await makeContractCall(txOptions);
    const serializedTx = bytesToHex(transaction.serializeBytes());

    // Submit to Bolt Protocol API
    const response = await fetch('https://boltproto.org/api/v1/transaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ serializedTx })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Transaction submitted:', data.txid);
    return data;
}
```

## Key Components Explained

1. **Amount and Fee**:
   - `amount`: The amount of sBTC to transfer (in satoshis)
   - `fee`: The fee paid in sBTC (minimum 10 satoshis)

2. **Post Condition**:
   - Ensures exactly `amount + fee` is spent from the sender's wallet
   - Uses the testnet sBTC token contract

3. **Transaction Options**:
   - `sponsored: true`: Enables fee sponsorship by Bolt Protocol
   - Contract details for testnet deployment
   - Function arguments include amount, recipient, memo (none), and fee

4. **API Submission**:
   - Serializes the transaction
   - Submits to Bolt Protocol's API
   - Returns transaction ID upon success

## Important Notes

- Replace placeholder values (`<sender-wallet-address>`, `<sender-key>`, `<recipient-address>`) with actual values
- The minimum fee is 10 satoshis
- This example uses testnet addresses; mainnet addresses will differ
- Always ensure sufficient sBTC balance for both amount and fee
