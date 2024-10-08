import childProcess from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptArgument = process.argv[2];
const passthrough = process.argv.splice(3, process.argv.length).join(" ");

const scripts = {
  GET_TRAILER: "get-trailer",
  FETCH_FROM_PATH: "fetch-from-path",
};

function main() {
  switch (scriptArgument) {
    case scripts.GET_TRAILER:
      {
        childProcess.execSync(`node ./src/get-trailer.js ${passthrough}`, {
          stdio: "inherit",
        });
      }
      break;
    case scripts.FETCH_FROM_PATH:
      {
        childProcess.execSync(`node ./src/fetch-from-path.js ${passthrough}`, {
          stdio: "inherit",
        });
      }
      break;
    default: {
      console.error(
        `Script not found. Please try again.\n Valid script commands are: ${Object.values(
          scripts
        ).join(", ")}`
      );
    }
  }
}

main();
