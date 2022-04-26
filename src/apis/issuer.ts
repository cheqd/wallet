import axios from 'axios';
import { Credential } from '../models';

export const getCredential = async (): Promise<Credential> => {
	const resp = await axios.get<Credential>(process.env.REACT_APP_ISSUER_URL + '/api/credentials/issue');
	return resp.data;
};
