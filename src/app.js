import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import forEach from "lodash/forEach";

import GitHub from "./github";
import saveAll from "./db/save";

const app = express();

const sections = [
	"architecture",
	"networking",
	"cryptography",
	"machineLearning"
];

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
	console.log("::: BUILDING :::");
	// Needs to initially check whether the DB has been populated or not
	knowledgeSections = await GitHub.buildKnowledgeSections();
	saveAll(knowledgeSections);
	console.log("::: BUILT :::");
})();

app.get("/knowledge", async (req, res) => {
	const readme = await GitHub.getREADMEContents();

	res
		.status(200)
		.send(readme);
});

// GitHub
app.get("/github/knowledge/:knowledgeType", async (req, res) => {
	const knowledgeType = req.params.knowledgeType;
	const knowledgeFiles = await GitHub.getKnowledgeFiles(knowledgeType, knowledgeSections);

	res
		.status(200)
		.send(knowledgeFiles);
});

app.listen(process.env.PORT, () => {
	console.log(`Listening on port: ${process.env.PORT}`);
});

export default app;
