import { google } from "googleapis";
import fs from "fs";
import { readdir, readFile } from "fs/promises";
import { getAuth } from "../auth/auth";
import { OAuth2Client } from "google-auth-library";
import path from "path";
import { encodeFileName } from "./utils";
// change these for each uploads session
const TITLE_HASHTAGS = "#kumbh #kumbhmela #motivation #meditation #relaxing";
const DESCRIPTION_HASHTAGS =
  "#shorts #kumbh #kumbhmela #motivation #meditation #relaxing #religion";

interface VideoDetails {
  title: string;
  description?: string;
  tags?: Array<string>;
  categoryId: string;
  privacyStatus: string;
  publishAt: string;
  notifySubscribers?: boolean;
}

export const getChannel = async (auth: OAuth2Client) => {
  try {
    const service = google.youtube("v3");
    const response: any = await service.channels.list({
      auth: auth,
      part: ["snippet", "contentDetails", "statistics"],
      forHandle: "@himalayan-avengers",
    });

    const channels = response.data.items;
    return channels;
  } catch (err) {
    console.log("The API returned an error: " + err);
    throw err;
  }
};

const getVideoStream = (filePath: string) => {
  return fs.createReadStream(filePath);
};

export const uploadVideo = async (
  auth: OAuth2Client,
  videoDetails: VideoDetails,
  videoFilePath: string
) => {
  try {
    const inputVideoStream = getVideoStream(videoFilePath);
    const service = google.youtube("v3");
    const response = await service.videos.insert({
      auth: auth,
      part: ["snippet", "status"],
      // Channelid or handle is needed, as it uploads to the channel as authenticated for.
      // forHandle: '@SoulfulAvengers',
      // id: 'UCyRfoXQcb6PK0ykyDwyFrjg', // channel id
      requestBody: {
        snippet: {
          // channelId: 'UCyRfoXQcb6PK0ykyDwyFrjg',
          title: videoDetails.title,
          description: videoDetails.description,
          tags: videoDetails.tags,
          categoryId: videoDetails.categoryId,
        },
        status: {
          privacyStatus: videoDetails.privacyStatus,
          publishAt: videoDetails.publishAt,
        },
      },
      media: {
        body: inputVideoStream, // videoDetails.media
      },
    });
    return response.data;
  } catch (err) {
    console.log("The API returned an error: " + err);
    throw err;
  }
};

const defaultVDetail: VideoDetails = {
  title: "Test Video title",
  description: "Test Description #quotes",
  tags: ["test", "quotes"],
  categoryId: "22", // Category ID for People & Blogs
  privacyStatus: "private",
  publishAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // Schedule the video to be public at this date and time | AFTER Hours
};

const getVideoFileNames = async () => {
  const videosDir = path.resolve(__dirname, process.env.VIDEOS_DIR || "");

  const files = await readdir(videosDir);
  const videos = files
    .filter(
      (file) =>
        file.endsWith(".mp4") || file.endsWith(".mov") || file.endsWith(".avi")
    )
    .map((fl) => path.join(videosDir, fl));
  return videos;
};

const getVideoDetails = async () => {
  const file = path.resolve(__dirname, process.env.VIDEO_INFO_FILE || "");
  const str = await readFile(file, { encoding: "utf-8" });
  const videoInfos = JSON.parse(str);
  return videoInfos;
};

const getVideoDetail = (videoInfos: [], videoFile: string) => {
  const pName = videoFile.substring(
    videoFile.lastIndexOf("\\") + 1,
    videoFile.lastIndexOf(".")
  );
  return videoInfos.find((v: any) => encodeFileName(v.title) === pName);
};

export const startUpload = async () => {
  const videos = await getVideoFileNames();
  const videoInfos = await getVideoDetails();
  const auth = getAuth();

  for (const video of videos) {
    try {
      const vInfo: any = getVideoDetail(videoInfos, video);
      // Gets Primary Filename
      const pName = video.substring(
        video.lastIndexOf("\\") + 1,
        video.lastIndexOf(".")
      );

      const vDetail: VideoDetails = {
        title: `${vInfo?.title || pName} ${TITLE_HASHTAGS}`,
        description: `${DESCRIPTION_HASHTAGS}

        ${vInfo?.summary || ""}

        ${vInfo?.translation || ""}`,
        categoryId: defaultVDetail.categoryId,
        privacyStatus: defaultVDetail.privacyStatus,
        publishAt: defaultVDetail.publishAt,
        notifySubscribers: true,
      };
      const res = await uploadVideo(auth, vDetail, video);
      console.log(`UPLOADED: YOUTUBE ID: ${res.id} | ${video}`);
    } catch (error) {
      console.log(`FAILED UPLOAD: ${video} | MESSAGE: ${error}`);
      console.log("uploading next...");
    }
  }
};
