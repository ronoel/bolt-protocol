export const environment = {
    production: true,
    applicationName: 'BoltProto',
    network: "mainnet", // 'mainnet', 'testnet', 'devnet', 'mocknet'
    apiUrl: 'https://boltproto.org/api/v1',
    blockchainAPIUrl: 'https://api.hiro.so',
    boltProtocol: {
        contractAddress: 'SP3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02ZHQCMVJ',
        contractName: 'boltproto-sbtc-v2'
    },
    supportedAsset: {
        sBTC: {
            contractAddress: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4',
            contractName: 'sbtc-token',
            contractToken: 'sbtc-token',
            decimals: 8,
            name: 'sBTC',
            symbol: 'sBTC',
            image: 'https://ipfs.io/ipfs/bafkreiffe46h5voimvulxm2s4ddszdm4uli4rwcvx34cgzz3xkfcc2hiwi',
            fee: 20 // sats
        }
    }
};