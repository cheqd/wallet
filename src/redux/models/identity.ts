import { createModel } from '@rematch/core';
import { IdentityWallet, RootModel } from '../../models';

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
