import { BaseWalletSubprovider } from "@0x/subproviders/lib/src/subproviders/base_wallet_subprovider";
import { PartialTxParams } from "@0x/subproviders";
/**
 * Subprovider for interfacing with a user's [Ledger Nano S](https://www.ledgerwallet.com/products/ledger-nano-s).
 * This subprovider intercepts all account related RPC requests (e.g message/transaction signing, etc...) and
 * re-routes them to a Ledger device plugged into the users computer.
 */
export declare class LedgerSubprovider extends BaseWalletSubprovider {
    private readonly _networkId;
    private _baseDerivationPath;
    selectedAccountIndex: number;
    /**
     * Instantiates a LedgerSubprovider. Defaults to derivationPath set to `44'/60'/x'`.
     * TestRPC/Ganache defaults to `m/44'/60'/x'/0`, so set this in the configs if desired.
     * @param config Several available configurations
     * @return LedgerSubprovider instance
     */
    constructor({ networkId, baseDerivationPath, }: {
        networkId: number;
        baseDerivationPath?: string;
    });
    /**
     * Retrieve the set derivation path
     * @returns derivation path
     */
    getPath(): string;
    /**
     * Set a desired derivation path when computing the available user addresses
     * @param basDerivationPath The desired derivation path (e.g `44'/60'/0'`)
     */
    setPath(basDerivationPath: string): void;
    /**
     * Retrieve a users Ledger accounts. The accounts are derived from the derivationPath,
     * master public key and chain code. Because of this, you can request as many accounts
     * as you wish and it only requires a single request to the Ledger device. This method
     * is automatically called when issuing a `eth_accounts` JSON RPC request via your providerEngine
     * instance.
     * @param numberOfAccounts Number of accounts to retrieve (default: 10)
     * @param from
     * @return An array of accounts
     */
    getAccountsAsync(numberOfAccounts?: number, from?: number): Promise<string[]>;
    /**
     * Signs a transaction on the Ledger with the account specificed by the `from` field in txParams.
     * If you've added the LedgerSubprovider to your app's provider, you can simply send an `eth_sendTransaction`
     * JSON RPC request, and this method will be called auto-magically. If you are not using this via a ProviderEngine
     * instance, you can call it directly.
     * @param txParams Parameters of the transaction to sign
     * @return Signed transaction hex string
     */
    signTransactionAsync(txParams: PartialTxParams): Promise<string>;
    private static makeError;
    /**
     * Sign a personal Ethereum signed message. The signing account will be the account
     * associated with the provided address.
     * The Ledger adds the Ethereum signed message prefix on-device.  If you've added
     * the LedgerSubprovider to your app's provider, you can simply send an `eth_sign`
     * or `personal_sign` JSON RPC request, and this method will be called auto-magically.
     * If you are not using this via a ProviderEngine instance, you can call it directly.
     * @param data Hex string message to sign
     * @param address Address of the account to sign with
     * @return Signature hex string (order: rsv)
     */
    signPersonalMessageAsync(data: string, address: string): Promise<string>;
    /**
     * eth_signTypedData is currently not supported on Ledger devices.
     * @return Signature hex string (order: rsv)
     */
    signTypedDataAsync(): Promise<string>;
}
