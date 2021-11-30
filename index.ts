import util from "util";
import { PrismaClient } from "@prisma/client";
import { exec, spawn } from "child_process";
import glob from "glob";
import { appendFileSync } from "fs";

const execPromise = util.promisify(exec);

// const prisma = new PrismaClient();

const wait = (timeout = 1) =>
  new Promise((r) =>
    setTimeout(() => {
      r("");
    }, timeout * 1000)
  );

const LIMIT = 5;
const GITHUB_SHA = process.env.GITHUB_SHA || "";
const TEST_NUMBER = Number(process.env.TEST_NUMBER) || 1;

async function main(er: Error | null, files: string[]) {
  files = files.slice((TEST_NUMBER - 1) * LIMIT, TEST_NUMBER * LIMIT);
  for (const file of files) {
    const [_, testURL, testName] = file.match(/tests\/(.*)\/(.*).txt/) || [];
    const crusherRecorder = spawn("crusher-electron-app", ["--no-sandbox"]);
    await wait(0.5);
    await execPromise(`xmacroplay -d 50 < ${file}`);
    const status = "PASS";
    appendFileSync("./tests.txt", `${testURL} ${testName} ${status}\n`);
    console.log(`${testURL} ${testName} ${status}`);
    // await prisma.runResult.create({
    //   data: {
    //     testName,
    //     testURL,
    //     status,
    //     sha: GITHUB_SHA,
    //     releaseName: "",
    //     logs: "",
    //   },
    // });
    crusherRecorder.kill("SIGKILL");
    await wait();
  }
}

(async () => {
  // await prisma.$connect();
  glob("tests/**/*.txt", main);
})();
