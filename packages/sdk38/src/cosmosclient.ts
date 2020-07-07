import { Sha256 } from "@cosmjs/crypto";
import { fromBase64, fromHex, toHex } from "@cosmjs/encoding";
import { Uint53 } from "@cosmjs/math";

import { Coin } from "./coins";
import { AuthModule, BroadcastMode, LcdClient, setupAuthModule } from "./lcdapi";
import { Log, parseLogs } from "./logs";
import { decodeBech32Pubkey } from "./pubkey";
import { CosmosSdkTx, PubKey, StdTx } from "./types";

export interface GetNonceResult {
  readonly accountNumber: number;
  readonly sequence: number;
}

export interface Account {
  /** Bech32 account address */
  readonly address: string;
  readonly balance: readonly Coin[];
  readonly pubkey: PubKey | undefined;
  readonly accountNumber: number;
  readonly sequence: number;
}

export interface PostTxFailure {
  /** Transaction hash (might be used as transaction ID). Guaranteed to be non-empty upper-case hex */
  readonly transactionHash: string;
  readonly height: number;
  readonly code: number;
  readonly rawLog: string;
}

export interface PostTxSuccess {
  readonly logs: readonly Log[];
  readonly rawLog: string;
  /** Transaction hash (might be used as transaction ID). Guaranteed to be non-empty upper-case hex */
  readonly transactionHash: string;
  readonly data?: Uint8Array;
}

export type PostTxResult = PostTxSuccess | PostTxFailure;

export function isPostTxFailure(postTxResult: PostTxResult): postTxResult is PostTxFailure {
  return !!(postTxResult as PostTxFailure).code;
}

export interface SearchByIdQuery {
  readonly id: string;
}

export interface SearchByHeightQuery {
  readonly height: number;
}

export interface SearchBySentFromOrToQuery {
  readonly sentFromOrTo: string;
}

/**
 * This query type allows you to pass arbitrary key/value pairs to the backend. It is
 * more powerful and slightly lower level than the other search options.
 */
export interface SearchByTagsQuery {
  readonly tags: ReadonlyArray<{ readonly key: string; readonly value: string }>;
}

export type SearchTxQuery =
  | SearchByIdQuery
  | SearchByHeightQuery
  | SearchBySentFromOrToQuery
  | SearchByTagsQuery;

function isSearchByIdQuery(query: SearchTxQuery): query is SearchByIdQuery {
  return (query as SearchByIdQuery).id !== undefined;
}

function isSearchByHeightQuery(query: SearchTxQuery): query is SearchByHeightQuery {
  return (query as SearchByHeightQuery).height !== undefined;
}

function isSearchBySentFromOrToQuery(query: SearchTxQuery): query is SearchBySentFromOrToQuery {
  return (query as SearchBySentFromOrToQuery).sentFromOrTo !== undefined;
}

function isSearchByTagsQuery(query: SearchTxQuery): query is SearchByTagsQuery {
  return (query as SearchByTagsQuery).tags !== undefined;
}

export interface SearchTxFilter {
  readonly minHeight?: number;
  readonly maxHeight?: number;
}

/** A transaction that is indexed as part of the transaction history */
export interface IndexedTx {
  readonly height: number;
  /** Transaction hash (might be used as transaction ID). Guaranteed to be non-empty upper-case hex */
  readonly hash: string;
  /** Transaction execution error code. 0 on success. */
  readonly code: number;
  readonly rawLog: string;
  readonly logs: readonly Log[];
  readonly tx: CosmosSdkTx;
  /** The gas limit as set by the user */
  readonly gasWanted?: number;
  /** The gas used by the execution */
  readonly gasUsed?: number;
  /** An RFC 3339 time string like e.g. '2020-02-15T10:39:10.4696305Z' */
  readonly timestamp: string;
}

export interface BlockHeader {
  readonly version: {
    readonly block: string;
    readonly app: string;
  };
  readonly height: number;
  readonly chainId: string;
  /** An RFC 3339 time string like e.g. '2020-02-15T10:39:10.4696305Z' */
  readonly time: string;
}

export interface Block {
  /** The ID is a hash of the block header (uppercase hex) */
  readonly id: string;
  readonly header: BlockHeader;
  /** Array of raw transactions */
  readonly txs: readonly Uint8Array[];
}

/** Use for testing only */
export interface PrivateCosmWasmClient {
  readonly lcdClient: LcdClient & AuthModule;
}

export class CosmosClient {
  protected readonly lcdClient: LcdClient & AuthModule;
  /** Any address the chain considers valid (valid bech32 with proper prefix) */
  protected anyValidAddress: string | undefined;

  private chainId: string | undefined;

  /**
   * Creates a new client to interact with a CosmWasm blockchain.
   *
   * This instance does a lot of caching. In order to benefit from that you should try to use one instance
   * for the lifetime of your application. When switching backends, a new instance must be created.
   *
   * @param apiUrl The URL of a Cosmos SDK light client daemon API (sometimes called REST server or REST API)
   * @param broadcastMode Defines at which point of the transaction processing the postTx method (i.e. transaction broadcasting) returns
   */
  public constructor(apiUrl: string, broadcastMode = BroadcastMode.Block) {
    this.lcdClient = LcdClient.withModules({ apiUrl: apiUrl, broadcastMode: broadcastMode }, setupAuthModule);
  }

  public async getChainId(): Promise<string> {
    if (!this.chainId) {
      const response = await this.lcdClient.nodeInfo();
      const chainId = response.node_info.network;
      if (!chainId) throw new Error("Chain ID must not be empty");
      this.chainId = chainId;
    }

    return this.chainId;
  }

  public async getHeight(): Promise<number> {
    if (this.anyValidAddress) {
      const { height } = await this.lcdClient.auth.account(this.anyValidAddress);
      return parseInt(height, 10);
    } else {
      // Note: this gets inefficient when blocks contain a lot of transactions since it
      // requires downloading and deserializing all transactions in the block.
      const latest = await this.lcdClient.blocksLatest();
      return parseInt(latest.block.header.height, 10);
    }
  }

  /**
   * Returns a 32 byte upper-case hex transaction hash (typically used as the transaction ID)
   */
  public async getIdentifier(tx: CosmosSdkTx): Promise<string> {
    // We consult the REST API because we don't have a local amino encoder
    const response = await this.lcdClient.encodeTx(tx);
    const hash = new Sha256(fromBase64(response.tx)).digest();
    return toHex(hash).toUpperCase();
  }

  /**
   * Returns account number and sequence.
   *
   * Throws if the account does not exist on chain.
   *
   * @param address returns data for this address. When unset, the client's sender adddress is used.
   */
  public async getNonce(address: string): Promise<GetNonceResult> {
    const account = await this.getAccount(address);
    if (!account) {
      throw new Error(
        "Account does not exist on chain. Send some tokens there before trying to query nonces.",
      );
    }
    return {
      accountNumber: account.accountNumber,
      sequence: account.sequence,
    };
  }

  public async getAccount(address: string): Promise<Account | undefined> {
    const account = await this.lcdClient.auth.account(address);
    const value = account.result.value;
    if (value.address === "") {
      return undefined;
    } else {
      this.anyValidAddress = value.address;
      return {
        address: value.address,
        balance: value.coins,
        pubkey: value.public_key ? decodeBech32Pubkey(value.public_key) : undefined,
        accountNumber: value.account_number,
        sequence: value.sequence,
      };
    }
  }

  /**
   * Gets block header and meta
   *
   * @param height The height of the block. If undefined, the latest height is used.
   */
  public async getBlock(height?: number): Promise<Block> {
    const response =
      height !== undefined ? await this.lcdClient.blocks(height) : await this.lcdClient.blocksLatest();

    return {
      id: response.block_id.hash,
      header: {
        version: response.block.header.version,
        time: response.block.header.time,
        height: parseInt(response.block.header.height, 10),
        chainId: response.block.header.chain_id,
      },
      txs: (response.block.data.txs || []).map(fromBase64),
    };
  }

  public async searchTx(query: SearchTxQuery, filter: SearchTxFilter = {}): Promise<readonly IndexedTx[]> {
    const minHeight = filter.minHeight || 0;
    const maxHeight = filter.maxHeight || Number.MAX_SAFE_INTEGER;

    if (maxHeight < minHeight) return []; // optional optimization

    function withFilters(originalQuery: string): string {
      return `${originalQuery}&tx.minheight=${minHeight}&tx.maxheight=${maxHeight}`;
    }

    let txs: readonly IndexedTx[];
    if (isSearchByIdQuery(query)) {
      txs = await this.txsQuery(`tx.hash=${query.id}`);
    } else if (isSearchByHeightQuery(query)) {
      // optional optimization to avoid network request
      if (query.height < minHeight || query.height > maxHeight) {
        txs = [];
      } else {
        txs = await this.txsQuery(`tx.height=${query.height}`);
      }
    } else if (isSearchBySentFromOrToQuery(query)) {
      // We cannot get both in one request (see https://github.com/cosmos/gaia/issues/75)
      const sentQuery = withFilters(`message.module=bank&message.sender=${query.sentFromOrTo}`);
      const receivedQuery = withFilters(`message.module=bank&transfer.recipient=${query.sentFromOrTo}`);
      const sent = await this.txsQuery(sentQuery);
      const received = await this.txsQuery(receivedQuery);

      const sentHashes = sent.map((t) => t.hash);
      txs = [...sent, ...received.filter((t) => !sentHashes.includes(t.hash))];
    } else if (isSearchByTagsQuery(query)) {
      const rawQuery = withFilters(query.tags.map((t) => `${t.key}=${t.value}`).join("&"));
      txs = await this.txsQuery(rawQuery);
    } else {
      throw new Error("Unknown query type");
    }

    // backend sometimes messes up with min/max height filtering
    const filtered = txs.filter((tx) => tx.height >= minHeight && tx.height <= maxHeight);

    return filtered;
  }

  public async postTx(tx: StdTx): Promise<PostTxResult> {
    const result = await this.lcdClient.postTx(tx);
    if (!result.txhash.match(/^([0-9A-F][0-9A-F])+$/)) {
      throw new Error("Received ill-formatted txhash. Must be non-empty upper-case hex");
    }

    return result.code !== undefined
      ? {
          height: Uint53.fromString(result.height).toNumber(),
          transactionHash: result.txhash,
          code: result.code,
          rawLog: result.raw_log || "",
        }
      : {
          logs: result.logs ? parseLogs(result.logs) : [],
          rawLog: result.raw_log || "",
          transactionHash: result.txhash,
          data: result.data ? fromHex(result.data) : undefined,
        };
  }

  private async txsQuery(query: string): Promise<readonly IndexedTx[]> {
    // TODO: we need proper pagination support
    const limit = 100;
    const result = await this.lcdClient.txsQuery(`${query}&limit=${limit}`);
    const pages = parseInt(result.page_total, 10);
    if (pages > 1) {
      throw new Error(
        `Found more results on the backend than we can process currently. Results: ${result.total_count}, supported: ${limit}`,
      );
    }
    return result.txs.map(
      (restItem): IndexedTx => ({
        height: parseInt(restItem.height, 10),
        hash: restItem.txhash,
        code: restItem.code || 0,
        rawLog: restItem.raw_log,
        logs: parseLogs(restItem.logs || []),
        tx: restItem.tx,
        timestamp: restItem.timestamp,
      }),
    );
  }
}
