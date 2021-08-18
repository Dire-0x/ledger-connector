import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import Web3ProviderEngine from 'web3-provider-engine'
import CacheSubprovider from 'web3-provider-engine/subproviders/cache.js'
import { RPCSubprovider } from '@0x/subproviders/lib/src/subproviders/rpc_subprovider' // https://github.com/0xProject/0x-monorepo/issues/1400
import { LedgerSubprovider } from './subprovider'

interface LedgerConnectorArguments {
  chainId: number
  url: string
  pollingInterval?: number
  requestTimeoutMs?: number
  accountFetchingConfigs?: any
  baseDerivationPath?: string
}

export class LedgerConnector extends AbstractConnector {
  private readonly chainId: number
  private readonly url: string
  private readonly pollingInterval?: number
  private readonly requestTimeoutMs?: number

  private baseDerivationPath?: string
  private provider: any

  constructor({
    chainId,
    url,
    pollingInterval,
    requestTimeoutMs,
    baseDerivationPath
  }: LedgerConnectorArguments) {
    super({ supportedChainIds: [chainId] })

    this.chainId = chainId
    this.url = url
    this.pollingInterval = pollingInterval
    this.requestTimeoutMs = requestTimeoutMs
    this.baseDerivationPath = baseDerivationPath
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.provider) {
      const engine = new Web3ProviderEngine({ pollingInterval: this.pollingInterval })
      engine.addProvider(
        new LedgerSubprovider({
          networkId: this.chainId,
          baseDerivationPath: this.baseDerivationPath
        })
      )
      engine.addProvider(new CacheSubprovider())
      engine.addProvider(new RPCSubprovider(this.url, this.requestTimeoutMs))
      this.provider = engine
    }

    this.provider.start()

    return { provider: this.provider, chainId: this.chainId }
  }

  public async getProvider(): Promise<Web3ProviderEngine> {
    return this.provider
  }

  public async getChainId(): Promise<number> {
    return this.chainId
  }

  public async getAccount(): Promise<null> {
    return (await this.provider._providers[0].getAccountsAsync(1, this.getAccountIndex()))[0]
  }

  public async getAccounts(page: number = 1): Promise<string[]> {
    const perPage = 5
    return (await this.provider._providers[0].getAccountsAsync(perPage, (page-1)*perPage))
  }

  public getAccountIndex(): number {
    const provider: LedgerSubprovider = this.provider._providers[0]
    return provider.selectedAccountIndex
  }

  public async setDerivationPath(path: string): Promise<string> {
    this.baseDerivationPath = path
    this.provider._providers[0].setPath(this.baseDerivationPath)
    const address = (await this.provider._providers[0].getAccountsAsync(1, this.provider._providers[0].selectedAccountIndex))[0]
    this.emitUpdate({account:address})
    return address
  }

  public async setAccountIndex(index: number): Promise<string> {
    this.provider._providers[0].selectedAccountIndex = index
    const address = (await this.provider._providers[0].getAccountsAsync(1, index))[0]
    this.emitUpdate({account:address})
    return address
  }

  public deactivate() {
    this.provider.stop()
  }
}
