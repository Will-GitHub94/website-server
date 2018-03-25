import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";

import GitHub from "./github";

const app = express();

app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(cors());

app.use(session({
	secret: "test",
	resave: false,
	saveUninitialized: true,
}));

app.get("/", (req, res) => {
	res.send("Base hit");
});

// GitHub
app.get("/github/architecture", async (req, res) => {
	const architectureFiles = await GitHub.getArchitectureFiles();

	res
		.status(200)
		.send(architectureFiles);
});

app.get("/github/networking", async (req, res) => {
	const networkingFiles = await GitHub.getNetworkingFiles();

	res
		.status(200)
		.send(networkingFiles);
});

app.get("/github/machineLearning", async (req, res) => {
	const machineLearningFiles = await GitHub.getMachineLearningFiles();

	res
		.status(200)
		.send(machineLearningFiles);
});

app.get("/github/cryptography", async (req, res) => {
	const cryptographyFiles = await GitHub.getCryptographyFiles();

	res
		.status(200)
		.send(cryptographyFiles);
});

app.listen(process.env.PORT, () => {
	console.log(`Listening on port: ${process.env.PORT}`);
});

export default app;
