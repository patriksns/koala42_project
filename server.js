const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const getData = require("./routes/GET/getdata");

/**
 * Routy - GET
 */

app.use("/",getData);

app.get("/", (req,res) => {
    res.send("Toto je BE")
});

app.listen(PORT, (err) => {
    console.log(`Server běží na ${PORT}!`)
});