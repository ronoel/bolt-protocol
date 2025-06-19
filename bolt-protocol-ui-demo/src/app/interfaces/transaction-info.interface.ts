export type SmartContractError = {
  code: number;
  message: string;
};

export interface SmartContractErrors {
  [key: number]: string;
}

export interface TransactionStatusInfo {
  pending: {
    title: string;
    message: string;
  };
  success: {
    title: string;
    message: string;
  };
  abort_by_post_condition: {
    title: string;
    message: string;
  };
  abort_by_response: {
    title: string;
    defaultMessage: string;
    errors: Record<number, string>;
  };
}

export interface TransactionProcessingInfo {
  type: string;
  txId: string;
  errors: SmartContractErrors;
}

export interface TransactionInfo {
  txId: string;
  title: string;
}


export interface BoltTransaction {
  txId: string;
  amount: bigint;
  fee: bigint;
  sender: string;
  recipient: string;
}