import { beforeEach, describe, expect, it } from "vitest";
import { Cl, ClarityType, cvToJSON, cvToValue, TupleCV } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const address3 = accounts.get("wallet_3")!;

const CONTRACT_NAME = "boltproto-sbtc";
const TOKEN_CONTRACT = "sbtc-token";
const FEE = 10;

// Error constants
const ERR_PRECONDITION_FAILED = Cl.uint(1001);
const ERR_NOT_MANAGER = Cl.uint(2004);
const ERR_UNAUTHORIZED_FEE_COLLECTOR = Cl.uint(2005);
const ERR_INSUFFICIENT_FEE_BALANCE = Cl.uint(4003);
const ERR_UNAUTHORIZED_SPONSOR_OPERATOR = Cl.uint(2002);
const ERR_NO_OPERATOR = Cl.uint(2006);
const ERR_INSUFFICIENT_FUNDS_FOR_FEE = Cl.uint(4002);
const ERR_INSUFFICIENT_FUNDS = Cl.uint(4001);

describe("Administrative Functions Tests", () => {
  beforeEach(async () => {
    // Mint initial tokens to test accounts
    await mintToken(1000000000, address1);
    await mintToken(1000000000, address2);
  });

  describe("Contract Manager Operations", () => {
    it("should allow contract manager to set new manager", async () => {
      const result = await setContractManager(address1, deployer);
      expect(result.result).toBeOk(Cl.bool(true));

      const newManager = await getContractManager();
      expect(cvToValue(newManager.result)).toBe(address1);
    });

    it("should prevent non-manager from setting new manager", async () => {
      const result = await setContractManager(address2, address2);
      expect(result.result).toBeErr(ERR_NOT_MANAGER);
    });
  });

  describe("Sponsor Operator Management", () => {
    it("should allow manager to set sponsor operator", async () => {
      const result = await setSponsorOperator(address1, deployer);
      expect(result.result).toBeOk(Cl.bool(true));

      const newOperator = await getSponsorOperator();
      expect(cvToValue(newOperator.result)).toBe(address1);
    });

    it("should prevent non-manager from setting sponsor operator", async () => {
      const result = await setSponsorOperator(address2, address2);
      expect(result.result).toBeErr(ERR_NOT_MANAGER);
    });
  });

  describe("Fee Configuration", () => {
    it("should allow manager to update governance fee ratio", async () => {
        const newRatio = 50;
        const result = await setGovernanceFeeRatio(newRatio, deployer);
        expect(result.result).toBeOk(Cl.bool(true));

        // Verify updated fee ratio
        const feeRatio = await getGovernanceFeeRatio();
        expect(Number(cvToValue(feeRatio.result))).toBe(newRatio);
    });

    it("should prevent setting invalid governance ratio", async () => {
        const result = await setGovernanceFeeRatio(101, deployer);
        expect(result.result).toBeErr(ERR_PRECONDITION_FAILED);
    });

    it("should prevent non-manager from updating governance ratio", async () => {
        const result = await setGovernanceFeeRatio(30, address1);
        expect(result.result).toBeErr(ERR_NOT_MANAGER);
    });
  });

  describe("Fee Collector Operator Management", () => {
    it("should allow manager to set fee collector operator", async () => {
      const result = await setFeeCollectorOperator(address1, deployer);
      expect(result.result).toBeOk(Cl.bool(true));

      const newOperator = await getFeeCollectorOperator();
      expect(cvToValue(newOperator.result)).toBe(address1);
    });

    it("should prevent non-manager from setting fee collector operator", async () => {
      const result = await setFeeCollectorOperator(address2, address2);
      expect(result.result).toBeErr(ERR_NOT_MANAGER);
    });
  });

  describe("Governance Withdrawer Management", () => {
    it("should allow manager to set governance withdrawer", async () => {
      const result = await setGovernanceWithdrawer(address1, deployer);
      expect(result.result).toBeOk(Cl.bool(true));

      const newWithdrawer = await getGovernanceWithdrawer();
      expect(cvToValue(newWithdrawer.result)).toBe(address1);
    });

    it("should prevent non-manager from setting governance withdrawer", async () => {
      const result = await setGovernanceWithdrawer(address2, address2);
      expect(result.result).toBeErr(ERR_NOT_MANAGER);
    });
  });

  describe("Blocks to Withdraw Management", () => {
    it("should allow manager to set blocks to withdraw", async () => {
      const newBlocks = 10;
      const result = await setBlocksToWithdraw(newBlocks, deployer);
      expect(result.result).toBeOk(Cl.bool(true));

      const blocks = await getBlocksToWithdraw();
      expect(cvToValue(blocks.result)).toBe(BigInt(newBlocks));
    });

    it("should prevent non-manager from setting blocks to withdraw", async () => {
      const result = await setBlocksToWithdraw(10, address1);
      expect(result.result).toBeErr(ERR_NOT_MANAGER);
    });
  });

  describe("Fee Payment and Distribution", () => {
    it("should accept fee payment and distribute correctly", async () => {
      const feeAmount = 1000000;
      // Get initial treasury balances
      const initialGovTreasury = await getGovernanceTreasury();
      const initialOpTreasury = await getOperatorTreasury();
      const initialGovBalance = Number(cvToValue(initialGovTreasury.result));
      const initialOpBalance = Number(cvToValue(initialOpTreasury.result));

      // Get current fee ratio
      const feeRatioResponse = await getGovernanceFeeRatio();
      const govRatio = Number(cvToValue(feeRatioResponse.result));

      // Calculate expected distributions
      const expectedGovAmount = Math.floor((feeAmount * govRatio) / 100);
      const expectedOpAmount = feeAmount - expectedGovAmount;

      // Execute fee payment
      const result = await payFee(feeAmount, address1);
      expect(result.result).toBeOk(Cl.bool(true));

      // Check updated treasury balances
      const finalGovTreasury = await getGovernanceTreasury();
      const finalOpTreasury = await getOperatorTreasury();
      const finalGovBalance = Number(cvToValue(finalGovTreasury.result));
      const finalOpBalance = Number(cvToValue(finalOpTreasury.result));

      // Verify correct distribution
      expect(finalGovBalance - initialGovBalance).toBe(expectedGovAmount);
      expect(finalOpBalance - initialOpBalance).toBe(expectedOpAmount);
    });

    it("should fail when paying zero fee", async () => {
      const result = await payFee(0, address1);
      expect(result.result).toBeErr(ERR_PRECONDITION_FAILED);
    });

    it("should fail when paying fee with insufficient balance", async () => {
      const result = await payFee(2000000000, address1);
      expect(result.result).not.toBeOk(Cl.bool(true));
    });
  });

  describe("Treasury Withdrawals", () => {
    beforeEach(async () => {
      // Set up initial treasury balances through fee payment
      const feeAmount = 1000000;
      await payFee(feeAmount, address1);

      // Set up operators
      await setGovernanceWithdrawer(address1, deployer);
      await setFeeCollectorOperator(address2, deployer);
    });

    describe("Governance Treasury", () => {
      it("should allow governance withdrawer to withdraw funds", async () => {
        const initialTreasury = await getGovernanceTreasury();
        const initialBalance = Number(cvToValue(initialTreasury.result));
        const withdrawAmount = Math.floor(initialBalance / 2);

        const result = await withdrawGovernanceTreasury(withdrawAmount, address1, address1);
        expect(result.result).toBeOk(Cl.bool(true));

        const finalTreasury = await getGovernanceTreasury();
        const finalBalance = Number(cvToValue(finalTreasury.result));
        expect(finalBalance).toBe(initialBalance - withdrawAmount);
      });

      it("should prevent withdrawal by non-governance withdrawer", async () => {
        const result = await withdrawGovernanceTreasury(1000, address2, address2);
        expect(result.result).toBeErr(ERR_UNAUTHORIZED_FEE_COLLECTOR);
      });

      it("should prevent withdrawal exceeding balance", async () => {
        const treasury = await getGovernanceTreasury();
        const balance = Number(cvToValue(treasury.result));
        const result = await withdrawGovernanceTreasury(balance + 1000, address1, address1);
        expect(result.result).toBeErr(ERR_INSUFFICIENT_FEE_BALANCE);
      });
    });

    describe("Operator Treasury", () => {
      it("should allow fee collector to withdraw funds", async () => {
        const initialTreasury = await getOperatorTreasury();
        const initialBalance = Number(cvToValue(initialTreasury.result));
        const withdrawAmount = Math.floor(initialBalance / 2);

        const result = await withdrawOperatorTreasury(withdrawAmount, address2, address2);
        expect(result.result).toBeOk(Cl.bool(true));

        const finalTreasury = await getOperatorTreasury();
        const finalBalance = Number(cvToValue(finalTreasury.result));
        expect(finalBalance).toBe(initialBalance - withdrawAmount);
      });

      it("should prevent withdrawal by non-fee collector", async () => {
        const result = await withdrawOperatorTreasury(1000, address1, address1);
        expect(result.result).toBeErr(ERR_UNAUTHORIZED_FEE_COLLECTOR);
      });

      it("should prevent withdrawal exceeding balance", async () => {
        const treasury = await getOperatorTreasury();
        const balance = Number(cvToValue(treasury.result));
        const result = await withdrawOperatorTreasury(balance + 1000, address2, address2);
        expect(result.result).toBeErr(ERR_INSUFFICIENT_FEE_BALANCE);
      });
    });
  });

  describe("Deposit Operations", () => {
    beforeEach(async () => {
      // Mint initial tokens to test accounts
      await mintToken(1000000000, address1);
      await mintToken(1000000000, address2);
    });

    it("should successfully deposit tokens", async () => {
      const amount = 1000000;
      const result = await deposit(amount, address1, address1);
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify wallet data after deposit
      const walletData = await getWalletData(address1);
      const data = cvToJSON(walletData.result);
      expect(Number(data.value.balance.value)).toBe(amount);
      expect(Number(data.value['withdraw-requested-amount'].value)).toBe(0);
      expect(Number(data.value['withdraw-requested-block'].value)).toBe(0);
    });

    it("should fail deposit with zero amount", async () => {
      const result = await deposit(0, address1, address1);
      expect(result.result).toBeErr(ERR_PRECONDITION_FAILED);
    });

    it("should fail deposit with insufficient balance", async () => {
      const result = await deposit(20000000000, address1, address1);
      expect(result.result).toBeErr(Cl.uint(1));
    });

    it("should allow deposits to different recipient", async () => {
      const amount = 1000000;
      const result = await deposit(amount, address2, address1);
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify recipient's wallet data
      const walletData = await getWalletData(address2);
      const data = cvToJSON(walletData.result);
      expect(Number(data.value.balance.value)).toBe(amount);
    });

    it("should accumulate multiple deposits correctly", async () => {
      const amount1 = 1000000;
      const amount2 = 2000000;

      // First deposit
      await deposit(amount1, address1, address1);

      // Second deposit
      await deposit(amount2, address1, address1);

      // Verify total balance
      const walletData = await getWalletData(address1);
      const data = cvToJSON(walletData.result);
      expect(Number(data.value.balance.value)).toBe(amount1 + amount2);
    });
  });

  describe("Transfer Operations", () => {
    const FEE = 10; // Define a constant fee for testing

    beforeEach(async () => {
      // Mint initial tokens to test accounts
      await mintToken(1000000000, address1);
      await mintToken(1000000000, address2);
    });

    it("should successfully transfer tokens with fee deduction", async () => {
      const amount = 1000000;

      // Get initial balances
      const initialBalance1 = await getTokenBalance(address1);
      const initialBalance2 = await getTokenBalance(address2);

      // Execute transfer
      const result = await transfer(amount, address2, FEE, address1);
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify final balances
      const finalBalance1 = await getTokenBalance(address1);
      const finalBalance2 = await getTokenBalance(address2);

      expect(Number(cvToValue(finalBalance1.result)))
        .toBe(Number(cvToValue(initialBalance1.result)) - (amount + FEE));
      expect(Number(cvToValue(finalBalance2.result)))
        .toBe(amount + Number(cvToValue(initialBalance2.result)));

      // Verify fee distribution
      const govTreasury = await getGovernanceTreasury();
      const opTreasury = await getOperatorTreasury();
      const govRatio = 30; // Default ratio

      expect(Number(cvToValue(govTreasury.result))).toBe(Math.floor((FEE * govRatio) / 100));
      expect(Number(cvToValue(opTreasury.result))).toBe(FEE - Math.floor((FEE * govRatio) / 100));
    });

    it("should allow transfer with memo", async () => {
      const amount = 1000000;
      const memo = Buffer.from("Test transfer");
      const result = await transferWithMemo(amount, address2, memo, FEE, address1);
      expect(result.result).toBeOk(Cl.bool(true));
    });

    // it("should allow transfer with BNS", async () => {
    //   const amount = 1000000;
    //   const memo = Buffer.from("Test transfer");
    //   const muneebAddress = "SP17A1AM4TNYFPAZ75Z84X3D6R2F6DTJBDJ6B0YF";
    //   const finalBalance1 = await getTokenBalance(muneebAddress);
    //   const result = await transferBNSWithMemo(amount, "muneeb", "btc", memo, FEE, address1);
    //   expect(result.result).toBeOk(Cl.bool(true));

    //   const finalBalance2 = await getTokenBalance(muneebAddress);
    //   console.log("finalBalance1: ", cvToValue(finalBalance1.result));
    //   console.log("finalBalance2: ", cvToValue(finalBalance2.result));
    //   expect(Number(cvToValue(finalBalance1.result).value))
    //     .toBe(0);
    //   expect(Number(cvToValue(finalBalance2.result).value))
    //     .toBe(1000000);
    // });

    it("should fail transfer with insufficient balance", async () => {
      const result = await transfer(2000000000, address2, FEE, address1);
      expect(result.result).not.toBeOk(Cl.bool(true));
    });

    it("should fail transfer to self", async () => {
      const result = await transfer(1000000, address1, FEE, address1);
      expect(result.result).not.toBeOk(Cl.bool(true));
    });
  });

  describe("Sponsored Deposit Operations", () => {
    beforeEach(async () => {
      // Mint initial tokens to test accounts
      await mintToken(1000000000, address1);
      await mintToken(1000000000, address2);
      // Set address1 as sponsor operator
      await setSponsorOperator(address1, deployer);
    });

    it("should successfully process sponsored deposit with fee deduction", async () => {
      const amount = 1000000;

      // Get fee configuration
      const feeRatioResponse = await getGovernanceFeeRatio();
      const govRatio = Number(cvToValue(feeRatioResponse.result));
      const fee = 10;

      // Execute sponsored deposit
      const result = await sponsoredDeposit(amount, address2, FEE, address1);

      // Test verifying sponsor
      // expect(result.result).toBeErr(ERR_NO_OPERATOR);

      // Test without sponsor
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify wallet data after deposit
      const walletData = await getWalletData(address2);
      const data = cvToJSON(walletData.result);
      expect(Number(data.value.balance.value)).toBe(amount - fee);

      // Verify fee distribution
      const govTreasury = await getGovernanceTreasury();
      const opTreasury = await getOperatorTreasury();

      expect(Number(cvToValue(govTreasury.result))).toBe(Math.floor((fee * govRatio) / 100));
      expect(Number(cvToValue(opTreasury.result))).toBe(fee - Math.floor((fee * govRatio) / 100));
    });

    it("should fail sponsored deposit from unauthorized operator", async () => {
      const result = await sponsoredDeposit(1000000, address2, FEE, address2);
      expect(result.result).toBeErr(ERR_UNAUTHORIZED_SPONSOR_OPERATOR);
    });

    it("should fail sponsored deposit with amount less than fee", async () => {
      const feeRatioResponse = await getGovernanceFeeRatio();
      const govRatio = Number(cvToValue(feeRatioResponse.result));
      const fee = 10;

      const result = await sponsoredDeposit(fee - 1, address2, FEE, address1);
      expect(result.result).toBeErr(ERR_INSUFFICIENT_FUNDS_FOR_FEE);
    });

    it("should fail sponsored deposit with insufficient balance", async () => {
      const result = await sponsoredDeposit(2000000000, address2, FEE, address1);
      expect(result.result).not.toBeOk(Cl.bool(true));
    });

    it("should accumulate multiple sponsored deposits correctly", async () => {
      const amount1 = 1000000;
      const amount2 = 2000000;
      const feeRatioResponse = await getGovernanceFeeRatio();
      const govRatio = Number(cvToValue(feeRatioResponse.result));
      const fee = 10;

      // First deposit
      await sponsoredDeposit(amount1, address2, FEE, address1);

      // Second deposit
      await sponsoredDeposit(amount2, address2, FEE, address1);

      // Verify total balance (amounts minus fees)
      const walletData = await getWalletData(address2);
      const data = cvToJSON(walletData.result);
      expect(Number(data.value.balance.value)).toBe((amount1 - fee) + (amount2 - fee));
    });
  });

  describe("Internal Transfer Operations", () => {
    beforeEach(async () => {
      // Mint initial tokens and set up deposits
      await mintToken(1000000000, address1);
      await deposit(5000000, address1, address1);

      // Set up sponsor operator
      await setSponsorOperator(address1, deployer);
    });

    it("should successfully process internal transfer with fee deduction", async () => {
      const amount = 1000000;

      // Get initial wallet data
      const initialSenderData = await getWalletData(address1);
      const initialRecipientData = await getWalletData(address2);
      const senderInitialBalance = Number(cvToJSON(initialSenderData.result).value.balance.value);
      const recipientInitialBalance = Number(cvToJSON(initialRecipientData.result).value.balance.value);

      // Get fee configuration
      const feeRatioResponse = await getGovernanceFeeRatio();
      const govRatio = Number(cvToValue(feeRatioResponse.result));
      const fee = 10;

      // Execute internal transfer
      const result = await internalTransfer(amount, address2, FEE, address1);

      // Test verifying sponsor
      // expect(result.result).toBeErr(ERR_NO_OPERATOR);

      // Test without sponsor
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify final wallet data
      const finalSenderData = await getWalletData(address1);
      const finalRecipientData = await getWalletData(address2);
      const senderFinalBalance = Number(cvToJSON(finalSenderData.result).value.balance.value);
      const recipientFinalBalance = Number(cvToJSON(finalRecipientData.result).value.balance.value);

      // Verify balance changes
      expect(senderFinalBalance).toBe(senderInitialBalance - (amount + fee));
      expect(recipientFinalBalance).toBe(recipientInitialBalance + amount);

      // Verify fee distribution
      const govTreasury = await getGovernanceTreasury();
      const opTreasury = await getOperatorTreasury();

      expect(Number(cvToValue(govTreasury.result))).toBe(Math.floor((fee * govRatio) / 100));
      expect(Number(cvToValue(opTreasury.result))).toBe(fee - Math.floor((fee * govRatio) / 100));
    });

    it("should fail internal transfer from unauthorized operator", async () => {
      const result = await internalTransfer(1000000, address2, FEE, address2);
      expect(result.result).toBeErr(ERR_UNAUTHORIZED_SPONSOR_OPERATOR);
    });

    it("should fail internal transfer with insufficient balance", async () => {
      const result = await internalTransfer(10000000, address2, FEE, address1);
      expect(result.result).toBeErr(ERR_INSUFFICIENT_FUNDS);
    });

    it("should allow internal transfer using withdrawal-requested amount", async () => {
      // Request withdrawal first
      const withdrawAmount = 2000000;
      await requestWithdrawal(withdrawAmount, address1);

      // Get fee configuration
      const feeRatioResponse = await getGovernanceFeeRatio();
      const govRatio = Number(cvToValue(feeRatioResponse.result));
      const fee = 10;

      const initialSenderData = await getWalletData(address1);
      const dataI = cvToJSON(initialSenderData.result);

      // Attempt transfer using funds from withdrawal request
      const transferAmount = 1000000;
      const result = await internalTransfer(transferAmount, address2, FEE, address1);
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify withdrawal request was properly deducted
      const finalSenderData = await getWalletData(address1);
      const data = cvToJSON(finalSenderData.result);
      expect(Number(data.value['withdraw-requested-amount'].value))
        .toBe(withdrawAmount);

      expect(Number(data.value['balance'].value))
        .toBe(5000000 - (transferAmount + fee + withdrawAmount));

      // Remove from balance, let just for the fee
      await requestWithdrawal(Number(data.value['balance'].value) - fee, address1);
      const finalSenderData2 = await getWalletData(address1);
      const data2 = cvToJSON(finalSenderData2.result);

      console.log("data2: ", data2);

      // Attempt transfer using funds from withdrawal request
      const result2 = await internalTransfer(transferAmount, address2, FEE, address1);
      expect(result2.result).toBeOk(Cl.bool(true));

      const finalSenderData3 = await getWalletData(address1);
      const data3 = cvToJSON(finalSenderData3.result);
      expect(Number(data3.value['balance'].value))
        .toBe(0);

      expect(Number(data3.value['withdraw-requested-amount'].value))
        .toBe(Number(data2.value['withdraw-requested-amount'].value) - transferAmount);
    });

    it("should combine available and withdrawal-requested balances for transfer", async () => {
      // Set up initial state with both available and withdrawal-requested amounts
      const withdrawAmount = 4000000;
      await requestWithdrawal(withdrawAmount, address1);

      // Get fee configuration
      const feeRatioResponse = await getGovernanceFeeRatio();
      const govRatio = Number(cvToValue(feeRatioResponse.result));
      const fee = 10;

      // Transfer amount that requires both available and withdrawal-requested funds
      const transferAmount = 3000000;
      const result = await internalTransfer(transferAmount, address2, FEE, address1);
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify final balances
      const finalSenderData = await getWalletData(address1);
      const data = cvToJSON(finalSenderData.result);
      console.log("data: ", data);
      expect(Number(data.value.balance.value)).toBe(0);
      expect(Number(data.value['withdraw-requested-amount'].value))
        .toBe(5000000 - (transferAmount + fee));

      const transferNoFunds = await internalTransfer(Number(data.value['withdraw-requested-amount'].value), address2, FEE, address1);
      expect(transferNoFunds.result).toBeErr(ERR_INSUFFICIENT_FUNDS);
    });
  });

  describe("External Transfer Operations", () => {
    beforeEach(async () => {
      // Mint initial tokens and set up deposits
      await mintToken(1000000000, address1);
      await deposit(5000000, address1, address1);
      
      // Set up sponsor operator
      await setSponsorOperator(address1, deployer);
    });

    it("should successfully process external transfer with fee deduction", async () => {
      const amount = 1000000;
      
      // Get initial wallet data and balance
      const initialSenderData = await getWalletData(address1);
      const initialRecipientBalance = await getTokenBalance(address2);
      const senderInitialBalance = Number(cvToJSON(initialSenderData.result).value.balance.value);
      const recipientInitialBalance = Number(cvToValue(initialRecipientBalance.result));
      
      // Get fee configuration
      const feeRatioResponse = await getGovernanceFeeRatio();
      const govRatio = Number(cvToValue(feeRatioResponse.result));
      const fee = 10;

      // Execute external transfer
      const result = await externalTransfer(amount, address2, FEE, address1);

      // Test verifying sponsor
      // expect(result.result).toBeErr(ERR_NO_OPERATOR);

      // Test without sponsor
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify final balances
      const finalSenderData = await getWalletData(address1);
      const finalRecipientBalance = await getTokenBalance(address2);
      const senderFinalBalance = Number(cvToJSON(finalSenderData.result).value.balance.value);
      const recipientFinalBalance = Number(cvToValue(finalRecipientBalance.result));

      // Verify balance changes
      expect(senderFinalBalance).toBe(senderInitialBalance - (amount + fee));
      expect(recipientFinalBalance).toBe(recipientInitialBalance + amount);

      // Verify fee distribution
      const govTreasury = await getGovernanceTreasury();
      const opTreasury = await getOperatorTreasury();

      expect(Number(cvToValue(govTreasury.result))).toBe(Math.floor((fee * govRatio) / 100));
      expect(Number(cvToValue(opTreasury.result))).toBe(fee - Math.floor((fee * govRatio) / 100));
    });

    it("should fail external transfer from unauthorized operator", async () => {
      const result = await externalTransfer(1000000, address2, FEE, address2);
      expect(result.result).toBeErr(ERR_UNAUTHORIZED_SPONSOR_OPERATOR);
    });

    it("should fail external transfer with insufficient balance", async () => {
      const result = await externalTransfer(10000000, address2, FEE, address1);
      expect(result.result).toBeErr(ERR_INSUFFICIENT_FUNDS);
    });

    it("should allow external transfer using withdrawal-requested amount", async () => {
      // Request withdrawal first
      const withdrawAmount = 2000000;
      await requestWithdrawal(withdrawAmount, address1);

      // Get fee configuration
      const feeRatioResponse = await getGovernanceFeeRatio();
      const govRatio = Number(cvToValue(feeRatioResponse.result));
      const fee = 10;

      // Get initial recipient balance
      const initialRecipientBalance = await getTokenBalance(address2);

      // Attempt transfer using funds from withdrawal request
      const transferAmount = 1000000;
      const result = await externalTransfer(transferAmount, address2, FEE, address1);
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify withdrawal request was properly deducted
      const finalSenderData = await getWalletData(address1);
      const finalRecipientBalance = await getTokenBalance(address2);
      
      const data = cvToJSON(finalSenderData.result);
      expect(Number(data.value['withdraw-requested-amount'].value))
        .toBe(withdrawAmount);
      expect(Number(data.value['balance'].value))
        .toBe(5000000 - withdrawAmount - (transferAmount + fee));

      // Verify recipient received correct amount
      expect(Number(cvToValue(finalRecipientBalance.result)))
        .toBe(Number(cvToValue(initialRecipientBalance.result)) + transferAmount - fee);
    });

    it("should combine available and withdrawal-requested balances for transfer", async () => {
      // Set up initial state with both available and withdrawal-requested amounts
      const withdrawAmount = 2000000;
      await requestWithdrawal(withdrawAmount, address1);

      // Get fee configuration
      const feeRatioResponse = await getGovernanceFeeRatio();
      const govRatio = Number(cvToValue(feeRatioResponse.result));
      const fee = 10;

      // Get initial recipient balance
      const initialRecipientBalance = await getTokenBalance(address2);

      // Transfer amount that requires both available and withdrawal-requested funds
      const transferAmount = 3000000;
      const result = await externalTransfer(transferAmount, address2, FEE, address1);
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify final balances
      const finalSenderData = await getWalletData(address1);
      const finalRecipientBalance = await getTokenBalance(address2);
      
      const data = cvToJSON(finalSenderData.result);
      expect(Number(data.value.balance.value)).toBe(0);
      expect(Number(data.value['withdraw-requested-amount'].value))
        .toBe(withdrawAmount - (transferAmount + fee - (5000000 - withdrawAmount)));

      // Verify recipient received correct amount
      expect(Number(cvToValue(finalRecipientBalance.result)))
        .toBe(Number(cvToValue(initialRecipientBalance.result)) + transferAmount - fee);
    });
  });

  describe("Withdrawal Operations", () => {
    beforeEach(async () => {
      // Mint initial tokens and set up deposits
      await mintToken(1000000000, address1);
      await deposit(5000000, address1, address1);
      
      // Set withdrawal blocks to 5
      await setBlocksToWithdraw(5, deployer);
    });

    describe("Request Withdrawal", () => {
      it("should successfully request withdrawal", async () => {
        const withdrawAmount = 1000000;
        
        // Get initial wallet data
        const initialData = await getWalletData(address1);
        const initialBalance = Number(cvToJSON(initialData.result).value.balance.value);
        
        // Request withdrawal
        const result = await requestWithdrawal(withdrawAmount, address1);
        expect(result.result).toBeOk(Cl.bool(true));

        // Verify wallet data after request
        const finalData = await getWalletData(address1);
        const data = cvToJSON(finalData.result);
        
        expect(Number(data.value.balance.value)).toBe(initialBalance - withdrawAmount);
        expect(Number(data.value['withdraw-requested-amount'].value)).toBe(withdrawAmount);
      });

      it("should fail withdrawal request with insufficient balance", async () => {
        const result = await requestWithdrawal(10000000, address1);
        expect(result.result).toBeErr(ERR_INSUFFICIENT_FUNDS);
      });

      it("should allow multiple withdrawal requests", async () => {
        // First withdrawal request
        const amount1 = 1000000;
        await requestWithdrawal(amount1, address1);
        
        // Second withdrawal request
        const amount2 = 2000000;
        const result = await requestWithdrawal(amount2, address1);
        expect(result.result).toBeOk(Cl.bool(true));

        // Verify accumulated withdrawal amount
        const walletData = await getWalletData(address1);
        const data = cvToJSON(walletData.result);
        expect(Number(data.value['withdraw-requested-amount'].value)).toBe(amount1 + amount2);
      });
    });

    describe("Claim Withdrawal", () => {
      beforeEach(async () => {
        // Request withdrawal
        await requestWithdrawal(1000000, address1);
      });

      it("should successfully claim withdrawal after timelock", async () => {
        const initialData = await getWalletData(address1);
        const withdrawAmount = Number(cvToJSON(initialData.result).value['withdraw-requested-amount'].value);
        const initialBalance = await getTokenBalance(address1);

        // Move blocks forward to pass timelock
        simnet.mineEmptyBurnBlocks(6);

        // Claim withdrawal
        const result = await claimWithdrawal(address1);
        expect(result.result).toBeOk(Cl.bool(true));

        // Verify wallet data after claim
        const finalData = await getWalletData(address1);
        const data = cvToJSON(finalData.result);
        expect(Number(data.value['withdraw-requested-amount'].value)).toBe(0);
        expect(Number(data.value['withdraw-requested-block'].value)).toBe(0);

        // Verify token balance increased
        const finalBalance = await getTokenBalance(address1);
        expect(Number(cvToValue(finalBalance.result)))
          .toBe(Number(cvToValue(initialBalance.result)) + withdrawAmount);
      });

      it("should fail claim before timelock expires", async () => {
        // Move blocks forward but not enough
        simnet.mineEmptyBurnBlocks(2);

        const result = await claimWithdrawal(address1);
        expect(result.result).toBeErr(ERR_PRECONDITION_FAILED);
      });

      it("should fail claim with no withdrawal request", async () => {
        // Move blocks forward
        simnet.mineEmptyBurnBlocks(6);

        const result = await claimWithdrawal(address2);
        expect(result.result).toBeErr(ERR_INSUFFICIENT_FUNDS);
      });

      it("should handle multiple claims correctly", async () => {
        // Request additional withdrawal
        await requestWithdrawal(2000000, address1);
        
        // Move blocks forward
        simnet.mineEmptyBurnBlocks(6);

        // First claim
        const result1 = await claimWithdrawal(address1);
        expect(result1.result).toBeOk(Cl.bool(true));

        // Verify first claim cleared all withdrawal requests
        const walletData = await getWalletData(address1);
        const data = cvToJSON(walletData.result);
        expect(Number(data.value['withdraw-requested-amount'].value)).toBe(0);

        // Request and claim another withdrawal
        await requestWithdrawal(1500000, address1);
        simnet.mineEmptyBurnBlocks(6);
        
        const result2 = await claimWithdrawal(address1);
        expect(result2.result).toBeOk(Cl.bool(true));
      });
    });
  });

  describe("Governance Treasury Direct Deposit", () => {
    beforeEach(async () => {
      // Mint initial tokens to test accounts
      await mintToken(1000000000, address3);
    });

    it("should successfully deposit to governance treasury", async () => {
      const amount = 1000000;
      const initialTreasury = await getGovernanceTreasury();
      const initialBalance = Number(cvToValue(initialTreasury.result));

      const result = await depositGovernanceTreasury(amount, address1);
      expect(result.result).toBeOk(Cl.bool(true));

      const finalTreasury = await getGovernanceTreasury();
      const finalBalance = Number(cvToValue(finalTreasury.result));
      expect(finalBalance).toBe(initialBalance + amount);
    });

    it("should fail when depositing zero amount", async () => {
      const result = await depositGovernanceTreasury(0, address1);
      expect(result.result).toBeErr(ERR_PRECONDITION_FAILED);
    });

    it("should fail when depositing with insufficient balance", async () => {
      const result = await depositGovernanceTreasury(2000000000, address3);
      expect(result.result).toBeErr(Cl.uint(1));
    });
  });

  // describe("BNS Test", () => {
  //   it("BNS", async () => {
  //     const result = await transferBNSWithMemo(1000000, "muneeb", "blockstack", Buffer.from("Test transfer"), 10, address1);
  //     console.log("ADDRESS: ", Cl.prettyPrint(result.result));
  //     // expect(result.result).toBeErr(Cl.uint(1));
  //   });
  // });
});

// Helper functions
function setContractManager(newManager: string, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "set-contract-manager",
    [Cl.principal(newManager)],
    sender
  );
}

function getContractManager() {
  return simnet.callReadOnlyFn(
    CONTRACT_NAME,
    "get-contract-manager",
    [],
    deployer
  );
}

function setSponsorOperator(newOperator: string, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "set-sponsor-operator",
    [Cl.principal(newOperator)],
    sender
  );
}

function getSponsorOperator() {
  return simnet.callReadOnlyFn(
    CONTRACT_NAME,
    "get-sponsor-operator",
    [],
    deployer
  );
}

function setGovernanceFeeRatio(newRatio: number, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "set-governance-fee-ratio",
    [Cl.uint(newRatio)],
    sender
  );
}

function getGovernanceFeeRatio() {
  return simnet.callReadOnlyFn(
    CONTRACT_NAME,
    "get-governance-fee-ratio",
    [],
    deployer
  );
}

function setFeeCollectorOperator(newOperator: string, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "set-fee-collector-operator",
    [Cl.principal(newOperator)],
    sender
  );
}

function getFeeCollectorOperator() {
  return simnet.callReadOnlyFn(
    CONTRACT_NAME,
    "get-fee-collector-operator",
    [],
    deployer
  );
}

function setGovernanceWithdrawer(newWithdrawer: string, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "set-governance-withdrawer",
    [Cl.principal(newWithdrawer)],
    sender
  );
}

function getGovernanceWithdrawer() {
  return simnet.callReadOnlyFn(
    CONTRACT_NAME,
    "get-governance-withdrawer",
    [],
    deployer
  );
}

function setBlocksToWithdraw(blocks: number, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "set-blocks-to-withdraw",
    [Cl.uint(blocks)],
    sender
  );
}

function getBlocksToWithdraw() {
  return simnet.callReadOnlyFn(
    CONTRACT_NAME,
    "get-blocks-to-withdraw",
    [],
    deployer
  );
}

function payFee(amount: number, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "pay-fee",
    [Cl.uint(amount)],
    sender
  );
}

function getGovernanceTreasury() {
  return simnet.callReadOnlyFn(
    CONTRACT_NAME,
    "get-governance-treasury",
    [],
    deployer
  );
}

function getOperatorTreasury() {
  return simnet.callReadOnlyFn(
    CONTRACT_NAME,
    "get-operator-treasury",
    [],
    deployer
  );
}

function mintToken(amount: number, recipient: string) {
  return simnet.callPublicFn(
    TOKEN_CONTRACT,
    "mint",
    [Cl.uint(amount), Cl.principal(recipient)],
    deployer
  );
}

function withdrawGovernanceTreasury(amount: number, recipient: string, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "withdraw-governance-treasury",
    [Cl.uint(amount), Cl.principal(recipient)],
    sender
  );
}

function withdrawOperatorTreasury(amount: number, recipient: string, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "withdraw-operator-treasury",
    [Cl.uint(amount), Cl.principal(recipient)],
    sender
  );
}

function deposit(amount: number, recipient: string, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "deposit",
    [
      Cl.uint(amount),
      Cl.principal(recipient),
      Cl.none()
    ],
    sender
  );
}

function getWalletData(user: string) {
  return simnet.callReadOnlyFn(
    CONTRACT_NAME,
    "get-wallet-data",
    [Cl.principal(user)],
    deployer
  );
}

function transfer(amount: number, recipient: string, fee: number, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "transfer-stacks-to-stacks",
    [
      Cl.uint(amount),
      Cl.principal(recipient),
      Cl.none(),
      Cl.uint(fee)
    ],
    sender
  );
}

function transferWithMemo(amount: number, recipient: string, memo: Buffer, fee: number, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "transfer-stacks-to-stacks",
    [
      Cl.uint(amount),
      Cl.principal(recipient),
      Cl.some(Cl.buffer(memo)),
      Cl.uint(fee)
    ],
    sender
  );
}

// function transferBNSWithMemo(amount: number, recipientName: string, recipientNamespace: string, memo: Buffer, fee: number, sender: string) {
//   return simnet.callPublicFn(
//     CONTRACT_NAME,
//     "transfer-bns",
//     [
//       Cl.uint(amount),
//       Cl.bufferFromAscii(recipientName),
//       Cl.bufferFromAscii(recipientNamespace),
//       Cl.some(Cl.buffer(memo)),
//       Cl.uint(fee)
//     ],
//     sender
//   );
// }

function getTokenBalance(user: string) {
  return simnet.callReadOnlyFn(
    TOKEN_CONTRACT,
    "get-balance",
    [Cl.principal(user)],
    deployer
  );
}

function sponsoredDeposit(amount: number, recipient: string, fee: number, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "transfer-stacks-to-bolt",
    [
      Cl.uint(amount),
      Cl.principal(recipient),
      Cl.none(),
      Cl.uint(fee)
    ],
    sender
  );
}

function internalTransfer(amount: number, recipient: string, fee: number, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "transfer-bolt-to-bolt",
    [
      Cl.uint(amount),
      Cl.principal(recipient),
      Cl.none(),
      Cl.uint(fee)
    ],
    sender
  );
}

function requestWithdrawal(amount: number, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "request-withdrawal",
    [Cl.uint(amount)],
    sender
  );
}

function externalTransfer(amount: number, recipient: string, fee: number, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "transfer-bolt-to-stacks",
    [
      Cl.uint(amount),
      Cl.principal(recipient),
      Cl.none(),
      Cl.uint(fee)
    ],
    sender
  );
}

function claimWithdrawal(sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "claim-withdrawal",
    [],
    sender
  );
}

function depositGovernanceTreasury(amount: number, sender: string) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "deposit-governance-treasury",
    [Cl.uint(amount)],
    sender
  );
}