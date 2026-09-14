const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

// Full Windows 10 Chrome User-Agent
const WIN10_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

app.get('/', (req, res) => {
    res.send("Javabook Windows 10 Proxy Online");
});

app.get('/fb', async (req, res) => {
    try {
        const response = await axios.get('https://mbasic.facebook.com/login/', {
            headers: { 
                'User-Agent': WIN10_USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"'
            }
        });

        const $ = cheerio.load(response.data);
        $('script, style, meta, link').remove();

        let cleanText = "";
        $('form, div, p, a, input, button').each((i, el) => {
            const text = $(el).text().trim();
            const val = $(el).val();
            if (text.length > 0) {
                cleanText += text + "\n";
            } else if (val && val.length > 0) {
                cleanText += "[" + val + "]\n";
            }
        });

        if (!cleanText) {
            cleanText = $("body").text().replace(/\s+/g, ' ').trim();
        }

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(cleanText || "Welcome to Facebook Login Page");
    } catch (error) {
        res.status(500).send("Proxy Error: Unable to fetch Facebook");
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
