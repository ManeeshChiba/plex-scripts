import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getMovieID } from "./get-trailer-url.js";
import { getMovieVideos } from "./get-movie-videos.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = __dirname.substring(0, __dirname.lastIndexOf("/"));

const scriptArgument = process.argv[2];

function filterTrailers(vidoes) {
  return vidoes
    .filter((video) => {
      return video.site.toLowerCase() === "youtube";
    })
    .filter((video) => {
      return video.type.toLowerCase() === "trailer";
    })
    .sort((a, b) => b.size - a.size);
}

const manifestFilePath = path.join(__root, "manifests", "manifest.json");
const metasFilePath = path.join(__root, "cache", "metas.txt");
export async function addToMetaFile(payload) {
  return new Promise((resolve) => {
    const stream = fs.createWriteStream(metasFilePath, { flags: "a" });
    const content = `${JSON.stringify(payload, null, 4)},\n`;
    stream.write(content);
    resolve();
  });
}

export async function finalizeManifest() {
  return new Promise((resolve) => {
    const data = fs.readFileSync(path.resolve(metasFilePath), "utf8");
    const serial = `[${data.slice(0, -2)}]`;
    const metaArray = JSON.parse(serial).flat();
    const manifest = metaArray.reduce((acc, curr) => {
      return {
        ...acc,
        [`${curr["title"]}`]: {
          ...curr,
        },
      };
    }, {});
    const serializedPayload = JSON.stringify(manifest, null, 4);
    fs.writeFile(manifestFilePath, serializedPayload, "utf8", () => {
      console.log(`📝 MANIFEST CREATED`);
      resolve();
    });
  });
}

function updateLog(content) {
  const logFile = path.join(__root, "cache", "debug.log");
  const logger = fs.createWriteStream(logFile, { flags: "a" });
  logger.write(`${new Date().toISOString()} ${content}\n`);
}

function sleep(seconds) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds);
  });
}

export default async function main(title, payloadAdditions) {
  return new Promise(async (resolve) => {
    if (String(title).indexOf("/") == -1) {
      console.log(`🔍 BEGIN SEARCH FOR: ${title}`);
      await sleep(892);
      const id = await getMovieID(title);
      if (id) {
        console.log(`🪪 ${title}: ID ${id}`);
        await sleep(640);
        const videos = await getMovieVideos(id);
        const filtered = filterTrailers(videos);
        console.log(`🎥 ${title}: FOUND ${filtered?.length} TRAILERS`);
        if (filtered.length <= 0) {
          updateLog(`${title} not found.`);
        }
        if (filtered.length > 0) {
          const bestTrailer = filtered[0];
          const manifestEntry = [
            {
              title: title,
              tvdbID: id,
              videoID: bestTrailer.key,
              youtubeURL: `https://www.youtube.com/watch?v=${bestTrailer.key}`,
              resolution: bestTrailer.size,
              ...payloadAdditions,
            },
          ];
          await addToMetaFile(manifestEntry);
        }
        resolve();
      } else {
        updateLog(`ID not found for ${title}.`);
        resolve();
      }
    }
  });
}

main(scriptArgument);
