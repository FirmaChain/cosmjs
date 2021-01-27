import { Header } from "../../../tendermint/types/types";
import { Any } from "../../../google/protobuf/any";
import Long from "long";
import { Duration } from "../../../google/protobuf/duration";
import { Coin } from "../../../cosmos/base/v1beta1/coin";
import _m0 from "protobufjs/minimal";
export declare const protobufPackage = "cosmos.staking.v1beta1";
/** BondStatus is the status of a validator. */
export declare enum BondStatus {
  /** BOND_STATUS_UNSPECIFIED - UNSPECIFIED defines an invalid validator status. */
  BOND_STATUS_UNSPECIFIED = 0,
  /** BOND_STATUS_UNBONDED - UNBONDED defines a validator that is not bonded. */
  BOND_STATUS_UNBONDED = 1,
  /** BOND_STATUS_UNBONDING - UNBONDING defines a validator that is unbonding. */
  BOND_STATUS_UNBONDING = 2,
  /** BOND_STATUS_BONDED - BONDED defines a validator that is bonded. */
  BOND_STATUS_BONDED = 3,
  UNRECOGNIZED = -1,
}
export declare function bondStatusFromJSON(object: any): BondStatus;
export declare function bondStatusToJSON(object: BondStatus): string;
/**
 * HistoricalInfo contains header and validator information for a given block.
 * It is stored as part of staking module's state, which persists the `n` most
 * recent HistoricalInfo
 * (`n` is set by the staking module's `historical_entries` parameter).
 */
export interface HistoricalInfo {
  header?: Header;
  valset: Validator[];
}
/**
 * CommissionRates defines the initial commission rates to be used for creating
 * a validator.
 */
export interface CommissionRates {
  rate: string;
  maxRate: string;
  maxChangeRate: string;
}
/** Commission defines commission parameters for a given validator. */
export interface Commission {
  commissionRates?: CommissionRates;
  updateTime?: Date;
}
/** Description defines a validator description. */
export interface Description {
  moniker: string;
  identity: string;
  website: string;
  securityContact: string;
  details: string;
}
/**
 * Validator defines a validator, together with the total amount of the
 * Validator's bond shares and their exchange rate to coins. Slashing results in
 * a decrease in the exchange rate, allowing correct calculation of future
 * undelegations without iterating over delegators. When coins are delegated to
 * this validator, the validator is credited with a delegation whose number of
 * bond shares is based on the amount of coins delegated divided by the current
 * exchange rate. Voting power can be calculated as total bonded shares
 * multiplied by exchange rate.
 */
export interface Validator {
  operatorAddress: string;
  consensusPubkey?: Any;
  jailed: boolean;
  status: BondStatus;
  tokens: string;
  delegatorShares: string;
  description?: Description;
  unbondingHeight: Long;
  unbondingTime?: Date;
  commission?: Commission;
  minSelfDelegation: string;
}
/** ValAddresses defines a repeated set of validator addresses. */
export interface ValAddresses {
  addresses: string[];
}
/**
 * DVPair is struct that just has a delegator-validator pair with no other data.
 * It is intended to be used as a marshalable pointer. For example, a DVPair can
 * be used to construct the key to getting an UnbondingDelegation from state.
 */
export interface DVPair {
  delegatorAddress: string;
  validatorAddress: string;
}
/** DVPairs defines an array of DVPair objects. */
export interface DVPairs {
  pairs: DVPair[];
}
/**
 * DVVTriplet is struct that just has a delegator-validator-validator triplet
 * with no other data. It is intended to be used as a marshalable pointer. For
 * example, a DVVTriplet can be used to construct the key to getting a
 * Redelegation from state.
 */
export interface DVVTriplet {
  delegatorAddress: string;
  validatorSrcAddress: string;
  validatorDstAddress: string;
}
/** DVVTriplets defines an array of DVVTriplet objects. */
export interface DVVTriplets {
  triplets: DVVTriplet[];
}
/**
 * Delegation represents the bond with tokens held by an account. It is
 * owned by one delegator, and is associated with the voting power of one
 * validator.
 */
export interface Delegation {
  delegatorAddress: string;
  validatorAddress: string;
  shares: string;
}
/**
 * UnbondingDelegation stores all of a single delegator's unbonding bonds
 * for a single validator in an time-ordered list.
 */
export interface UnbondingDelegation {
  delegatorAddress: string;
  validatorAddress: string;
  /** unbonding delegation entries */
  entries: UnbondingDelegationEntry[];
}
/** UnbondingDelegationEntry defines an unbonding object with relevant metadata. */
export interface UnbondingDelegationEntry {
  creationHeight: Long;
  completionTime?: Date;
  initialBalance: string;
  balance: string;
}
/** RedelegationEntry defines a redelegation object with relevant metadata. */
export interface RedelegationEntry {
  creationHeight: Long;
  completionTime?: Date;
  initialBalance: string;
  sharesDst: string;
}
/**
 * Redelegation contains the list of a particular delegator's redelegating bonds
 * from a particular source validator to a particular destination validator.
 */
export interface Redelegation {
  delegatorAddress: string;
  validatorSrcAddress: string;
  validatorDstAddress: string;
  /** redelegation entries */
  entries: RedelegationEntry[];
}
/** Params defines the parameters for the staking module. */
export interface Params {
  unbondingTime?: Duration;
  maxValidators: number;
  maxEntries: number;
  historicalEntries: number;
  bondDenom: string;
}
/**
 * DelegationResponse is equivalent to Delegation except that it contains a
 * balance in addition to shares which is more suitable for client responses.
 */
export interface DelegationResponse {
  delegation?: Delegation;
  balance?: Coin;
}
/**
 * RedelegationEntryResponse is equivalent to a RedelegationEntry except that it
 * contains a balance in addition to shares which is more suitable for client
 * responses.
 */
export interface RedelegationEntryResponse {
  redelegationEntry?: RedelegationEntry;
  balance: string;
}
/**
 * RedelegationResponse is equivalent to a Redelegation except that its entries
 * contain a balance in addition to shares which is more suitable for client
 * responses.
 */
export interface RedelegationResponse {
  redelegation?: Redelegation;
  entries: RedelegationEntryResponse[];
}
/**
 * Pool is used for tracking bonded and not-bonded token supply of the bond
 * denomination.
 */
export interface Pool {
  notBondedTokens: string;
  bondedTokens: string;
}
export declare const HistoricalInfo: {
  encode(message: HistoricalInfo, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): HistoricalInfo;
  fromJSON(object: any): HistoricalInfo;
  fromPartial(object: DeepPartial<HistoricalInfo>): HistoricalInfo;
  toJSON(message: HistoricalInfo): unknown;
};
export declare const CommissionRates: {
  encode(message: CommissionRates, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): CommissionRates;
  fromJSON(object: any): CommissionRates;
  fromPartial(object: DeepPartial<CommissionRates>): CommissionRates;
  toJSON(message: CommissionRates): unknown;
};
export declare const Commission: {
  encode(message: Commission, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): Commission;
  fromJSON(object: any): Commission;
  fromPartial(object: DeepPartial<Commission>): Commission;
  toJSON(message: Commission): unknown;
};
export declare const Description: {
  encode(message: Description, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): Description;
  fromJSON(object: any): Description;
  fromPartial(object: DeepPartial<Description>): Description;
  toJSON(message: Description): unknown;
};
export declare const Validator: {
  encode(message: Validator, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): Validator;
  fromJSON(object: any): Validator;
  fromPartial(object: DeepPartial<Validator>): Validator;
  toJSON(message: Validator): unknown;
};
export declare const ValAddresses: {
  encode(message: ValAddresses, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): ValAddresses;
  fromJSON(object: any): ValAddresses;
  fromPartial(object: DeepPartial<ValAddresses>): ValAddresses;
  toJSON(message: ValAddresses): unknown;
};
export declare const DVPair: {
  encode(message: DVPair, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): DVPair;
  fromJSON(object: any): DVPair;
  fromPartial(object: DeepPartial<DVPair>): DVPair;
  toJSON(message: DVPair): unknown;
};
export declare const DVPairs: {
  encode(message: DVPairs, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): DVPairs;
  fromJSON(object: any): DVPairs;
  fromPartial(object: DeepPartial<DVPairs>): DVPairs;
  toJSON(message: DVPairs): unknown;
};
export declare const DVVTriplet: {
  encode(message: DVVTriplet, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): DVVTriplet;
  fromJSON(object: any): DVVTriplet;
  fromPartial(object: DeepPartial<DVVTriplet>): DVVTriplet;
  toJSON(message: DVVTriplet): unknown;
};
export declare const DVVTriplets: {
  encode(message: DVVTriplets, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): DVVTriplets;
  fromJSON(object: any): DVVTriplets;
  fromPartial(object: DeepPartial<DVVTriplets>): DVVTriplets;
  toJSON(message: DVVTriplets): unknown;
};
export declare const Delegation: {
  encode(message: Delegation, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): Delegation;
  fromJSON(object: any): Delegation;
  fromPartial(object: DeepPartial<Delegation>): Delegation;
  toJSON(message: Delegation): unknown;
};
export declare const UnbondingDelegation: {
  encode(message: UnbondingDelegation, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): UnbondingDelegation;
  fromJSON(object: any): UnbondingDelegation;
  fromPartial(object: DeepPartial<UnbondingDelegation>): UnbondingDelegation;
  toJSON(message: UnbondingDelegation): unknown;
};
export declare const UnbondingDelegationEntry: {
  encode(message: UnbondingDelegationEntry, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): UnbondingDelegationEntry;
  fromJSON(object: any): UnbondingDelegationEntry;
  fromPartial(object: DeepPartial<UnbondingDelegationEntry>): UnbondingDelegationEntry;
  toJSON(message: UnbondingDelegationEntry): unknown;
};
export declare const RedelegationEntry: {
  encode(message: RedelegationEntry, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): RedelegationEntry;
  fromJSON(object: any): RedelegationEntry;
  fromPartial(object: DeepPartial<RedelegationEntry>): RedelegationEntry;
  toJSON(message: RedelegationEntry): unknown;
};
export declare const Redelegation: {
  encode(message: Redelegation, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): Redelegation;
  fromJSON(object: any): Redelegation;
  fromPartial(object: DeepPartial<Redelegation>): Redelegation;
  toJSON(message: Redelegation): unknown;
};
export declare const Params: {
  encode(message: Params, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): Params;
  fromJSON(object: any): Params;
  fromPartial(object: DeepPartial<Params>): Params;
  toJSON(message: Params): unknown;
};
export declare const DelegationResponse: {
  encode(message: DelegationResponse, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): DelegationResponse;
  fromJSON(object: any): DelegationResponse;
  fromPartial(object: DeepPartial<DelegationResponse>): DelegationResponse;
  toJSON(message: DelegationResponse): unknown;
};
export declare const RedelegationEntryResponse: {
  encode(message: RedelegationEntryResponse, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): RedelegationEntryResponse;
  fromJSON(object: any): RedelegationEntryResponse;
  fromPartial(object: DeepPartial<RedelegationEntryResponse>): RedelegationEntryResponse;
  toJSON(message: RedelegationEntryResponse): unknown;
};
export declare const RedelegationResponse: {
  encode(message: RedelegationResponse, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): RedelegationResponse;
  fromJSON(object: any): RedelegationResponse;
  fromPartial(object: DeepPartial<RedelegationResponse>): RedelegationResponse;
  toJSON(message: RedelegationResponse): unknown;
};
export declare const Pool: {
  encode(message: Pool, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number | undefined): Pool;
  fromJSON(object: any): Pool;
  fromPartial(object: DeepPartial<Pool>): Pool;
  toJSON(message: Pool): unknown;
};
declare type Builtin = Date | Function | Uint8Array | string | number | undefined | Long;
export declare type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : Partial<T>;
export {};
