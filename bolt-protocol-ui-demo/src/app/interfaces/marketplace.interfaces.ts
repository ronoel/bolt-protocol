export interface MarketplaceAd {
    id: string;
    seller: string;
    telegramId: string;
    price: number;
    quantity: number;
    location: string;
    timestamp: number;
    type: 'BUY' | 'SELL';
    status: 'ACTIVE' | 'LOCKED' | 'COMPLETED';
}

export interface InviteRequest {
    id: string;
    username: string;
    telegramId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    timestamp: number;
}

export interface UserProfile {
    username: string;
    telegramId: string;
    successfulTrades: number;
    disputesLost: number;
    reputation: number;
    availableInvites: number;
    transactions: Transaction[];
}

export interface Transaction {
    id: string;
    type: 'BUY' | 'SELL';
    amount: number;
    status: 'COMPLETED' | 'DISPUTED' | 'PENDING';
    timestamp: number;
    counterparty: string;
}
