import { createModel } from '@rematch/core';
import { Credential, IdentityWallet, RootModel } from '../../models';
import update from 'immutability-helper';
import { loadCryptoBox } from '../../apis/storage';
import { decrypt } from '../../utils/cryptoBox';
import { fromBase64 } from '@lum-network/sdk-javascript/build/utils';

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
		setPassphrase(state, passphrase: string) {
			return {
				...state,
				passphrase,
			};
		},
		setWallet(state, wallet: IdentityWallet) {
			return {
				...state,
				wallet,
			};
		},
		addCredential(state, credential: Credential) {
			if (state.wallet == null) {
				throw Error('wallet must be set');
			}

			return update(state, { wallet: { credentials: { $push: [credential] } } });
		},
	},
	effects: (dispatch) => ({
		async createNewWallet() {
			dispatch.identity.setWallet({
				credentials: [],
			});
		},
		async loadWallet(accountId: string) {
			const cryptoBox = await loadCryptoBox<string>(accountId);
			const decrypted = await decrypt(fromBase64(cryptoBox), 'password');

			const textDecoder = new TextDecoder();
			const wallet = JSON.parse(textDecoder.decode(decrypted));

			dispatch.identity.setWallet(wallet);
		},
	}),
});
