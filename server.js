/*
 * Express node.js server for hosting the html page.
 * Port: 3018
 */

const cors = require("cors");
const express = require("express");
const app = express();
const PORT = 3018;

app.use(cors());

app.use(express.static(__dirname));

app.get("/northpole", (req, res) => {
    res.sendFile("northpole.html", { root: __dirname });
});

app.listen(PORT, () => {
    console.log("Express server is running.");
    console.log(`Access northpole example at http://localhost:${PORT}/northpole`);
    console.log(`Access southpole example at http://localhost:${PORT}/southpole`);
});