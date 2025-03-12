const http = require('http');
const https = require('https');

const hostname = '0.0.0.0'; // 关键修改
const port = 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/getBilibiliFans') {
    const options = {
      hostname: 'api.bilibili.com',
      path: '/x/relation/stat?vmid=4848323',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Accept': 'application/json',
        'Origin': 'https://www.bilibili.com'
      }
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let data = '';
      
      proxyRes.on('data', (chunk) => { 
        data += chunk; 
      });
      
      proxyRes.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify(jsonData));
        } catch (error) {
          console.error('Error parsing response:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to parse response data' }));
        }
      });
    });

    proxyReq.on('error', (e) => {
      console.error('Request error:', e);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: e.message }));
    });

    // 设置请求超时
    proxyReq.setTimeout(5000, () => {
      proxyReq.destroy();
      res.statusCode = 504;
      res.end(JSON.stringify({ error: 'Request timeout' }));
    });

    proxyReq.end();
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

// 添加错误处理
server.on('error', (error) => {
  console.error('Server error:', error);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});