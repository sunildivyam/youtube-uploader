import { google } from "googleapis";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
dotenv.config();

export const YOUTUBE_API_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.upload",
];

export const OAuth2 = google.auth.OAuth2;

export const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.SECRET_ID,
  process.env.REDIRECT_URL
);

export const getAuth = (): OAuth2Client => {
  oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
  return oauth2Client;
};

/**
 * Store token to disk be used in later program executions.
 *
 * @param {string} token The token to store to disk.
 */
export const storeToken = async (token: string): Promise<void> => {
  try {
    let envVars = await readFile(path.join(".env"), { encoding: "utf-8" });
    const tokenIndex = envVars.indexOf("REFRESH_TOKEN");
    if (tokenIndex >= 0) {
      envVars = envVars.substring(0, tokenIndex - 1);
    }
    envVars += `\nREFRESH_TOKEN=${token}\n`;
    process.env.REFRESH_TOKEN = token;
    await writeFile(".env", envVars, {});
    console.log("Token Stored in env");
  } catch (error) {
    console.log(error);
    throw error;
  }
};
