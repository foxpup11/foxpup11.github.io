const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CSDN_USERNAME = 'qq_51605551';
const RSS_URL = `https://blog.csdn.net/${CSDN_USERNAME}/rss/list`;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { headers: HEADERS }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchRSS(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP Error: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : null;
}

function decodeHTML(html) {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function parseRSS(xml) {
  const articles = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const pubDate = extractTag(itemXml, 'pubDate');
    const description = extractTag(itemXml, 'description');
    const category = extractTag(itemXml, 'category');

    if (title && link) {
      articles.push({
        title: decodeHTML(title).trim(),
        link: link.trim(),
        pubDate: pubDate ? new Date(pubDate).toISOString() : null,
        description: decodeHTML(description || '').replace(/<[^>]*>/g, '').trim().substring(0, 200),
        category: category ? decodeHTML(category).trim() : null,
      });
    }
  }
  return articles;
}

async function main() {
  console.log(`Fetching CSDN RSS for user: ${CSDN_USERNAME}`);
  console.log(`RSS URL: ${RSS_URL}`);

  try {
    const xml = await fetchRSS(RSS_URL);
    console.log(`Fetched ${xml.length} bytes`);
    const articles = parseRSS(xml);
    console.log(`Parsed ${articles.length} articles`);
    const limitedArticles = articles.slice(0, 20);

    const outputPath = path.join(__dirname, '../../data/articles.json');
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify({
      username: CSDN_USERNAME,
      updatedAt: new Date().toISOString(),
      articles: limitedArticles,
    }, null, 2));

    console.log(`Saved to ${outputPath}`);
    limitedArticles.forEach((a, i) => {
      console.log(`  ${i + 1}. ${a.title}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
