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

async function main(files: string[]) {
  // @Note: Some issue with this. Array is empty sometimes
  // files = files.slice(TEST_NUMBER * (LIMIT - 1), TEST_NUMBER * LIMIT);
  console.log(files);
  const results = [
    `| Test Name | Test URL | Status |`,
    `| --------- | -------- | ------ |`,
  ];

  for (const file of files) {
    const [_, testURL, testName] = file.match(/tests\/(.*)\/(.*).txt/) || [];

    const crusherRecorder = spawn("crusher-electron-app", [
      "--no-sandbox",
      `--log-file=./${testName}_${testURL}.json`,
    ]);
    console.log(testName, testURL);
    await wait(2);

    await execPromise(`xmacroplay -d 50 "$DISPLAY" < ${file}`);

    let status: "FAIL" | "PASS" = "FAIL";
    if (fs.existsSync(`${testName}_${testURL}.json`)) {
      const logs = require(`./${testName}_${testURL}.json`);
      status = logs.hasPassed ? "PASS" : "FAIL";
    }

    results.push(`|${testName}|${testURL}|${status}|`);
    await prisma.runResult
      .create({
        data: {
          testName,
          testURL,
          status,
          sha: GITHUB_SHA,
          releaseName: "",
          logs: "",
          startTime: new Date(),
        },
      })
      .catch(console.log);
    await wait(20);
    crusherRecorder.kill("SIGHUP");
    await wait();
  }
  fs.writeFileSync("./results.md", results.join("\n"), "utf8");
}

(async () => {
  await prisma.$connect().catch(console.log);
  const files = await getFiles();

  await main(files as any);
})();
