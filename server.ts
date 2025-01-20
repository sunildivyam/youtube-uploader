import express, { Request, Response } from "express";
import { getChannel } from "./src/youtube/youtube";
import dotenv from "dotenv";
import {
  oauth2Client,
  YOUTUBE_API_SCOPES,
  storeToken,
  getAuth,
} from "./src/auth/auth";

dotenv.config();

const app = express();

app.get("/auth", (req: Request, res: Response) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: YOUTUBE_API_SCOPES,
  });

  res.redirect(url);
});

app.get("/oauth2callback", async (req: Request, res: Response) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    await storeToken(tokens.access_token || "");
    res.send("Authenticated, Tokens saved in env for use.");
  } catch (error) {
    console.log("Error", error);
    res.status(500).send("Error during OAuth");
  }
});

app.get("/channelinfo", async (req: Request, res: Response) => {
  try {
    const channels = await getChannel(getAuth());
    res.send(channels);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("YouTube Uploader APIs");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
