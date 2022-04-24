import { createModel } from '@rematch/core';
import { Credential, IdentityWallet, RootModel } from '../../models';
import update from 'immutability-helper';
import { loadCryptoBox } from '../../apis/storage';
import { fromBase64 } from '@lum-network/sdk-javascript/build/utils';
import { decryptIdentityWallet } from '../../utils/identityWalet';

interface IdentityState {
	authToken: string | null;
	passphrase: string | null;
	wallet: IdentityWallet | null;
}

export const identity = createModel<RootModel>()({
	name: 'identity',
	state: {
		authToken: null,
		passphrase: null,
		wallet: null,
	} as IdentityState,
	reducers: {
		setAuthToken(state, authToken: string) {
			return {
				...state,
				authToken,
			};
		},
		setPassphrase(state, passphrase: string | null) {
			return {
				...state,
				passphrase,
			};
		},
		setWallet(state, wallet: IdentityWallet | null) {
			return {
				...state,
				wallet,
			};
		},
	},
});
