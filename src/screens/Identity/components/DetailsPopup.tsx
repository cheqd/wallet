import { VerifiablePresentation } from "@veramo/core";
import React from "react";
import { Credential as VerifiableCredential } from '../../../models';
import Assets from '../../../assets';
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";

type Props = {
	data: VerifiableCredential | VerifiablePresentation
	formatted: any
	qr: string
	changeActiveTab: (activeTab: string) => void
	id: string
}

export function changeActiveTab(activeTab: string) {
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

const DetailsPopup: React.FC<Props> = ({
	id, data, formatted, qr, changeActiveTab
}): JSX.Element => {
	const { t } = useTranslation();

	return (
		<>
			<div className="d-flex flex-row align-items-left tabs my-3">
				<a
					href={`#formatted-${id}`}
					className="app-btn-plain bg-transparent text-btn p-0 me-4 h-auto active"
					id={`tab-formatted-${id}`}
					onClick={() => changeActiveTab('tab-formatted')}
				>
					{t('identity.credential.formatted')}
				</a>
				<a
					href={`#json-${id}`}
					className="app-btn-plain bg-transparent text-btn p-0 me-4 h-auto"
					id={`tab-json-${id}`}
					onClick={() => changeActiveTab('tab-json')}
				>
					{t('identity.credential.json')}
				</a>
				<a
					href={`#qr-code-${id}`}
					className="app-btn-plain bg-transparent text-btn p-0 me-4 h-auto"
					id={`tab-qr-${id}`}
					onClick={() => changeActiveTab('tab-qr')}
				>
					{t('identity.credential.qrCode')}
				</a>
			</div>
			<div className="tabs-content">
				<ul>
					<li id={`formatted-${id}`} >
						<table className="table app-table-striped table-borderless">
							<tbody>
								{Object.keys(formatted).map((key, index) => {
									return (
										<tr key={index}>
											<td><b>{(key.replace(/([A-Z])/g, " $1")).toUpperCase()}</b></td>
											<td>{formatted[key]}</td>
										</tr>
									)
								})}
							</tbody>
						</table>
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
