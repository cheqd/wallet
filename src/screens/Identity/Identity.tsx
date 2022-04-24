import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router';

import { Button, Card } from 'frontend-elements';
import { Button as CustomButton, Input, Modal } from 'components';
import { RootDispatch, RootState } from 'redux/store';

import './styles/Identity.scss';
import { showErrorToast, showInfoToast, showSuccessToast } from 'utils';
import { getAuthToken } from '../../utils/walletAuth';
import { toBase64 } from '@lum-network/sdk-javascript/build/utils';
import { getCredential } from '../../apis/issuer';
import { useRematchDispatch } from '../../redux/hooks';
import { encrypt } from '../../utils/cryptoBox';
import { backupCryptoBox } from '../../apis/storage';
import { Credential as VerifiableCredential } from '../../models';
import { LumMessages } from '@lum-network/sdk-javascript';
import Delegate from '../Operations/components/Forms/Delegate';
import Redelegate from '../Operations/components/Forms/Redelegate';
import Undelegate from '../Operations/components/Forms/Undelegate';
import GetReward from '../Operations/components/Forms/GetReward';
import GetAllRewards from '../Operations/components/Forms/GetAllRewards';
import { Modal as BSModal } from 'bootstrap';

const Identity = (): JSX.Element => {
	const [modal, setModal] = useState<BSModal | null>(null);
	const [selectedCred, setSelectedCred] = useState<VerifiableCredential | null>(null);
	const modalRef = useRef<HTMLDivElement>(null);

	// Redux hooks
	const { wallet, identityWallet } = useSelector((state: RootState) => ({
		wallet: state.wallet.currentWallet,
		identityWallet: state.identity.wallet,
	}));

	// Dispatch methods
	const { addCredential, loadWallet, createNewWallet } = useRematchDispatch((dispatch: RootDispatch) => ({
		addCredential: dispatch.identity.addCredential,
		loadWallet: dispatch.identity.loadWallet,
		createNewWallet: dispatch.identity.createNewWallet,
	}));

	// Utils hooks
	const { t } = useTranslation();

	// Effects
	// useEffect(() => {
	// 	loadWallet().catch((e) => showErrorToast((e as Error).message));
	// }, [loadWallet]);
	useEffect(() => {
		if (modalRef && modalRef.current) {
			setModal(BSModal.getOrCreateInstance(modalRef.current));
		}
	}, []);

	if (!wallet) {
		return <Redirect to="/welcome" />;
	}

	// Methods
	const handleAuth = async () => {
		try {
			const authTokenBytes = await getAuthToken(wallet, process.env.REACT_APP_ISSUER_URL);
			console.log(toBase64(authTokenBytes));

			showInfoToast('Auth token generated');
		} catch (e) {
			showErrorToast((e as Error).message);
		}
	};

	const handleGetCredential = async () => {
		try {
			const cred = await getCredential();
			addCredential(cred);

			console.log('authBytes: ', toBase64(wallet.getPublicKey()));
			showSuccessToast('Credential added');
		} catch (e) {
			showErrorToast((e as Error).message);
		}
	};

	const handleLoadWallet = async () => {
		try {
			await loadWallet(wallet.getAddress());
			showSuccessToast('Wallet loaded');
		} catch (e) {
			showErrorToast((e as Error).message);
		}
	};

	const handleNewWallet = async () => {
		try {
			await createNewWallet();
			showSuccessToast('New wallet created');
		} catch (e) {
			showErrorToast((e as Error).message);
		}
	};

	const handleBackupWallet = async () => {
		try {
			if (identityWallet == null) {
				showErrorToast('No wallet to backup');
				return;
			}

			const encrypted = encrypt(JSON.stringify(identityWallet), '');
			await backupCryptoBox(wallet.getAddress(), encrypted);
			showSuccessToast('Wallet backed up');
		} catch (e) {
			showErrorToast((e as Error).message);
		}
	};

	const handleShowCredential = async (cred: React.SetStateAction<VerifiableCredential | null>) => {
		setSelectedCred(cred);
		modal?.show();
	};

	const handleRemoveCredential = async (cred: React.SetStateAction<VerifiableCredential | null>) => {
		identityWallet?.credentials.forEach((element, index) => {
			if (element == cred) identityWallet?.credentials.splice(index, 1);
		});
		modal?.hide();
		setSelectedCred(null);
	};

	return (
		<>
			<div className="mt-4">
				<div className="container">
					<div className="row gy-4">
						<div className="col-12">
							<Card className="d-flex flex-column h-100 justify-content-between">
								<div>
									<h2>{t('credentials.get.title')}</h2>
									<div className="my-4">{t('credentials.get.description')}</div>
								</div>
								<div className="d-flex flex-row justify-content-start">
									<CustomButton className="px-5" onClick={handleAuth}>
										{t('credentials.get.auth')}
									</CustomButton>
									<div className="mx-4">
										<CustomButton className="px-5" onClick={handleGetCredential}>
											{t('credentials.get.get')}
										</CustomButton>
									</div>
								</div>
							</Card>
						</div>
						<div className="col-12">
							<Card className="d-flex flex-column h-100 justify-content-between">
								<div>
									<h2>{t('credentials.list.title')}</h2>
								</div>
								<div className="row gy-4 mt-0">
									{identityWallet?.credentials.map((cred) => {
										return (
											<div className="col-lg-6 col-12" key={cred.id}>
												<Card className="d-flex flex-column h-100 justify-content-between">
													<button
														type="button"
														className="close-btn bg-white rounded-circle align-self-center"
														aria-label="Close"
														onClick={async () => await handleRemoveCredential(selectedCred)}
													>
														<div className="btn-close mx-auto" />
													</button>
													<div>
														<h2>Credential</h2>
														<p>Id: {cred.id}</p>
														<p>Issuer: {cred.issuer}</p>
														<p>Subject: {cred.credentialSubject.id}</p>
														<p>Twitter: {cred.credentialSubject.twitter_handle}</p>
													</div>
													<CustomButton
														className="mt-5"
														onClick={async () => await handleShowCredential(cred)}
													>
														{t('credentials.credential.show')}
													</CustomButton>
												</Card>
											</div>
										);
									})}
								</div>
								<div className="d-flex flex-row justify-content-start mt-4">
									<CustomButton className="px-5" onClick={handleBackupWallet}>
										{t('credentials.list.backup')}
									</CustomButton>
									<div className="mx-4">
										<CustomButton className="px-5" onClick={handleLoadWallet}>
											{t('credentials.list.load')}
										</CustomButton>
									</div>
									<div>
										<CustomButton className="px-5" onClick={handleNewWallet}>
											{t('credentials.list.new')}
										</CustomButton>
									</div>
								</div>
							</Card>
						</div>
					</div>
				</div>
			</div>
			<Modal
				ref={modalRef}
				id="modalCredentialDetails"
				withCloseButton={true}
				dataBsBackdrop="static"
				dataBsKeyboard={false}
				bodyClassName="w-100"
			>
				{selectedCred === null ? (
					<>
						<p className="color-error">{t('credentials.credential.notFound')}</p>
					</>
				) : (
					<>
						<div className="d-flex flex-column align-items-center">
							<h2 className="text-center">{t('credentials.credential.title')}</h2>
							<>
								<table className="table app-table-striped table-borderless my-4">
									<tbody>
										<tr>
											<td>
												<b>ID</b>
											</td>
											<td> {selectedCred.id}</td>
										</tr>
										<tr>
											<td>
												<b>ISSUER</b>
											</td>
											<td> {selectedCred.issuer}</td>
										</tr>
										<tr>
											<td>
												<b>SUBJECT</b>
											</td>
											<td> {selectedCred.credentialSubject.id}</td>
										</tr>
										<tr>
											<td>
												<b>TWITTER</b>
											</td>
											<td> {selectedCred.credentialSubject.twitter_handle}</td>
										</tr>
									</tbody>
								</table>
							</>
							<CustomButton
								className="mt-5"
								onClick={async () => await handleRemoveCredential(selectedCred)}
							>
								{t('credentials.credential.remove')}
							</CustomButton>
						</div>
					</>
				)}
			</Modal>
		</>
	);
};

export default Identity;
