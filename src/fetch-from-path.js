import path from "path";
import fs from "node:fs/promises";
import getTrailer, { addToManifest } from "./get-trailer.js";

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

  return filtered
    .filter((x) => x)
    .map((name) =>
      name.replace(/ *\([^)]*\) */g, "").replace(/\[[^\]]*\]/g, "")
    );
}

async function main() {
  console.log(`👀 GRABBING DIRECTORIES AT ${dirPath}`);
  const folders = await readDirectory(dirPath);
  console.log(`📂 FOUND ${folders.length} DIRECTORIES`);
  let finalPayload = {};
  await Promise.all(
    folders.map(async (folder) => {
      const payload = await getTrailer(folder, false);
      finalPayload = { ...finalPayload, ...payload };
    })
  );
  await addToManifest(finalPayload);
}

main();
