import React from "react";
import { Credential as VerifiableCredential } from '../../../models';
import CredentialCard from "./CredentialCard";

type Props = {
	credentialList: VerifiableCredential[] | undefined;
	handleShowCredential: (cred: VerifiableCredential) => void;
	handleRemoveCredential: (cred: VerifiableCredential) => void;
}

const CredentialList: React.FC<Props> = ({
	credentialList, handleRemoveCredential, handleShowCredential,
}): JSX.Element => {
	return (
		<div className="row gy-4">
			{
				credentialList?.map((cred: VerifiableCredential, i) => {
					return (
						<CredentialCard
							key={i}
							cred={cred}
							handleShowCredential={handleShowCredential}
							handleRemoveCredential={handleRemoveCredential}
						/>
					)
				})
			}
		</div>
	)
}

export default CredentialList;
