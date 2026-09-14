const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let sessionCookies = "";

// Latest Windows 10 Chrome User-Agent Header
const LATEST_WIN10_CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const HEADERS = {
    'User-Agent': LATEST_WIN10_CHROME_UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"'
};

app.get('/fb', async (req, res) => {
    try {
        const response = await axios.get('https://mbasic.facebook.com/', {
            headers: { ...HEADERS, 'Cookie': sessionCookies }
        });

        const $ = cheerio.load(response.data);
        $('script, style, meta, link').remove();

        let pageText = $("body").text().replace(/\s+/g, ' ').trim();
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(pageText || "Facebook Loaded");
    } catch (error) {
        res.status(500).send("Proxy Error");
    }
});

app.post('/login', async (req, res) => {
    const { email, pass } = req.body;
    try {
        const initRes = await axios.get('https://mbasic.facebook.com/login/', { headers: HEADERS });
        const initCookies = initRes.headers['set-cookie'] ? initRes.headers['set-cookie'].join('; ') : '';

        const params = new URLSearchParams();
        params.append('email', email);
        params.append('pass', pass);

        const loginRes = await axios.post('https://mbasic.facebook.com/login/device-based/regular/login/', params, {
            headers: {
                ...HEADERS,
                'Cookie': initCookies,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            maxRedirects: 0,
            validateStatus: status => status >= 200 && status < 400
        });

        if (loginRes.headers['set-cookie']) {
            sessionCookies = loginRes.headers['set-cookie'].join('; ');
            res.send("SUCCESS");
        } else {
            res.send("FAILED");
        }
    } catch (e) {
        res.send("ERROR: " + e.message);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
