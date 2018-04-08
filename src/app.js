import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
// import forEach from "lodash/forEach";

import GitHub from "./api/github/interact";
import db from "./db/connect";
// import saveAll from "./db/save";

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
	db.connect(async (connDb) => {
		// Needs to initially check whether the DB has been populated or not
		knowledgeSections = await GitHub.initLocalKnowledgeStorage();
	});
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
