const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/fb', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // রিয়েল উইন্ডোজ চ্যাট ডাইরেক্ট ব্রাউজার সেটিং
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');
        
        await page.goto('https://mbasic.facebook.com/login/', { waitUntil: 'networkidle2' });

        // পেজের প্রয়োজনীয় লিঙ্ক ও UI টেক্সট এক্সট্র্যাক্ট
        const content = await page.evaluate(() => {
            let output = "=== FACEBOOK WEBSITE UI ===\n\n";
            document.querySelectorAll('form, input, a, button, p').forEach(el => {
                if (el.tagName === 'INPUT') {
                    output += `[Input: ${el.name || el.type}] ${el.value}\n`;
                } else if (el.innerText && el.innerText.trim().length > 0) {
                    output += `${el.innerText.trim()}\n-------------------\n`;
                }
            });
            return output;
        });

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(content);
    } catch (error) {
        res.status(500).send("Browser Render Error: " + error.message);
    } finally {
        if (browser) await browser.close();
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
