// external imports
const express = require("express");
const cors = require("cors");

// internal imports
const client = require("./clientconn");
const pool = require("./poolconn.js");
const getUpdateQueryString = require("./getUpdateQueryString");

const app = express();

app.use(cors());

app.use(express.json());

app.use((_req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");

	next();
});

app.listen(3000, () => {
	console.log("listening to 3000");
});

async function connectDatabase() {
	try {
		await client.connect();
	} catch (err) {
		console.log(err);
	}
}

async function disconnectDatabase() {
	try {
		await client.end();
	} catch (err) {
		console.log(err);
	}
}

// connectDatabase();

// app.get("/raceyear", async (req, res) => {
// 	try {
// 		await client.connect();
// 		const result = await client.query(`SELECT * FROM f1.circuits`);
// 		client.end((err) => {
// 			console.log("client has disconnected");
// 			if (err) {
// 				console.log("error during disconnection", err.stack);
// 			}
// 		});
// 		res.json(result);
// 	} catch (err) {
// 		console.log(err);
// 	}
// });

// Using Pool
app.post("/raceyear", async (req, res) => {
	try {
		console.log(req.body);
		const clientInsidePool = await pool.connect();

		const result = await pool.query(
			`SELECT * FROM f1.getraceofyear(${req.body.year})`
		);

		clientInsidePool.release();

		res.json(result);
	} catch (err) {
		console.log(err);
	}
});

app.post("/raceresult", async (req, res) => {
	try {
		console.log(req.body);
		const clientInsidePool = await pool.connect();

		const result = await pool.query(
			`SELECT * FROM f1.getresultofrace('${req.body.raceid}')`
		);

		clientInsidePool.release();

		res.json(result);
	} catch (err) {
		console.log(err);
	}
});

app.post("/aboutus", async (req, res) => {
	try {
		const clientInsidePool = await pool.connect();

		const result = await pool.query(`SELECT * FROM f1.drivers`);

		clientInsidePool.release();

		res.json(result);
	} catch (err) {
		console.log(err);
	}
});

app.post("/messages", async (req, res) => {
	try {
		const clientInsidePool = await pool.connect();

		const result = await pool.query(`SELECT * FROM f1.constructors`);

		clientInsidePool.release();

		res.json(result);
	} catch (err) {
		console.log(err);
	}
});

app.post("/test", (req, res) => {
	res.json({ requestBody: req.body }); // <==== req.body will be a parsed JSON object
});

app.get("/", function (req, res) {
	res.send("Hello, It's Working and you're at home");
});

app.get("/foo", function (req, res) {
	res.send("Hello, It's Working and you're at foo");
});

app.use(
	express.urlencoded({
		extended: true,
	})
);

app.post("/bar", (req, res) => {
	var body = req.body;
	console.log(body.foo);
	res.send(req.body.foo);
});

app.post("/enterdata", async (req, res) => {
	console.log(req.body.driverpositions);
	try {
		const clientInsidePool = await pool.connect();

		const updateStatement1 = getUpdateQueryString(req.body);
		console.log(updateStatement1);

		const updateStatement = `UPDATE f1.results
		SET "position" = '2',
			positiontext  = '2',
			positionorder = '2',
			positionorderint  = 2
		WHERE raceid = '1098'
		AND driverid = '859';
		UPDATE f1.results
		SET "position" = '1',
			positiontext  = '1',
			positionorder = '1',
			positionorderint  = 1
		WHERE raceid = '1098'
		AND driverid = '844';
		`;

		const result = await pool.query(updateStatement);

		clientInsidePool.release();

		console.log(JSON.stringify(result));

		const responseJson = {
			fastestlapby: req.body.fastestlapby,
			raceid: req.body.raceid,
		};
		res.json(updateStatement1);
	} catch (err) {
		console.log(err);
	}
});
