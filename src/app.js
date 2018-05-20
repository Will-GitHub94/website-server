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

app.get("/github/knowledge", async (req, res) => {
	const readme = await GitHub.getREADMEFile();

	res
		.status(200)
		.send(readme);
});

app.get("/github/knowledge/:knowledgeType", async (req, res) => {
	const { knowledgeType } = req.params;
	const paths = knowledgeSections[knowledgeType].md;
	const knowledgeFiles = await GitHub.getKnowledgeFiles(knowledgeType, knowledgeSections);

	knowledgeFiles.paths = paths;

	res
		.status(200)
		.send(knowledgeFiles);
});

app.listen(process.env.PORT, () => {
	console.log(`Listening on port: ${process.env.PORT}`);
});

export default app;
