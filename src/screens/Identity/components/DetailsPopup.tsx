import { VerifiablePresentation } from "@veramo/core";
import React, { useState } from "react";
import { Credential as VerifiableCredential } from '../../../models';
import Assets from '../../../assets';
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";
import { Table } from "@cheqd/wallet-frontend-elements";
import { FormattedCredentialOrPresentation } from "../Identity";

type Props = {
	data: VerifiableCredential | VerifiablePresentation
	formatted: any;
	qr: string
	id: string
}

const DetailsPopup: React.FC<Props> = ({
	id, data, formatted, qr
}): JSX.Element => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState(0);

	const handleActiveTab = (tabIndex: number) => {
		setActiveTab(tabIndex)
	}

	const isDate = (date: any): date is Date => {
		return date.toUTCString !== undefined
	}

	const findURI = (ctx: string | string[], filterBy: string): string => {
		if (typeof ctx === 'string') {
			ctx = [ctx]
		}

		const result = ctx.filter(u => {
			const uri = new URL(u)
			if (uri.host === filterBy) {
				return u
			}

			return uri.toString() == filterBy
		})

		return result[0]
	}

	const formatCredentialType = (value: any, ctx: string | string[]) => {
		const resolverURI = findURI(ctx, 'resolver.cheqd.net')
		const credentialSchemaURI = findURI(ctx, 'https://www.w3.org/2018/credentials/v1')
		const personSchemaUri = findURI(ctx, 'https://veramo.io/contexts/profile/v1')
		if (typeof value === 'string') {
			const parts = value.split(', ')
			return parts.map((v, i) => {
				const lastEl = i === parts.length - 1
				switch (v) {
					case 'VerifiableCredential':
						return <a target="_blank" href={credentialSchemaURI}>{v}{!lastEl ? ', ' : ''}</a>
					case 'EventReservation':
						return <a target="_blank" href={resolverURI}>{v}{!lastEl ? ', ' : ''}</a>
					case 'Person':
						return <a target="_blank" href={personSchemaUri}>{v}{!lastEl ? ', ' : ''}</a>
				}
			})
		}
	}

	const renderRows = (formattedCred: any) => {
		return Object.keys(formattedCred).filter(key => key !== '@context').map((key, index) => {
			const value = formattedCred[key]
			if (key === 'type') {
				return <tr key={index}>
					<td>
						<b>{key.charAt(0).toUpperCase() + key.slice(1)}</b>
					</td>
					<td>
						{formatCredentialType(value, formattedCred['@context'])}
					</td>
				</tr>
			}
			return <tr key={index}>
				<td>
					<b>{key.charAt(0).toUpperCase() + key.slice(1)}</b>
				</td>
				<td>{isDate(value) ? value.toUTCString() : value}</td>
			</tr>
		})
	}

	return (
		<>
			<div className="d-flex flex-row align-items-left tabs my-3">
				<a
					href={`#formatted-${id}`}
					className={`app-btn-plain bg-transparent text-btn p-0 me-4 h-auto ${activeTab === 0 ? 'active' : ''}`}
					id={`tab-formatted-${id}`}
					onClick={() => handleActiveTab(0)}
				>
					{t('identity.credential.formatted')}
				</a>
				<a
					href={`#json-${id}`}
					className={`app-btn-plain bg-transparent text-btn p-0 me-4 h-auto ${activeTab === 1 ? 'active' : ''}`}
					id={`tab-json-${id}`}
					onClick={() => handleActiveTab(1)}
				>
					{t('identity.credential.json')}
				</a>
				<a
					href={`#qr-code-${id}`}
					className={`app-btn-plain bg-transparent text-btn p-0 me-4 h-auto ${activeTab === 2 ? 'active' : ''}`}
					id={`tab-qr-${id}`}
					onClick={() => handleActiveTab(2)}
				>
					{t('identity.credential.qrCode')}
				</a>
			</div>
			<div className="tabs-content">
				<ul>
					<li id={`formatted-${id}`} style={{ overflowY: 'scroll', minHeight: 'content', maxHeight: '100%' }}>
						<Table head={[]}>
							{renderRows(formatted)}
						</Table>
					</li>
					<li id={`json-${id}`} className="container tab-pane">
						<textarea
							readOnly
							className="w-100 p-2"
							value={JSON.stringify(data, null, 2)}
							rows={25}
						/>
					</li>
					<li id={`qr-code-${id}`} className="container tab-pane">
						{
							qr?.length < 4000 ?
								(
									<QRCodeSVG
										value={qr}
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
								) :
								(
									<div>QR size is too big</div>
								)
						}
					</li>
				</ul>
			</div>
		</>
	)
}

export default DetailsPopup;
