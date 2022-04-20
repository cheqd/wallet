import axios from 'axios';

export interface LoadCryptoBoxResp<T> {
	cryptoBox: T;
}

export const backupCryptoBox = async <T>(accountId: string, data: T): Promise<void> => {
	await axios.post(process.env.REACT_APP_STORAGE_URL + '/cryptoBox', {
		accountID: accountId,
		cryptoBox: data,
	});
};

export const loadCryptoBox = async <T>(accountId: string): Promise<T> => {
	const resp = await axios.get<LoadCryptoBoxResp<T>>(process.env.REACT_APP_STORAGE_URL + `/cryptoBox/${accountId}`);
	return resp.data.cryptoBox;
};
