import passGitHub from "passport-github";
import passport from "passport";

const GitHubStrategy = passGitHub.Strategy;

export default () => {
	console.log("authing github - SETUP");
	passport.use(new GitHubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: "http://127.0.0.1:3000/auth/github/callback",
		},
		(accessToken, refreshToken, profile, cb) => {
			console.log(profile);
			cb(null, profile);
		},
	));
};

