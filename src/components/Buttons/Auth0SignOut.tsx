import { useAuth0 } from "@auth0/auth0-react"
import { useTranslation } from "react-i18next";
import Button from "./Button";

const Auth0SignOut = () => {
	const { t } = useTranslation();
	const { logout, user, getIdTokenClaims, getAccessTokenSilently } = useAuth0();

	return <Button className="px-5" onClick={() => logout()}>
		{/*{t('identity.twitter.disconnect')}*/}
	</Button>
}

export default Auth0SignOut;
