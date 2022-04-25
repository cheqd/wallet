import axios from 'axios';

export interface LoadCryptoBoxResp<T> {
	cryptoBox: T;
}

export const backupCryptoBox = async <T>(accountId: string, data: T, authToken: string): Promise<void> => {
	await axios.post(process.env.REACT_APP_STORAGE_URL + '/cryptoBox', {
		accountID: accountId,
		cryptoBox: data,
		authToken,
	});
};

export const loadCryptoBox = async <T>(accountId: string, authToken: string): Promise<T | null> => {
	const resp = await axios.get<LoadCryptoBoxResp<T>>(process.env.REACT_APP_STORAGE_URL + `/cryptoBox/${accountId}`, {
		params: {
			authToken,
		},
		validateStatus: (status) => status === 200 || status === 404,
	});
	if (resp.status === 404) {
		return null;
	}

	return resp.data.cryptoBox;
};
