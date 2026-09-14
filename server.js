const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

const PC_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";

app.get('/fb', async (req, res) => {
    try {
        const response = await axios.get('https://mbasic.facebook.com', {
            headers: { 'User-Agent': PC_USER_AGENT }
        });

        const $ = cheerio.load(response.data);
        $('style, script, link[rel="stylesheet"]').remove();
        $('*').removeAttr('style');

        res.setHeader('Content-Type', 'text/html');
        res.send($.html());
    } catch (error) {
        res.status(500).send("Error fetching Facebook");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
