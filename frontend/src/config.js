const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://rida-1mt4.onrender.com'
    : 'http://localhost:5000',
  
  WS_BASE_URL: process.env.NODE_ENV === 'production'
    ? 'wss://rida-1mt4.onrender.com'
    : 'ws://localhost:10000'
};

export default config;
