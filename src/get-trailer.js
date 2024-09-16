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

export async function addToManifest(payload) {
  const manifestFilePath = path.join(__root, "manifests", "manifest.json");

  return new Promise((resolve) => {
    fs.stat(path.resolve(manifestFilePath), function (err) {
      if (err == null) {
        const data = fs.readFileSync(path.resolve(manifestFilePath), "utf8");
        try {
          const asJSON = JSON.parse(data);
          const newPayload = { ...asJSON, ...payload };
          const serializedPayload = JSON.stringify(newPayload);
          fs.writeFile(manifestFilePath, serializedPayload, "utf8", () => {
            console.log(`📝 MANIFEST UPDATED`);
            resolve();
          });
        } catch (err) {
          console.error(err);
        }
        // Exisits, open and rewrite;
      } else if (err.code === "ENOENT") {
        const serializedPayload = JSON.stringify(payload);
        fs.writeFile(manifestFilePath, serializedPayload, "utf8", () => {
          console.log(`📝 MANIFEST CREATED`);
          resolve();
        });
      }
    });
  });
}

export default async function main(title, addToFile = true) {
  return new Promise(async (resolve) => {
    if (String(title).indexOf("/") == -1) {
      console.log(`🔍 BEGIN SEARCH FOR: ${title}`);
      const id = await getMovieID(title);
      if (id) {
        console.log(`🪪 ${title}: ID ${id}`);
        const videos = await getMovieVideos(id);
        const filtered = filterTrailers(videos);
        console.log(`🎥 ${title}: FOUND ${filtered?.length} TRAILERS`);
        const bestTrailer = filtered[0];
        const manifestEntry = {
          [`${title}`]: {
            tvdbID: id,
            videoID: bestTrailer.key,
            youtubeURL: `https://www.youtube.com/watch?v=${bestTrailer.key}`,
            resolution: bestTrailer.size,
          },
        };
        if (addToFile) {
          await addToManifest(manifestEntry);
        } else {
          resolve(manifestEntry);
        }
        resolve();
      } else {
        console.warn(`ID not found for ${title}. Skipping...`);
      }
    }
  });
}

main(scriptArgument);
