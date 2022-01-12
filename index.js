const express = require("express");
const app = express();
const axios = require('axios');
const cors = require('cors');
const redis = require('redis');

const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);

app.use(cors());
app.use(express.json());

app.post("/api/search", async (req, res) => {
    const baseUrl = "https://api.github.com";

    const { searchType } = req.body;
    const { keyword } = req.body;

    if(!keyword || keyword === "" || keyword === " ") {
        res.status(400).json({msg: "Search Text Is Required!"})
    }

    try {
        const response = await axios.get(`${baseUrl}/search/${searchType}?q=${keyword}`);
        const { data } = response;
        
        client.setex(keyword, 3600, {searchType, data});
        res.status(200).json({searchType, data});
    }
    catch(error) {
        if(error.response.status === 404) {
            res.status(204).json({searchType, data: []});
        }
    }
});

app.get("/api/clear-cache", (req, res) => {
    client.flushdb( function (err, succeeded) {
        console.log(succeeded);
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server Started On Port ${port}`));