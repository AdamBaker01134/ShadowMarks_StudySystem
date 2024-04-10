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

app.post("/put/data", (req, res) => {
    console.log(req.body);
});

app.listen(PORT, () => {
    console.log(`Express server is running on http://localhost:${PORT}`);
    if (datasets.length === 0) console.log("No datasets detected.");
    datasets.forEach(dataset => {
        console.log(`Access ${dataset} example at http://localhost:${PORT}/${dataset}`);
    })
});