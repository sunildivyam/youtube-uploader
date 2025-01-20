# youtube-uploader

Uploads YouTube reels from your disk folder

## Steps

1. Setup Google AuthScreen in Google Cloud console, to enable log in into your google account and then Youtube Channel/Brand
   - Create Credentials => OAuth Client Id => Web Application => Authorize JavaScript Origin (http://localhost:3000) => Authorize Redirect URIs (http://localhost:3000/oauth2callback)
   - Cloud console => Youtube Data API V3 => Enable API => Manage API => Create New App => Enter Details you want to show on AuthScreen eg. App Name, email etc. => Add test users(email Ids that you allow to upload to Youtube)
   - From Credentials => Copy Redirect URIs, client Id and Client Secret => Paste them in .env file CLIENT_ID, CLIENT_SECRET, REDIRECT_URL
   - Ensure VIDEO_DIR = should point to your video reels folder
   - Ensure VIDEO_INFO_FILE = should point to final-quote.json from react-reels
   - Run local dev server `npm run dev` => http://localhost:3000/auth => Google AuthScreen => Login your account => Select your channel => Successful => Redirected to http://localhost:3000/oauth2callback => Refresh Token saved into .env automatically.
   - Stop local Dev
   - Run `npm run startUpload`
   - Wait and watch your reels getting uploaded into youtube => Open Youtube Studio
