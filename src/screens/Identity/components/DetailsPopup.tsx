import { VerifiablePresentation } from "@veramo/core";
import React from "react";
import { Credential as VerifiableCredential } from '../../../models';
import Assets from '../../../assets';
import { QRCodeSVG } from "qrcode.react";

type Props = {
	data: VerifiableCredential | VerifiablePresentation,
    formatted: any,
    qr: string
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
	data, formatted, qr
}): JSX.Element => {
	return (
        <>
            <div className="d-flex flex-row align-items-left tabs my-3">
                <a
                    href="#formatted"
                    className="app-btn-plain bg-transparent text-btn p-0 me-4 h-auto active"
                    id="tab-formatted"
                    onClick={() => changeActiveTab('tab-formatted')}
                >
                    formatted
                    {/*{t('identity.credential.show')}*/}
                </a>
                <a
                    href="#json"
                    className="app-btn-plain bg-transparent text-btn p-0 me-4 h-auto"
                    id="tab-json"
                    onClick={() => changeActiveTab('tab-json')}
                >
                    json
                    {/*{t('identity.credential.show')}*/}
                </a>
                <a
                    href="#qr-code"
                    className="app-btn-plain bg-transparent text-btn p-0 me-4 h-auto"
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
                               { Object.keys(formatted).map((key, index)=> {
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
                    <li id="json" className="container tab-pane">
                        <textarea
                            readOnly
                            className="w-100 p-2"
                            value={JSON.stringify(data, null, 2)}
                            rows={25}
                        />
                    </li>
                    <li id="qr-code" className="container tab-pane">
                        {
                            qr?.length < 4296 ?
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
