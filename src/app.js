import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import passport from "passport";

import GitHub from "./github";
import authConfig from "./auth/config";

const app = express();

app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(cors());

// Configure passport auth
authConfig(app);

app.use(session({
	secret: "test",
	resave: false,
	saveUninitialized: true,
}));

app.get(
	"/auth/github",
	passport.authenticate("github", {
		session: false,
	}, (err, user, info) => {
		console.log("authing github - CALL");
		if (err || !user) {
			console.log(err);
			console.log(info);
		} else {
			console.log(user);
		}
	}),
);

app.get("/", (req, res) => {
	res.send("Base hit");
});

app.get("/auth/github/callback", passport.authenticate("github", {
	failureRedirect: "/login",
}), (req, res) => {
	console.log("github callback");
	console.log(req);
});

// GitHub
app.get("/github/architecture", (req, res) => {
	const architectureFiles = GitHub.getArchitectureFiles();

	console.log(architectureFiles);
});

// app.get("/github/networking", (req, res) => {
// 	res.send(GitHub.getNetworkingFiles());
// });
//
// app.get("/github/machineLearning", (req, res) => {
// 	res.send(GitHub.getMachineLearningFiles());
// });
//
// app.get("/github/cryptography", (req, res) => {
// 	res.send(GitHub.getCryptographyFiles());
// });

app.listen(process.env.PORT, () => {
	console.log(`Listening on port: ${process.env.PORT}`);
});

export default app;
