import * as dotenv from 'dotenv';
import * as express from 'express';
import { Request } from 'express';
import { google } from 'googleapis';
import open from 'open';

dotenv.config();

async function main() {
  const PORT = 3000;
  const REDIRECT_PATH = '/oauth2callback';
  const oAuth2Client = new google.auth.OAuth2(
    process.env.YT_OAUTH_CLIENT_ID!,
    process.env.YT_OAUTH_CLIENT_SECRET!,
    `http://localhost:${PORT}${REDIRECT_PATH}`,
  );

  // 1) generate the consent URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.force-ssl'],
    prompt: 'consent',
  });

  // 2) spin up a tiny HTTP server to catch the redirect
  const app = express();
  const server = app.listen(PORT, () =>

    app.get(REDIRECT_PATH, async (req: Request, res: any) => {
      const code = req.query.code as string;
      if (!code) {
        return res.status(400).send('Missing code');
      }

      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // show the refresh token in the browser & console
        res.send(`
        <h1>Success!</h1>
        <p>Your Refresh Token: <strong>${tokens.refresh_token}</strong></p>
        <p>Copy this into your <code>.env</code> file.</p>
      `);
      }
      catch (err) {
        console.error('Error retrieving access token.', err);
        res.status(500).send('Authentication failed');
      }
      finally {
        server.close();
      }
    }));

  // 3) open the browser to the consent page
  await open(authUrl);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
