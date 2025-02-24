;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Title: Bolt Contract - sBTC
;; Version: boltproto-sbtc-v0-3-0
;; Summary: A smart contract for fast, secure token transfers with signature verification.
;; Website: https://boltproto.org
;;
;; Description:
;;   This contract facilitates the following operations:
;;     Depositing tokens into a wallet.
;;     Transferring tokens using signed offchain messages.
;;     Requesting withdrawals with a configurable time lock.
;;     Combining available balance and pending withdrawal amounts to cover transfers.
;;
;;   Security Features:
;;     Signaturebased transfers ensure authenticity.
;;     Nonce protection prevents replay attacks.
;;     An authorized operator model restricts transfer initiation.
;;     Timelocked withdrawals add an extra layer of security.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Error Constants:
;;   Error code ranges:
;;     1000 1999: General errors.
;;     2000 2999: Permission/authorization errors.
;;     3000 3999: Transaction errors.
;;     4000 4999: Fund related errors.
;;
;;   Specific error codes:
;;     u1001: Precondition failed  general validation error.
;;     u2001: Permission denied  caller lacks required permissions.
;;     u2002: Unauthorized operator  caller is not the authorized contract operator.
;;     u2003: Not current operator  caller is not the current operator.
;;     u3001: Contract locked  contract is in a locked state.
;;     u3002: Invalid signature  signature verification failed.
;;     u3003: Signature already used  prevents replay attacks.
;;     u4001: Insufficient funds  available balance and pending withdrawals are insufficient.
;;     u4002: Insufficient funds for fee  amount must exceed the fee.
;;     u2004: Not manager  caller is not the contract manager.
;;     u4003: Insufficient fee balance.
;;     u2005: Unauthorized fee collector  caller is not authorized for fee collection.
;;     u2006: No operator  sponsor operator not set.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-constant ERR-PRECONDITION-FAILED (err u1001))
(define-constant ERR-PERMISSION-DENIED (err u2001))
(define-constant ERR-UNAUTHORIZED-SPONSOR-OPERATOR (err u2002))
(define-constant ERR-NOT-CURRENT-OPERATOR (err u2003))
(define-constant ERR-CONTRACT-LOCKED (err u3001))
(define-constant ERR-INSUFFICIENT-FUNDS (err u4001))
(define-constant ERR-INSUFFICIENT-FUNDS-FOR-FEE (err u4002))
(define-constant ERR-NOT-MANAGER (err u2004))
(define-constant ERR-INSUFFICIENT-FEE-BALANCE (err u4003))
(define-constant ERR-UNAUTHORIZED-FEE-COLLECTOR (err u2005))
(define-constant ERR-NO-OPERATOR (err u2006))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Withdrawal Configuration:
;;   blockstowithdraw:
;;     The number of blocks that must pass between a withdrawal request and its execution.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-data-var blocks-to-withdraw uint u5)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Governance Fee Ratio:
;;   The percentage (0-100) of fees allocated to the governance treasury.
;;   Default value: 30%.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-data-var governance-fee-ratio uint u30)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Treasury Balances:
;;   governancetreasury: Accumulated fees allocated for governance.
;;   operatortreasury:   Accumulated fees allocated for the operator.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-data-var governance-treasury uint u0)
(define-data-var operator-treasury uint u0)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Governance Treasury Withdrawer:
;;   The principal authorized to withdraw tokens from the governance treasury.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-data-var governance-withdrawer principal tx-sender)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Data Maps:
;;   Wallet Data Map:
;;     Stores wallet information for each principal, including:
;;       balance:                   The available balance for immediate use.
;;       withdrawrequestedamount: The amount requested for withdrawal.
;;       withdrawrequestedblock:  The block height when the withdrawal was requested.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-map wallet-data principal 
    {
        balance: uint,
        withdraw-requested-amount: uint,
        withdraw-requested-block: uint
    })

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; State Variables (Access Control):
;;   contractmanager:        The highest authority for administrative actions.
;;   sponsoroperator:        The only principal allowed to submit signed transfers.
;;                              (Set during contract deployment)
;;   feecollectoroperator:  The authorized principal for fee collection operations.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-data-var contract-manager principal tx-sender)
(define-data-var sponsor-operator principal tx-sender)
(define-data-var fee-collector-operator principal tx-sender)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; ReadOnly Functions:
;;   getwalletdata(user):
;;         Returns wallet information for the given principal.
;;         If no data exists, returns default values.
;;
;;   getsponsoroperator():
;;         Returns the current sponsor (operator) principal.
;;
;;   getcontractmanager():
;;         Returns the current contract manager.
;;
;;   getfeecollectoroperator():
;;         Returns the fee collector operator.
;;
;;   getblockstowithdraw():
;;         Returns the number of blocks required for a withdrawal.
;;
;;   getgovernancetreasury():
;;         Returns the current governance treasury balance.
;;
;;   getoperatortreasury():
;;         Returns the current operator treasury balance.
;;
;;   getgovernancewithdrawer():
;;         Returns the principal authorized to withdraw from the governance treasury.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-read-only (get-wallet-data (user principal))
    (default-to 
        {
            balance: u0,
            withdraw-requested-amount: u0,
            withdraw-requested-block: u0
        }
        (map-get? wallet-data user)
    ))

(define-read-only (get-sponsor-operator)
    (var-get sponsor-operator))

(define-read-only (get-contract-manager)
    (var-get contract-manager))

(define-read-only (get-fee-collector-operator)
    (var-get fee-collector-operator))

(define-read-only (get-blocks-to-withdraw)
    (var-get blocks-to-withdraw))

(define-read-only (get-governance-treasury)
    (var-get governance-treasury))

(define-read-only (get-operator-treasury)
    (var-get operator-treasury))

(define-read-only (get-governance-withdrawer)
    (var-get governance-withdrawer))

(define-read-only (get-governance-fee-ratio)
    (var-get governance-fee-ratio))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Public Functions:
;;
;; transfer:
;;   Initiates a direct token transfer from the sender to a recipient.
;;   Parameters:
;;     amount: uint                   The amount of tokens to transfer.
;;     recipient: principal           The destination wallet.
;;     memo: (optional (buff 34))      Optional memo attached to the transfer.
;;     fee: uint                      The fee amount for the transfer.
;;   Process:
;;     Deducts the transfer fee by calling payfee.
;;     Transfers tokens directly from sender to recipient.
;;     Emits a transfer event.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (transfer (amount uint) (recipient principal) (memo (optional (buff 34))) (fee uint))
    (let (
          (sender tx-sender)
         )
        (try! (pay-fee fee))
        
        ;; Call the token transfer function
        (try! (contract-call? .sbtc-token transfer amount tx-sender recipient memo))
        
        (print {
            event: "transfer",
            sender: tx-sender,
            amount: amount,
            recipient: recipient,
            fee: fee,
            memo: (match memo to-print (print to-print) 0x)
        })
        (ok true)
    )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; deposit:
;;   Deposits tokens into a recipients wallet.
;;   Parameters:
;;     amount: uint                   The amount to deposit.
;;     recipient: principal           The recipient wallet.
;;     memo: (optional (buff 34))      Optional memo.
;;   Process:
;;     Validates that the deposit amount is greater than zero.
;;     Updates the wallet balance.
;;     Forwards tokens to the contract via a token transfer.
;;     Emits a deposit event.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (deposit
                    (amount uint)
                    (recipient principal)
                    (memo (optional (buff 34))))
    (let (
            (wd (get-wallet-data recipient))
        )
        (asserts! (> amount u0) ERR-PRECONDITION-FAILED)
        (map-set wallet-data recipient
            (merge wd { balance: (+ (get balance wd) amount) }))
        (match memo to-print (print to-print) 0x)
        (try! (contract-call? .sbtc-token transfer amount tx-sender (as-contract tx-sender) memo))
        (print {
            event: "deposit",
            sender: tx-sender,
            amount: amount,
            recipient: recipient
        })
        (ok true)
    )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; sponsored-deposit:
;;   Deposits tokens from an authorized sponsor operator with fee handling.
;;   Parameters:
;;     amount: uint                   The deposit amount (must exceed fee).
;;     recipient: principal           The recipient wallet.
;;     memo: (optional (buff 34))      Optional memo.
;;     fee: uint                      The fee amount for the deposit.
;;   Process:
;;     Verifies sponsor operator authorization.
;;     Validates deposit amount exceeds fee.
;;     Updates recipients balance (amount minus fee).
;;     Collects and distributes fee.
;;     Transfers tokens to contract.
;;     Emits a sponsored-deposit event.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (sponsored-deposit 
                    (amount uint)
                    (recipient principal)
                    (memo (optional (buff 34)))
                    (fee uint))
    (let (
        (recipient-wallet (get-wallet-data recipient))
    )
        (asserts! (is-eq (unwrap! tx-sponsor? ERR-NO-OPERATOR) (var-get sponsor-operator)) ERR-UNAUTHORIZED-SPONSOR-OPERATOR)
        (asserts! (> amount u0) ERR-PRECONDITION-FAILED)
        (map-set wallet-data recipient
            (merge recipient-wallet { balance: (+ (get balance recipient-wallet) amount) }))
        (split-fee fee)
        (try! (contract-call? .sbtc-token transfer (+ amount fee) tx-sender (as-contract tx-sender) memo))
        (print {
            event: "sponsored-deposit",
            sender: tx-sender,
            amount: amount,
            recipient: recipient,
            fee: fee
        })
        (ok true)
    )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; internal-transfer:
;;   Executes a transfer between wallets within the contracts balance tracking.
;;   Parameters:
;;     amount: uint                   The transfer amount.
;;     recipient: principal           The destination wallet.
;;     memo: (optional (buff 34))      Optional memo.
;;     fee: uint                      The fee amount for the transfer.
;;   Process:
;;     Validates operator authorization.
;;     Checks available balance including pending withdrawals.
;;     Deducts amount and fee from senders tracked balance.
;;     Credits amount to recipients tracked balance.
;;     Splits and distributes the fee.
;;     Emits an internal-transfer event.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (internal-transfer 
                (amount uint)
                (recipient principal)
                (memo (optional (buff 34)))
                (fee uint))
    (let (
        (sender tx-sender)
        (sender-data (get-wallet-data sender))
        (current-balance (get balance sender-data))
        (withdraw-amount (get withdraw-requested-amount sender-data))
        (balance-required (+ amount fee))
        (recipient-wallet (get-wallet-data recipient))
    )
        (asserts! (is-eq (unwrap! tx-sponsor? ERR-NO-OPERATOR) (var-get sponsor-operator)) ERR-UNAUTHORIZED-SPONSOR-OPERATOR)
        (asserts! (>= (+ current-balance withdraw-amount) balance-required) ERR-INSUFFICIENT-FUNDS)
        
        (if (>= current-balance balance-required)
            (map-set wallet-data sender 
                (merge sender-data { balance: (- current-balance balance-required) }))
            (let ((remaining-amount (- balance-required current-balance)))
                (map-set wallet-data sender 
                    (merge sender-data { 
                        balance: u0,
                        withdraw-requested-amount: (- withdraw-amount remaining-amount)
                    }))
            )
        )

        (map-set wallet-data recipient 
            (merge recipient-wallet 
                { balance: (+ (get balance recipient-wallet) amount) }))
        
        (split-fee fee)
        
        (print {
            event: "internal-transfer",
            sender: tx-sender,
            amount: amount,
            recipient: recipient,
            fee: fee,
            memo: (match memo to-print (print to-print) 0x)
        })
        (ok true)
    ))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; external-transfer:
;;   Executes an external transfer from the contracts internal wallet to an external wallet.
;;   Parameters:
;;     amount: uint                   The transfer amount.
;;     recipient: principal           The destination wallet.
;;     memo: (optional (buff 34))      Optional memo.
;;     fee: uint                      The fee amount for the transfer.
;;   Process:
;;     Validates operator authorization.
;;     Verifies available funds (including pending withdrawals).
;;     Deducts funds and fee from senders wallet.
;;     Splits and distributes the fee.
;;     Transfers tokens from contract to external wallet.
;;     Emits an external-transfer event.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (external-transfer 
                (amount uint)
                (recipient principal)
                (memo (optional (buff 34)))
                (fee uint))
    (let (
        (sender tx-sender)
        (sender-data (get-wallet-data sender))
        (current-balance (get balance sender-data))
        (withdraw-amount (get withdraw-requested-amount sender-data))
        (balance-required (+ amount fee))
    )
        (asserts! (is-eq (unwrap! tx-sponsor? ERR-NO-OPERATOR) (var-get sponsor-operator)) ERR-UNAUTHORIZED-SPONSOR-OPERATOR)
        (asserts! (>= (+ current-balance withdraw-amount) amount) ERR-INSUFFICIENT-FUNDS)
        
        (if (>= current-balance balance-required)
            (map-set wallet-data sender 
                (merge sender-data { balance: (- current-balance balance-required) }))
            (let ((remaining-amount (- balance-required current-balance)))
                (map-set wallet-data sender 
                    (merge sender-data { 
                        balance: u0,
                        withdraw-requested-amount: (- withdraw-amount remaining-amount)
                    }))
            )
        )

        (match memo to-print (print to-print) 0x)
        (split-fee fee)
        (try! (as-contract (contract-call? .sbtc-token transfer 
            amount
            tx-sender 
            recipient 
            memo)))
        (print {
            event: "external-transfer",
            sender: tx-sender,
            amount: amount,
            recipient: recipient,
            fee: fee
        })
        (ok true)
    ))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; payfee:
;;   Allows anyone to deposit fee funds directly to the contract.
;;   Splits the paid fee between governance and operator treasuries.
;;   Parameters:
;;     amount: uint  The fee amount to be paid.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (pay-fee (amount uint))
    (begin
        (asserts! (> amount u0) ERR-PRECONDITION-FAILED)
        (try! (contract-call? .sbtc-token transfer amount tx-sender (as-contract tx-sender) none))
        (split-fee amount)
        (print {
            event: "pay-fee",
            amount: amount,
            fee: amount
        })
        (ok true)
    ))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; splitfee (private):
;;   Splits and distributes fees between the governance and operator treasuries.
;;   Parameters:
;;     amount: uint   The fee amount to split.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-private (split-fee (amount uint))
    (let (
        (gov-ratio (var-get governance-fee-ratio))
        (gov-amount (/ (* amount gov-ratio) u100))
        (op-amount (- amount gov-amount))
    )
        (var-set governance-treasury (+ (var-get governance-treasury) gov-amount))
        (var-set operator-treasury (+ (var-get operator-treasury) op-amount))
    ))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; deposit-governance-treasury:
;;   Allows direct deposits to the governance treasury.
;;   Parameters:
;;     amount: uint  The amount to deposit to governance treasury.
;;   Process:
;;     Validates amount is greater than zero.
;;     Transfers tokens from sender to contract.
;;     Updates governance treasury balance.
;;     Emits a deposit event.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (deposit-governance-treasury (amount uint))
    (begin
        (asserts! (> amount u0) ERR-PRECONDITION-FAILED)
        (try! (contract-call? .sbtc-token transfer amount tx-sender (as-contract tx-sender) none))
        (var-set governance-treasury (+ (var-get governance-treasury) amount))
        (print {
            event: "deposit-governance-treasury",
            sender: tx-sender,
            amount: amount
        })
        (ok true)
    ))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Administrative Functions:
;;
;; set-sponsor-operator:
;;   Parameters:
;;     new-operator: principal    The address to set as new operator.
;;   Access: Only the contract manager can execute.
;;   Process:
;;     Validates caller is contract manager.
;;     Updates sponsor operator to new address.
;;     Emits event on success.
;;
;; set-governance-fee-ratio:
;;   Parameters:
;;     new-ratio: uint          The new governance ratio (0-100).
;;   Access: Only the contract manager can execute.
;;   Process: 
;;     Validates caller is contract manager.
;;     Validates ratio is between 0-100.
;;     Updates fee configuration.
;;     Emits event on success.
;;
;; set-contract-manager:
;;   Parameters:
;;     new-manager: principal    The address to set as new manager.
;;   Access: Only the current contract manager can execute.
;;   Process:
;;     Validates caller is current manager.
;;     Updates contract manager to new address.
;;     Emits event on success.
;;
;; set-fee-collector-operator:
;;   Parameters: 
;;     new-operator: principal   The address to set as fee collector.
;;   Access: Only the contract manager can execute.
;;   Process:
;;     Validates caller is contract manager.
;;     Updates fee collector operator.
;;     Emits event on success.
;;
;; set-governance-withdrawer:
;;   Parameters:
;;     new-withdrawer: principal  The address to set as governance withdrawer.
;;   Access: Only the contract manager can execute.
;;   Process:
;;     Validates caller is contract manager.
;;     Updates governance withdrawer address.
;;     Emits event on success.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-public (set-sponsor-operator (new-operator principal))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-manager)) ERR-NOT-MANAGER)
        (var-set sponsor-operator new-operator)
        (ok true)))

(define-public (set-governance-fee-ratio (new-ratio uint))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-manager)) ERR-NOT-MANAGER)
        (asserts! (<= new-ratio u100) ERR-PRECONDITION-FAILED)
        (var-set governance-fee-ratio new-ratio)
        (ok true)))

(define-public (set-contract-manager (new-manager principal))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-manager)) ERR-NOT-MANAGER)
        (var-set contract-manager new-manager)
        (ok true)))

(define-public (set-fee-collector-operator (new-operator principal))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-manager)) ERR-NOT-MANAGER)
        (var-set fee-collector-operator new-operator)
        (ok true)))

(define-public (set-governance-withdrawer (new-withdrawer principal))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-manager)) ERR-NOT-MANAGER)
        (var-set governance-withdrawer new-withdrawer)
        (ok true)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Treasury Withdrawal Functions:
;;
;; withdrawgovernancetreasury:
;;   Allows the designated governance withdrawer to withdraw tokens from the governance treasury.
;;   Validates that sufficient funds are available.
;;   Emits a withdrawal event.
;;
;; withdrawoperatortreasury:
;;   Allows the fee collector operator to withdraw tokens from the operator treasury.
;;   Validates that sufficient funds are available.
;;   Emits a withdrawal event.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-public (withdraw-governance-treasury (amount uint) (recipient principal))
    (let ((current-balance (var-get governance-treasury)))
        (asserts! (is-eq tx-sender (var-get governance-withdrawer)) ERR-UNAUTHORIZED-FEE-COLLECTOR)
        (asserts! (>= current-balance amount) ERR-INSUFFICIENT-FEE-BALANCE)
        (var-set governance-treasury (- current-balance amount))
        (try! (as-contract (contract-call? .sbtc-token transfer 
            amount
            tx-sender 
            recipient
            none)))
        (print {
            event: "withdraw-governance-treasury",
            sender: tx-sender,
            amount: amount,
            recipient: recipient
        })
        (ok true)))

(define-public (withdraw-operator-treasury (amount uint) (recipient principal))
    (let ((current-balance (var-get operator-treasury)))
        (asserts! (is-eq tx-sender (var-get fee-collector-operator)) ERR-UNAUTHORIZED-FEE-COLLECTOR)
        (asserts! (>= current-balance amount) ERR-INSUFFICIENT-FEE-BALANCE)
        (var-set operator-treasury (- current-balance amount))
        (try! (as-contract (contract-call? .sbtc-token transfer 
            amount
            tx-sender 
            recipient
            none)))
        (print {
            event: "withdraw-operator-treasury",
            sender: tx-sender,
            amount: amount,
            recipient: recipient
        })
        (ok true)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; request-withdrawal:
;;   Initiates a withdrawal request with timelock protection.
;;   Parameters:
;;     amount: uint  The amount to request for withdrawal.
;;   Process:
;;     Validates sufficient available balance.
;;     Moves tokens from available balance to withdrawal-requested state.
;;     Records withdrawal amount and current block height.
;;     Updates wallet data.
;;   Returns: (ok true) if successful, appropriate error if not.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (request-withdrawal (amount uint))
    (let (
        (user contract-caller)
        (sender-data (get-wallet-data user))
        (current-balance (get balance sender-data))
    )
        (asserts! (>= current-balance amount) ERR-INSUFFICIENT-FUNDS)
        (map-set wallet-data user
            (merge sender-data {
                balance: (- current-balance amount),
                withdraw-requested-amount: (+ (get withdraw-requested-amount sender-data) amount),
                withdraw-requested-block: stacks-block-height
            }))
        (ok true)
    ))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; claim-withdrawal:
;;   Executes a withdrawal after timelock period has passed.
;;   Process:
;;     Verifies withdrawal request exists.
;;     Validates timelock period has elapsed.
;;     Clears withdrawal request data.
;;     Transfers requested tokens to user.
;;     Emits a claim-withdrawal event.
;;   Returns: (ok true) if successful, appropriate error if not.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (claim-withdrawal)
    (let (
        (user contract-caller)
        (sender-data (get-wallet-data user))
        (withdraw-amount (get withdraw-requested-amount sender-data))
        (request-block (get withdraw-requested-block sender-data))
    )
        (asserts! (> withdraw-amount u0) ERR-INSUFFICIENT-FUNDS)
        (asserts! (>= stacks-block-height (+ request-block (var-get blocks-to-withdraw))) ERR-PRECONDITION-FAILED)
        (map-set wallet-data user
            (merge sender-data {
                withdraw-requested-amount: u0,
                withdraw-requested-block: u0
            }))
        (try! (as-contract (contract-call? .sbtc-token transfer 
            withdraw-amount
            tx-sender 
            user
            none)))
        (print {
            event: "claim-withdrawal",
            sender: tx-sender,
            amount: withdraw-amount,
            recipient: user
        })
        (ok true)
    ))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; setblockstowithdraw:
;;   Configures the number of blocks required for a withdrawal request to become claimable.
;;   Parameters:
;;     blocks: uint  The new block count for the timelock.
;;   Access: Only the contract manager can execute.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (set-blocks-to-withdraw (blocks uint))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-manager)) ERR-NOT-MANAGER)
        (var-set blocks-to-withdraw blocks)
        (ok true)))
