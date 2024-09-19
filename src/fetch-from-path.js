import path from "path";
import fs from "node:fs/promises";
import getTrailer, { finalizeManifest } from "./get-trailer.js";

const dirPath = process.argv[2];

async function readDirectory(stringPath) {
  const resolvedPath = path.resolve(stringPath);

  const files = await fs
    .readdir(resolvedPath)
    .catch((error) => console.error(error));

  const filtered = await Promise.all(
    files.map(async (file) => {
      const contents = await fs.lstat(path.join(stringPath, file), "utf8");
      return contents.isDirectory() ? file : null;
    })
  );

  return filtered.filter((x) => x);
}

async function main() {
  console.log(`👀 GRABBING DIRECTORIES AT ${dirPath}`);
  const folders = await readDirectory(dirPath);
  console.log(`📂 FOUND ${folders.length} DIRECTORIES`);

  for (const folder of folders) {
    const movie = folder
      .replace(/ *\([^)]*\) */g, "")
      .replace(/\[[^\]]*\]/g, "");
    await getTrailer(movie, {
      folder: `${dirPath}/${folder}`,
    });
  }

  await finalizeManifest();
}

main();
