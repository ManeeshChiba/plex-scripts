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

function addToManifest(payload) {
  const manifestFilePath = path.join(__root, "manifests", "manifest.json");

  fs.stat(path.resolve(manifestFilePath), function (err) {
    if (err == null) {
      const data = fs.readFileSync(path.resolve(manifestFilePath), "utf8");
      try {
        const asJSON = JSON.parse(data);
        const newPayload = { ...asJSON, ...payload };
        const serializedPayload = JSON.stringify(newPayload);
        fs.writeFile(manifestFilePath, serializedPayload, "utf8", () => {
          console.log("File written");
        });
      } catch (err) {
        console.error(err);
      }
      // Exisits, open and rewrite;
    } else if (err.code === "ENOENT") {
      const serializedPayload = JSON.stringify(payload);
      fs.writeFile(manifestFilePath, serializedPayload, "utf8", () => {
        console.log("File written");
      });
    }
  });
}

async function main() {
  console.log(`🔍 BEGIN SEARCH FOR: ${scriptArgument}`);
  const id = await getMovieID(scriptArgument);
  console.log(`🪪 ID FOUND: ${id}`);
  const videos = await getMovieVideos(id);
  const filtered = filterTrailers(videos);
  console.log(`🎥 FOUND ${filtered?.length} trailers`);
  const bestTrailer = filtered[0];
  const manifestEntry = {
    [`${scriptArgument}`]: {
      tvdbID: id,
      videoID: bestTrailer.key,
      resolution: bestTrailer.size,
    },
  };
  addToManifest(manifestEntry);
}

main();
