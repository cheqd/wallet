import axios from 'axios';
import { Credential } from '../models';

export const getCredential = async (subjectId: string, claims: string[]): Promise<Credential> => {
	const resp = await axios.post<Credential>(process.env.REACT_APP_IDENTITY_ENDPOINT + '/api/credentials/issue/123', {
		subjectId,
		claims
	});
	return resp.data;
};
