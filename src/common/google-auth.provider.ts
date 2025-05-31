import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

export const googleAuthProvider: Provider = {
  provide: 'YT_OAUTH2_CLIENT',
  useFactory: (cfg: ConfigService) => {
    const client = new google.auth.OAuth2(
      cfg.get('YT_OAUTH_CLIENT_ID'),
      cfg.get('YT_OAUTH_CLIENT_SECRET'),
    );
    client.setCredentials({ refresh_token: cfg.get('YT_OAUTH_REFRESH_TOKEN') });
    return client;
  },
  inject: [ConfigService],
};
