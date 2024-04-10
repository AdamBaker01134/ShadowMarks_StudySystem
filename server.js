/*
 * Express node.js server for hosting the html page.
 * Port: 3018
 */

const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const PORT = 3018;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static(__dirname));

let datasets = [];

app.get("/", (req, res) => {
    res.sendFile("shadow-marks.html", { root: __dirname });
});

fs.readdirSync("./img/").forEach(file => {
    if (fs.lstatSync("./img/" + file).isDirectory()) {
        datasets.push(file);
        app.get("/" + file, (req, res) => {
            res.sendFile("shadow-marks.html", { root: __dirname });
        });
    }
});

app.get("/get/id", (req, res) => {
    res.send({ id: Object.keys(JSON.parse(fs.readFileSync("results.json", "utf8"))).length });
});

app.post("/put/data", (req, res) => {
    let data = req.body;
    let results = JSON.parse(fs.readFileSync("results.json", "utf8"));
    if (Object.keys(results).includes(data.userId.toString())) {
        results[data.userId.toString()].push(data);
    } else {
        results[data.userId.toString()] = [ data ];
    }
    fs.writeFileSync("results.json", JSON.stringify(results), "utf8");
});

app.listen(PORT, () => {
    console.log(`Express server is running on http://localhost:${PORT}`);
    if (datasets.length === 0) console.log("No datasets detected.");
    datasets.forEach(dataset => {
        console.log(`Access ${dataset} example at http://localhost:${PORT}/${dataset}`);
    })
});