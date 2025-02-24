;; Implement the `ft-trait` trait defined in the `ft-trait` contract
(impl-trait .sip-010-trait.sip-010-trait)

(define-fungible-token usdh-token)

(define-public (mint (amount uint) (recipient principal))
    (ft-mint? usdh-token amount recipient)
)

;; get the token balance of owner
(define-read-only (get-balance (owner principal))
  (begin
    (ok (ft-get-balance usdh-token owner))))

;; returns the total number of tokens
(define-read-only (get-total-supply)
  (ok (ft-get-supply usdh-token)))

;; returns the token name
(define-read-only (get-name)
  (ok "Example Token"))

;; the symbol or "ticker" for this token
(define-read-only (get-symbol)
  (ok "EXAMPLE"))

;; the number of decimals used
(define-read-only (get-decimals)
  (ok u8))

;; Transfers tokens to a recipient
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (if (is-eq tx-sender sender)
    (begin
      (try! (ft-transfer? usdh-token amount sender recipient))
      (print memo)
      (ok true)
    )
    (err u4)))

(define-public (get-token-uri)
  (ok (some u"https://example.com")))