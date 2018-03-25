import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";

import GitHub from "./github";

const app = express();

let knowledgeSections;

app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(cors());

app.use(session({
	secret: "test",
	resave: false,
	saveUninitialized: true,
}));

(async () => {
	knowledgeSections = await GitHub.buildKnowledgeSections();
})();

app.get("/", async (req, res) => {
	const readme = await GitHub.getREADMEContents();

	res
		.status(200)
		.send(readme);
});

// GitHub
app.get("/github/architecture", async (req, res) => {
	const architectureFiles = await GitHub.getArchitectureFiles(knowledgeSections);

	res
		.status(200)
		.send(architectureFiles);
});

app.get("/github/networking", async (req, res) => {
	const networkingFiles = await GitHub.getNetworkingFiles(knowledgeSections);

	res
		.status(200)
		.send(networkingFiles);
});

app.get("/github/machineLearning", async (req, res) => {
	const machineLearningFiles = await GitHub.getMachineLearningFiles(knowledgeSections);

	res
		.status(200)
		.send(machineLearningFiles);
});

app.get("/github/cryptography", async (req, res) => {
	const cryptographyFiles = await GitHub.getCryptographyFiles(knowledgeSections);

	res
		.status(200)
		.send(cryptographyFiles);
});

app.listen(process.env.PORT, () => {
	console.log(`Listening on port: ${process.env.PORT}`);
});

export default app;
