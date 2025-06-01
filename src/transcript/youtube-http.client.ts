import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import * as tough from 'tough-cookie';

export function createYouTubeAxiosInstance(proxyUrl?: string): AxiosInstance {
  const jar = new tough.CookieJar();

  const axiosInstance = wrapper(axios.create({
    baseURL: 'https://www.youtube.com',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        + 'AppleWebKit/537.36 (KHTML, like Gecko) '
        + 'Chrome/114.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    jar,
    withCredentials: true,
    timeout: 15_000,
  }));

  if (proxyUrl) {
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

  return axiosInstance;
}
