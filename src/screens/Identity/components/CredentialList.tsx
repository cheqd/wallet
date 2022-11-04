import React from "react";
import { Credential as VerifiableCredential } from '../../../models';
import CredentialCard, { CredentialMode } from "./CredentialCard";

type Props = {
	credentialList: VerifiableCredential[] | undefined;
	handleShowCredential: (cred: VerifiableCredential) => void;
	handleRemoveCredential: (cred: VerifiableCredential) => void;
	handleSelectCredential: (cred: VerifiableCredential) => void;
	isCredentialSelected: (cred: VerifiableCredential) => boolean;
	mode: CredentialMode
}

const CredentialList: React.FC<Props> = ({
	credentialList, handleRemoveCredential, handleShowCredential, handleSelectCredential, isCredentialSelected, mode,
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
							handleSelectCredential={handleSelectCredential}
							isCredentialSelected={isCredentialSelected}
							mode={mode}
						/>
					)
				})
			}
		</div>
	)
}

export default CredentialList;
