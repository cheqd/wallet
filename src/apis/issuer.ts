import axios from 'axios';
import { Credential } from '../models';

export const getCredential = async (subjectId: string): Promise<Credential> => {
	const resp = await axios.get<Credential>(process.env.REACT_APP_ISSUER_URL + '/api/credentials/issue/' + subjectId);
	return resp.data;
};
