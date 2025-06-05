const express = require('express');
const axios = require('axios');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// HTTPS 에이전트 설정 (자체 서명 인증서 허용)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// 모든 origin 허용 (개발용)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 프록시 엔드포인트
app.get('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`[${new Date().toISOString()}] Proxying: ${targetUrl}`);

    // 원본 서버에서 이미지 가져오기
    const response = await axios.get(targetUrl, {
      responseType: 'arraybuffer',
      httpsAgent: httpsAgent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.logii.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      },
      timeout: 10000 // 10초 타임아웃
    });

    // 원본 헤더 복사 및 CORS 헤더 추가
    const contentType = response.headers['content-type'] || 'image/png';
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=300', // 5분 캐싱
      'X-Proxy-Status': 'success'
    });

    // 이미지 데이터 전송
    res.send(Buffer.from(response.data));
    
    console.log(`[${new Date().toISOString()}] Success: ${targetUrl} (${contentType})`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);
    
    if (error.response) {
      res.status(error.response.status).json({ 
        error: 'Failed to fetch from origin',
        status: error.response.status,
        message: error.message
      });
    } else if (error.request) {
      res.status(504).json({ 
        error: 'No response from origin server',
        message: error.message
      });
    } else {
      res.status(500).json({ 
        error: 'Proxy server error',
        message: error.message
      });
    }
  }
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`CORS proxy server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Proxy endpoint: http://localhost:${PORT}/proxy?url=<encoded-url>`);
});
