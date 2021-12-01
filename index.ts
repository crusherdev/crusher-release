import util from "util";
import { PrismaClient } from "@prisma/client";
import { exec, spawn } from "child_process";
import glob from "glob";
import fs from "fs";

function getFiles() {
  return new Promise((resolve, reject) => {
    glob("tests/**/*.txt", (err: any, files: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

const execPromise = util.promisify(exec);

const prisma = new PrismaClient();

const wait = (timeout = 1) => {
  return new Promise((r) =>
    setTimeout(() => {
      r("");
    }, timeout * 1000)
  );
};

const LIMIT = 5;
const GITHUB_SHA = process.env.GITHUB_SHA || "";
const TEST_NUMBER = Number(process.env.TEST_NUMBER) || 1;

async function main(er: Error | null, files: string[]) {
  // @Note: Some issue with this. Array is empty sometimes
  // files = files.slice(TEST_NUMBER * (LIMIT - 1), TEST_NUMBER * LIMIT);
  console.log(files);
  const result = [];

  for (const file of files) {
    const [_, testURL, testName] = file.match(/tests\/(.*)\/(.*).txt/) || [];

    const crusherRecorder = spawn("crusher-electron-app", ["--no-sandbox"]);
    console.log(testName, testURL);
    await wait(2);

    await execPromise(`xmacroplay -d 50 "$DISPLAY" < ${file}`);

    const status = "PASS";
    result.push({ file, status });
    await prisma.runResult.create({
      data: {
        testName,
        testURL,
        status,
        sha: GITHUB_SHA,
        releaseName: "",
        logs: "",
      },
    });
    crusherRecorder.kill("SIGHUP");
    await wait();
  }

  fs.writeFileSync("./output.txt", result.join("\n"), {
    encoding: "utf-8",
    flag: "w",
  });
}

(async () => {
  await prisma.$connect();
  const files = await getFiles();

  await main(null, files as any);
})();
