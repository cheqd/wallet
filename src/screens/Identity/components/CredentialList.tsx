import React, { useState } from "react";
import Assets from 'assets';
import { Card, Button as CustomButton } from "components";
import { Credential as VerifiableCredential, Wallet } from '../../../models';
import { trunc } from "utils";
import { useTranslation } from "react-i18next";
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
