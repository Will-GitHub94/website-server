import axios from "axios";
import passGitHub from "passport-github";
import passport from "passport";

const GitHubStrategy = passGitHub.Strategy;

// Immediate authorisation with GitHub
(() => {
	passport.use(new GitHubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: "http://localhost:3000/auth/github/callback",
		},
		(accessToken, refreshToken, profile, cb) => {
			cb(null, profile);
		},
	));
})();

export default () => {
	return axios.create({
		baseURL: `https://${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_USER_PROFILE}/my-knowledge`,
		headers: {
			Accept: `application/vnd.github.${process.env.GITHUB_API_VERSION}.raw`,
		},
	});
};

