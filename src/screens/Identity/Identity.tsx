import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router';

import { Card } from 'frontend-elements';
import { Button, Button as CustomButton, Input, Modal } from 'components';
import store, { RootDispatch, RootState } from 'redux/store';
import { Button, Card } from 'frontend-elements';
import { Button as CustomButton, Input, Modal } from 'components';
import { RootDispatch, RootState } from 'redux/store';

import './styles/Identity.scss';
import { showErrorToast, showInfoToast, showSuccessToast, trunc } from 'utils';
import { getAuthToken } from '../../utils/walletAuth';
import { fromBase64, toBase64 } from '@lum-network/sdk-javascript/build/utils';
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
import { backupCryptoBox, loadCryptoBox } from '../../apis/storage';
import { decryptIdentityWallet, encryptIdentityWallet, tryDecryptIdentityWallet } from '../../utils/identityWalet';
import { Modal as BSModal } from 'bootstrap';
import update from 'immutability-helper';
import { LOGOUT } from '../../redux/constants';

const Identity = (): JSX.Element => {
	const [passphraseInput, setPassphraseInput] = useState('');

	const [modal, setModal] = useState<BSModal | null>(null);
	const [selectedCred, setSelectedCred] = useState<VerifiableCredential | null>(null);
	const modalRef = useRef<HTMLDivElement>(null);

	// Redux hooks
	const { wallet, identityWallet, authToken, passphrase } = useSelector((state: RootState) => ({
		wallet: state.wallet.currentWallet,
		identityWallet: state.identity.wallet,
		authToken: state.identity.authToken,
		passphrase: state.identity.passphrase,
	}));

	// Dispatch methods
	const { setAuthToken, setPassphrase, setWallet } = useRematchDispatch((dispatch: RootDispatch) => ({
		setAuthToken: dispatch.identity.setAuthToken,
		setPassphrase: dispatch.identity.setPassphrase,
		setWallet: dispatch.identity.setWallet,
	}));

	// Utils hooks
	const { t } = useTranslation();

	// Refs
	const authTokenRef = useRef<HTMLDivElement>(null);
	const passphraseRef = useRef<HTMLDivElement>(null);
	const invalidPassphraseRef = useRef<HTMLDivElement>(null);
	const resetConfirmationRef = useRef<HTMLDivElement>(null);

	// Effects
	useEffect(() => {
		if (modalRef && modalRef.current) {
			setModal(BSModal.getOrCreateInstance(modalRef.current));
		}
	}, []);

	if (!wallet) {
		return <Redirect to="/welcome" />;
	}

	// Methods
	const handleGetCredential = async () => {
		try {
			if (!identityWallet) {
				showErrorToast(t('identity.wallet.error.locked'));
				return;
			}

			// Get credential
			const cred = await getCredential();

			const newWallet = update(identityWallet, { credentials: { $push: [cred] } });

			// Backup wallet
			const encrypted = await encryptIdentityWallet(newWallet, passphrase!);
			await backupCryptoBox(wallet.getAddress(), toBase64(encrypted), authToken!);

			setWallet(newWallet);
			showSuccessToast('Credential added');
		} catch (e) {
			showErrorToast((e as Error).message);
		}
	};

	const handleUnlock = async () => {
		if (authToken == null) {
			showModal('authToken', true);
			return;
		}

		await handlePassphrase(authToken);
	};

	const handleAuthToken = async () => {
		try {
			showModal('authToken', false);

			const authTokenBytes = await getAuthToken(wallet, process.env.REACT_APP_ISSUER_URL);
			const authToken = toBase64(authTokenBytes);
			setAuthToken(authToken);

			await handlePassphrase(authToken);
		} catch (e) {
			showErrorToast((e as Error).message);
		}
	};

	const handlePassphrase = async (authToken: string) => {
		if (passphrase == null) {
			setPassphraseInput('');
			showModal('passphrase', true);
			return;
		}

		await handleDecryptWallet(authToken, passphrase);
	};

	const handleDecryptWallet = async (authToken: string, passphrase: string) => {
		try {
			const cryptoBox = await loadCryptoBox<string>(wallet.getAddress(), authToken);

			// Create a new wallet
			if (cryptoBox == null) {
				setPassphrase(passphrase);
				setWallet({
					credentials: [],
				});
				showSuccessToast(t('identity.wallet.message.created'));
				return;
			}

			const decryptedWallet = await tryDecryptIdentityWallet(fromBase64(cryptoBox), passphrase);

			// Invalid passphrase
			if (decryptedWallet == null) {
				showModal('invalidPassphrase', true);
				return;
			}

			// Success
			setPassphrase(passphrase);
			setWallet(decryptedWallet);
			showSuccessToast(t('identity.wallet.message.unlocked'));
		} catch (e) {
			showErrorToast((e as Error).message);
		}
	};

	const handleReset = async () => {
		setPassphrase(passphraseInput);
		setWallet({
			credentials: [],
		});
		showSuccessToast(t('identity.wallet.message.reset'));
	};

	const handleLock = async () => {
		setPassphrase(null);
		setWallet(null);
		setPassphraseInput('');
		showSuccessToast(t('identity.wallet.message.locked'));
	};

	const showModal = (id: 'authToken' | 'passphrase' | 'invalidPassphrase' | 'resetConfirmation', toggle: boolean) => {
		if (id === 'authToken' && authTokenRef.current) {
			const modal = BSModal.getOrCreateInstance(authTokenRef.current);
			return toggle ? modal.show() : modal.hide();
		} else if (id === 'passphrase' && passphraseRef.current) {
			const modal = BSModal.getOrCreateInstance(passphraseRef.current);
			return toggle ? modal.show() : modal.hide();
		} else if (id === 'invalidPassphrase' && invalidPassphraseRef.current) {
			const modal = BSModal.getOrCreateInstance(invalidPassphraseRef.current);
			return toggle ? modal.show() : modal.hide();
		} else if (id === 'resetConfirmation' && resetConfirmationRef.current) {
			const modal = BSModal.getOrCreateInstance(resetConfirmationRef.current);
			return toggle ? modal.show() : modal.hide();
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
									<h2>{t('identity.get.title')}</h2>
									<div className="my-4">{t('identity.get.description')}</div>
								</div>
								<div className="d-flex flex-row justify-content-start">
									<CustomButton className="px-5" onClick={handleGetCredential}>
										{t('identity.get.get')}
									</CustomButton>
								</div>
							</Card>
						</div>
						<div className="col-12">
							<Card className="d-flex flex-column h-100 justify-content-between">
								<div>
									<h2>{t('identity.wallet.title')}</h2>
									<div className="my-4">{t('identity.wallet.description')}</div>
								</div>
								<div className="row gy-4">
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
														<p>Id: {trunc(cred.id, 15)}</p>
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
								<div className="d-flex flex-row justify-content-start mt-4 gap-4">
									{identityWallet == null && (
										<CustomButton className="px-5" onClick={handleUnlock}>
											{t('identity.wallet.unlock')}
										</CustomButton>
									)}
									{identityWallet != null && (
										<CustomButton className="px-5" onClick={handleLock}>
											{t('identity.wallet.lock')}
										</CustomButton>
									)}
								</div>
							</Card>
						</div>
					</div>
				</div>
			</div>
			<Modal
				id="authTokenModal"
				ref={authTokenRef}
				dataBsBackdrop="static"
				contentClassName="p-3"
				withCloseButton={false}
			>
				<h1>{t('identity.wallet.message.signTxWarning')}</h1>
				<div className="d-flex flex-column flex-sm-row  justify-content-around mt-5">
					<Button
						className="logout-modal-btn me-sm-4 mb-4 mb-sm-0"
						data-bs-dismiss="modal"
						onClick={handleAuthToken}
					>
						<div className="px-sm-2">{t('common.sign')}</div>
					</Button>
					<Button
						className="logout-modal-cancel-btn me-sm-4 mb-4 mb-sm-0"
						data-bs-dismiss="modal"
						onClick={() => showModal('authToken', false)}
					>
						<div className="px-sm-2">{t('common.cancel')}</div>
					</Button>
				</div>
			</Modal>
			<Modal
				id="passphraseModal"
				ref={passphraseRef}
				dataBsBackdrop="static"
				contentClassName="p-3"
				withCloseButton={false}
			>
				<h1 className="logout-modal-title">{t('identity.wallet.message.enterPassphrase')}</h1>
				<div className="col-12 mt-4">
					<Input
						type="password"
						value={passphraseInput}
						onChange={(event) => setPassphraseInput(event.target.value)}
						autoComplete="off"
					/>
				</div>
				<div className="d-flex flex-column flex-sm-row  justify-content-around mt-4">
					<Button
						className="logout-modal-btn me-sm-4 mb-4 mb-sm-0"
						data-bs-dismiss="modal"
						onClick={() => handleDecryptWallet(authToken!, passphraseInput)}
					>
						<div className="px-sm-2">{t('common.confirm')}</div>
					</Button>
					<Button
						className="logout-modal-cancel-btn me-sm-4 mb-4 mb-sm-0"
						data-bs-dismiss="modal"
						onClick={() => showModal('passphrase', false)}
					>
						<div className="px-sm-2">{t('common.cancel')}</div>
					</Button>
				</div>
			</Modal>
			<Modal
				id="invalidPassphraseModal"
				ref={invalidPassphraseRef}
				dataBsBackdrop="static"
				contentClassName="p-3"
				withCloseButton={false}
			>
				<h1 className="logout-modal-title">{t('identity.wallet.error.invalidPassphrase')}</h1>
				<div className="d-flex flex-column flex-sm-row  justify-content-around mt-4">
					<Button
						className="logout-modal-btn me-sm-3 mb-4 mb-sm-0"
						data-bs-dismiss="modal"
						onClick={() => handlePassphrase(authToken!)}
					>
						<div className="text-nowrap">{t('common.retry')}</div>
					</Button>
					<Button
						className="logout-modal-cancel-btn me-sm-3 mb-4 mb-sm-0"
						data-bs-dismiss="modal"
						onClick={() => showModal('resetConfirmation', true)}
					>
						<div>{t('common.reset')}</div>
					</Button>
					<Button
						className="logout-modal-cancel-btn me-sm-3 mb-4 mb-sm-0"
						data-bs-dismiss="modal"
						onClick={() => showModal('invalidPassphrase', false)}
					>
						<div>{t('common.cancel')}</div>
					</Button>
				</div>
			</Modal>
			<Modal
				id="resetConfirmationModal"
				ref={resetConfirmationRef}
				dataBsBackdrop="static"
				contentClassName="p-3"
				withCloseButton={false}
			>
				<h1 className="logout-modal-title">{t('identity.wallet.message.resetConfirmation')}</h1>
				<div className="d-flex flex-column flex-sm-row  justify-content-around mt-4">
					<Button
						className="logout-modal-cancel-btn me-sm-4 mb-4 mb-sm-0"
						data-bs-dismiss="modal"
						onClick={() => showModal('invalidPassphrase', true)}
					>
						<div className="px-sm-2">{t('common.cancel')}</div>
					</Button>
					<Button
						className="logout-modal-logout-btn text-white"
						data-bs-dismiss="modal"
						onClick={handleReset}
					>
						<div className="px-sm-2">{t('common.reset')}</div>
					</Button>
				</div>
			</Modal>
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
