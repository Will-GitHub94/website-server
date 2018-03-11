import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(cors());

app.get("/", (req, res) => {
	res.send("Base hit");
});

app.listen(process.env.PORT, () => {
	console.log(`Listening on port: ${process.env.PORT}`);
});
