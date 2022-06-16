import { EncodeObject } from '@cosmjs/proto-signing';
import { StdFee } from '@cosmjs/stargate';
import { Any } from 'cosmjs-types/google/protobuf/any';

export interface Doc {
	/**
	 * chain_id is the unique identifier of the chain this transaction targets.
	 * It prevents signed transactions from being used on another chain by an
	 * attacker
	 */
	chainId: string;
	/**
	 * Transaction requested Fee
	 */
	fee: StdFee;
	/**
	 * Transaction memo
	 */
	memo?: string;
	/**
	 * Transactions messages
	 */
	messages: EncodeObject[];
	/**
	 * Transction auth signers
	 */
	signers: DocSigner[];
}

export interface DocSigner {
	/** the account number of the account in state */
	accountNumber: number;
	/** current account sequence */
	sequence: number;
	/** account public key */
	publicKey: Uint8Array;
}
