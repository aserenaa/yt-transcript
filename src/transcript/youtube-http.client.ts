import axios, { AxiosInstance } from 'axios';

export async function createYouTubeAxiosInstance(proxyUrl?: string): Promise<AxiosInstance> {
  // Create a basic axios instance without cookie jar support
  const axiosInstance = axios.create({
    baseURL: 'https://www.youtube.com',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        + 'AppleWebKit/537.36 (KHTML, like Gecko) '
        + 'Chrome/114.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    withCredentials: true,
    timeout: 15_000,
  });

  // Configure proxy if provided
  if (proxyUrl) {
    try {
      const proxy = new URL(proxyUrl);
      axiosInstance.defaults.proxy = {
        protocol: proxy.protocol.replace(':', ''),
        host: proxy.hostname,
        port: Number.parseInt(proxy.port, 10),
        auth: proxy.username
          ? { username: proxy.username, password: proxy.password }
          : undefined,
      };
    }
    catch (error) {
      console.error('Invalid proxy URL format:', error);
    }
  }

  return axiosInstance;
}
