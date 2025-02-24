(define-constant ERR_NOT_OWNER (err u4)) ;; `tx-sender` or `contract-caller` tried to move a token it does not own.
(define-constant ERR_TRANSFER_INDEX_PREFIX u1000)

(define-fungible-token sbtc-token)
(define-fungible-token sbtc-token-locked)

(define-data-var token-name (string-ascii 32) "sBTC")
(define-data-var token-symbol (string-ascii 10) "sBTC")
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://ipfs.io/ipfs/bafkreibqnozdui4ntgoh3oo437lvhg7qrsccmbzhgumwwjf2smb3eegyqu"))
(define-constant token-decimals u8)

(define-public (mint (amount uint) (recipient principal))
    (ft-mint? sbtc-token amount recipient)
)

;; sip-010-trait

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
	(begin
		(asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) ERR_NOT_OWNER)
		(try! (ft-transfer? sbtc-token amount sender recipient))
		(match memo to-print (print to-print) 0x)
		(ok true)
	)
)

(define-read-only (get-name)
	(ok (var-get token-name))
)

(define-read-only (get-symbol)
	(ok (var-get token-symbol))
)

(define-read-only (get-decimals)
	(ok token-decimals)
)

(define-read-only (get-balance (who principal))
	(ok (+ (ft-get-balance sbtc-token who) (ft-get-balance sbtc-token-locked who)))
)

(define-read-only (get-balance-available (who principal))
	(ok (ft-get-balance sbtc-token who))
)

(define-read-only (get-balance-locked (who principal))
	(ok (ft-get-balance sbtc-token-locked who))
)

(define-read-only (get-total-supply)
	(ok (+ (ft-get-supply sbtc-token) (ft-get-supply sbtc-token-locked)))
)

(define-read-only (get-token-uri)
	(ok (var-get token-uri))
)