import { useAuth0 } from "@auth0/auth0-react"
import { useTranslation } from "react-i18next";
import Button from "./Button";

const Auth0SignIn = () => {
	const { t } = useTranslation();
	const { loginWithPopup } = useAuth0();

	return <Button className="px-5" onClick={() => loginWithPopup({connection: "twitter", scope: "openid profile"})}>
		{/*{t('identity.twitter.connect')}*/}
	</Button>
}

export default Auth0SignIn;
