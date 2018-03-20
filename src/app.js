import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";

import GitHub from "./github";

const app = express();

app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(cors());

app.get("/", (req, res) => {
	res.send("Base hit");
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
