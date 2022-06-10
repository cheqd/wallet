import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router';
import { Card } from 'frontend-elements';
import { Button as CustomButton, Input, Modal } from 'components';
import { RootDispatch, RootState } from 'redux/store';

import './styles/Identity.scss';
import { showErrorToast, showInfoToast, showSuccessToast, trunc } from 'utils';
import { getAuthToken } from '../../utils/walletAuth';
import { fromBase64, toBase64 } from '@lum-network/sdk-javascript/build/utils';
import { getCredential } from '../../apis/issuer';
import { useRematchDispatch } from '../../redux/hooks';
import { Credential as VerifiableCredential, Wallet } from '../../models';
import { Modal as BSModal } from 'bootstrap';
import { backupCryptoBox, loadCryptoBox } from '../../apis/storage';
import { encryptIdentityWallet, tryDecryptIdentityWallet } from '../../utils/identityWalet';
import update from 'immutability-helper';
import Assets from '../../assets';
import { QRCodeSVG } from 'qrcode.react';
import Multibase from 'multibase';
import Multicodec from 'multicodec';
import createAuth0Client from "@auth0/auth0-spa-js";
import { loadUrlInIframe } from "../../utils/iframe";

const Identity = (): JSX.Element => {
	const [passphraseInput, setPassphraseInput] = useState('');
	const [selectedCred, setSelectedCred] = useState<VerifiableCredential | null>(null);
	const credentialDetailedRef = useRef<HTMLDivElement>(null);

	// Redux hooks
	const { wallet, identityWallet, authToken, passphrase, claims } = useSelector((state: RootState) => ({
		wallet: state.wallet.currentWallet,
		identityWallet: state.identity.wallet,
		authToken: state.identity.authToken,
		passphrase: state.identity.passphrase,
		claims: state.identity.claims,
	}));

	// Dispatch methods
	const { setAuthToken, setPassphrase, setWallet, addClaim, removeClaim } = useRematchDispatch((dispatch: RootDispatch) => ({
		setAuthToken: dispatch.identity.setAuthToken,
		setPassphrase: dispatch.identity.setPassphrase,
		setWallet: dispatch.identity.setWallet,
        addClaim: dispatch.identity.addClaim,
        removeClaim: dispatch.identity.removeClaim,
	}));

	// Utils hooks
	const { t } = useTranslation();

	// Refs
	const authTokenRef = useRef<HTMLDivElement>(null);
	const passphraseRef = useRef<HTMLDivElement>(null);
	const invalidPassphraseRef = useRef<HTMLDivElement>(null);
	const resetConfirmationRef = useRef<HTMLDivElement>(null);

	if (!wallet) {
		return <Redirect to="/welcome" />;
	}

	// Methods
	const handleConnectSocialAccount = async () => {
		try {
			const auth0 = await createAuth0Client({
				domain: process.env.REACT_APP_AUTH0_DOMAIN,
				client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
			});

			if (await auth0.isAuthenticated()) {
				await loadUrlInIframe(auth0.buildLogoutUrl());
			}

			let token = await auth0.getTokenWithPopup({
				scope: 'openid profile',
			})

			const user = (await auth0.getUser())!;

			const serviceNames: { [key: string]: string} = {
			    'google-oauth2': "Google",
                'facebook': "Facebook",
                'twitter': "Twitter"
            }

            const serviceId = user.sub!.substring(0, user.sub!.indexOf('|'));
            const serviceName = serviceNames[serviceId] || serviceId;

            if (claims.find(s => s.service === serviceName)) {
				showErrorToast(t('identity.get.error.serviceIsAlreadyConnected'));
            	return;
			}

			addClaim({
				profileName: user.nickname || user.name || user.email || "no data",
				service: serviceName,
				accessToken: token,
			});

		} catch (error) {
			showErrorToast((error as Error).message);
		}
	}

    const handleGetCredential = async () => {
		try {
			if (!identityWallet) {
				showErrorToast(t('identity.wallet.error.locked'));
				return;
			}

			// Get credential
			if (claims.length !== 1) {
				showInfoToast(t("identity.get.message.connectionNeeded"));
				return;
			}

			const cred = await getCredential(getSubjectId(wallet), claims[0].accessToken);

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

	function getSubjectId(wallet: Wallet): string {
		const identifier = Buffer.from(
			Multibase.encode('base58btc', Multicodec.addPrefix('ed25519-pub', Buffer.from(wallet.getPublicKey()))),
		).toString();

		return  'did:key:' + identifier;
	}

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

			const authTokenBytes = await getAuthToken(wallet, process.env.REACT_APP_STORAGE_ENDPOINT);
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

	const showModal = (
		id: 'authToken' | 'passphrase' | 'invalidPassphrase' | 'resetConfirmation' | 'credentialDetails',
		toggle: boolean,
	) => {
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
		} else if (id === 'credentialDetails' && credentialDetailedRef.current) {
			const modal = BSModal.getOrCreateInstance(credentialDetailedRef.current);
			return toggle ? modal.show() : modal.hide();
		}
	};

	const handleShowCredential = async (cred: VerifiableCredential) => {
		if (cred == null || !identityWallet?.credentials.includes(cred as VerifiableCredential)) return;
		setSelectedCred(cred);
		showModal('credentialDetails', true);
	};

	const handleRemoveCredential = async (cred: VerifiableCredential) => {
		if (cred == null) return;

		identityWallet?.credentials.forEach((element, index) => {
			if (element == cred) identityWallet?.credentials.splice(index, 1);
		});
		setWallet(identityWallet);
		if (credentialDetailedRef.current) {
			showModal('credentialDetails', false);
			setSelectedCred(null);
		}
		showSuccessToast('Credential removed');
		// Backup wallet
		const encrypted = await encryptIdentityWallet(identityWallet!, passphrase!);
		await backupCryptoBox(wallet.getAddress(), toBase64(encrypted), authToken!);
	};

	function changeActiveTab(activeTab: string) {
		const tabs = ['tab-formatted', 'tab-json', 'tab-qr'];

		tabs.forEach((tab) => {
			const tabObj = document.getElementById(tab);
			if (tab === activeTab) {
				tabObj?.classList.add('active');
			} else {
				tabObj?.classList.remove('active');
			}
		});
	}

	return (
		<>
			<>
				<div className="mt-4">
					<div className="container">
						<div className="row gy-4">
							<div className="col-12">
								<Card className="d-flex flex-column h-100 justify-content-between gap-4">
									<div>
										<h2>{t('identity.get.title')}</h2>
										<div className="mt-3">{t('identity.get.description')}</div>
									</div>
									<div className="px-3">
										<h3>{t('identity.get.connections.title')}</h3>
                                        <div className="mt-2">
                                            {claims.map((claim) => {
                                                    return (
                                                        <div  key={claim.profileName} className="claim d-flex flex-row">
                                                            <div title={claim.accessToken}>{claim.service}: @{claim.profileName}</div>
                                                            <div className="delete mx-3 btn-link pointer" onClick={() => removeClaim(claim)}>remove</div>
                                                        </div>
                                                    )
                                                }
                                            )}
                                        </div>
										<CustomButton className="mt-3 btn-sm btn-outline-secondary outline border-1" disabled={claims.length >= 1} onClick={handleConnectSocialAccount}>
											{t('identity.get.connections.connect')}
										</CustomButton>
									</div>
									<div>
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
												<div className="col-lg-6 col-12" key={cred.issuanceDate}>
													<Card className="d-flex flex-column h-100 justify-content-between message-button-container">
														<div onClick={async () => await handleShowCredential(cred)}>
															<div className="d-flex flex-row justify-content-between mb-2">
																<h2>
																	<img
																		src={Assets.images.cheqdRoundLogo}
																		height="28"
																		className="me-3"
																	/>
																	Credential
																</h2>
																{/*<div className="btn btn-outline-success p-2 h-auto">*/}
																{/*	Verify*/}
																{/*	<svg*/}
																{/*		xmlns="http://www.w3.org/2000/svg"*/}
																{/*		width="16"*/}
																{/*		height="16"*/}
																{/*		fill="currentColor"*/}
																{/*		className="bi bi-check"*/}
																{/*		viewBox="0 0 16 16"*/}
																{/*	>*/}
																{/*		<path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"></path>*/}
																{/*	</svg>*/}
																{/*</div>*/}
															</div>
															<>
																<p>
																	<b>Type:</b> {cred.type.join(', ')}
																</p>
																<p>
																	<b>Issuance Date: </b>
																	{new Date(cred.issuanceDate).toUTCString()}
																</p>
																<p>
																	<b>Issuer: </b> {trunc(cred.issuer.id, 17)}
																</p>
																{
																	cred.name ?
																	<p>
																		<b>Name:</b> {cred.name}
																	</p>
																	: null
																}
																{
																	cred.WebPage ? cred.WebPage.map((webpage) => {
																		return (
																			<p>
																				<b>{webpage.description}:</b> {webpage.name}
																			</p>
																		)
																	}) : null
																}
															</>

															<div className="d-flex flex-row align-items-right mt-4 mx-0">
																<div
																	className="app-btn  app-btn-plain bg-transparent text-btn p-0 me-4 h-auto"
																	onClick={async () =>
																		await handleShowCredential(cred)
																	}
																>
																	{t('identity.credential.show')}
																</div>
																<div className="wrapper undefined">
																	<div
																		className="scale-anim undefined bg-transparent text-btn p-0 h-auto"
																		onClick={async () =>
																			await handleRemoveCredential(cred)
																		}
																	>
																		{t('identity.credential.remove')}
																	</div>
																</div>
															</div>
														</div>
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
						<CustomButton
							className="logout-modal-btn me-sm-4 mb-4 mb-sm-0"
							data-bs-dismiss="modal"
							onClick={handleAuthToken}
						>
							{t('common.sign')}
						</CustomButton>
						<CustomButton
							className="logout-modal-cancel-btn me-sm-4 mb-4 mb-sm-0"
							data-bs-dismiss="modal"
							onClick={() => showModal('authToken', false)}
						>
							<div className="px-sm-2">{t('common.cancel')}</div>
						</CustomButton>
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
						<CustomButton
							className="logout-modal-btn me-sm-4 mb-4 mb-sm-0"
							data-bs-dismiss="modal"
							onClick={() => handleDecryptWallet(authToken!, passphraseInput)}
						>
							{t('common.confirm')}
						</CustomButton>
						<CustomButton
							className="logout-modal-cancel-btn me-sm-4 mb-4 mb-sm-0"
							data-bs-dismiss="modal"
							onClick={() => showModal('passphrase', false)}
						>
							<div className="px-sm-2">{t('common.cancel')}</div>
						</CustomButton>
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
						<CustomButton
							className="logout-modal-btn me-sm-3 mb-4 mb-sm-0"
							data-bs-dismiss="modal"
							onClick={() => handlePassphrase(authToken!)}
						>
							<div className="text-nowrap">{t('common.retry')}</div>
						</CustomButton>
						<CustomButton
							className="logout-modal-cancel-btn me-sm-3 mb-4 mb-sm-0"
							data-bs-dismiss="modal"
							onClick={() => showModal('resetConfirmation', true)}
						>
							<div>{t('common.reset')}</div>
						</CustomButton>
						<CustomButton
							className="logout-modal-cancel-btn me-sm-3 mb-4 mb-sm-0"
							data-bs-dismiss="modal"
							onClick={() => showModal('invalidPassphrase', false)}
						>
							<div>{t('common.cancel')}</div>
						</CustomButton>
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
						<CustomButton
							className="logout-modal-cancel-btn me-sm-4 mb-4 mb-sm-0"
							data-bs-dismiss="modal"
							onClick={() => showModal('invalidPassphrase', true)}
						>
							<div className="px-sm-2">{t('common.cancel')}</div>
						</CustomButton>
						<CustomButton
							className="logout-modal-logout-btn text-white"
							data-bs-dismiss="modal"
							onClick={handleReset}
						>
							<div className="px-sm-2">{t('common.reset')}</div>
						</CustomButton>
					</div>
				</Modal>
				<Modal
					ref={credentialDetailedRef}
					id="credentialDetails"
					withCloseButton={true}
					dataBsBackdrop="static"
					dataBsKeyboard={false}
					contentClassName="p-3 w-auto"
				>
					{selectedCred === null ? (
						<>
							<p className="color-error">{t('identity.credential.notFound')}</p>
						</>
					) : (
						<>
							<div className="d-flex flex-column align-items-center">
								<h2 className="text-center">
									<img src={Assets.images.cheqdRoundLogo} height="28" className="me-3" />
									{t('identity.credential.title')}
								</h2>
								<div className="d-flex flex-row align-items-left tabs my-3">
									<a
										href="#formatted"
										className="app-btn app-btn-plain bg-transparent text-btn p-0 me-4 h-auto active"
										id="tab-formatted"
										onClick={() => changeActiveTab('tab-formatted')}
									>
										formatted
										{/*{t('identity.credential.show')}*/}
									</a>
									<a
										href="#json"
										className="app-btn  app-btn-plain bg-transparent text-btn p-0 me-4 h-auto"
										id="tab-json"
										onClick={() => changeActiveTab('tab-json')}
									>
										json
										{/*{t('identity.credential.show')}*/}
									</a>
									<a
										href="#qr-code"
										className="app-btn  app-btn-plain bg-transparent text-btn p-0 me-4 h-auto"
										id="tab-qr"
										onClick={() => changeActiveTab('tab-qr')}
									>
										qr-code
										{/*{t('identity.credential.show')}*/}
									</a>
								</div>
								<div className="tabs-content">
									<ul>
										<li id="formatted">
											<table className="table app-table-striped table-borderless">
												<tbody>
													<tr>
														<td>
															<b>TYPE</b>
														</td>
														<td> {selectedCred.type.join(', ')}</td>
													</tr>
													<tr>
														<td>
															<b>ISSUANCE DATE</b>
														</td>
														<td> {new Date(selectedCred.issuanceDate).toUTCString()}</td>
													</tr>
													<tr>
														<td>
															<b>ISSUER</b>
														</td>
														<td> {selectedCred.issuer.id}</td>
													</tr>
													{
														selectedCred.name ?
															<tr className={selectedCred.name ? "" : "visually-hidden"}>
																<td>
																	<b>NAME</b>
																</td>
																<td> {selectedCred.name}</td>
															</tr>
															: null
													}
													{
														selectedCred.WebPage ? selectedCred.WebPage.map((webpage) => {
															return (
																<tr>
																	<td>
																		<b>{webpage.description}</b>
																	</td>
																	<td> {webpage.name}</td>
																</tr>
															)
														}) : null
													}
												</tbody>
											</table>
										</li>
										<li id="json" className="container tab-pane">
											<textarea
												readOnly
												className="w-100 p-2"
												value={JSON.stringify(selectedCred, null, 2)}
												rows={25}
											/>
										</li>
										<li id="qr-code" className="container tab-pane">
											<QRCodeSVG
												value={JSON.stringify(selectedCred, null, 1)}
												size={300}
												bgColor="#ffffff"
												fgColor="#000000"
												level="L"
												includeMargin={false}
												imageSettings={{
													src: Assets.images.cheqdRoundLogo,
													height: 30,
													width: 30,
													excavate: true,
												}}
											/>
										</li>
									</ul>
								</div>

								<CustomButton
									className="mt-5"
									onClick={async () => await handleRemoveCredential(selectedCred)}
								>
									{t('identity.credential.remove')}
								</CustomButton>
							</div>
						</>
					)}
				</Modal>
			</>
		</>
	);
};

export default Identity;
