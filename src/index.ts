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
  console.log("Found", files.length, "test cases");
  console.log();
  const results = [
    `| Test Name | Test URL | Status |`,
    `| --------- | -------- | ------ |`,
  ];

  for (const file of files) {
    const [_, testURL, testName] = file.match(/tests\/(.*)\/(.*).txt/) || [];
    const logFile = `${testName}_${testURL}.json`;

    const crusherRecorder = spawn("crusher-electron-app", [
      "--no-sandbox",
      `--log-file=./${logFile}`,
    ]);
    console.log();
    console.log("------------------------------------");
    console.log("TestName", testName);
    console.log("URL", testURL);
    console.log();

    await wait(2);
    try {
      console.log("Started ACTIONS");
      await execPromise(`xmacroplay -d 50 "$DISPLAY" < ${file}`);
      console.log("Finished ACTIONS");
    } catch (er) {
      console.log("UNBALE TO START XMACROPLAY", er);
    }

    let retry = 0;

    while (!fs.existsSync(logFile) && retry < 15) {
      console.log(
        "Waiting for recorder to save...",
        ++retry,
        "Retrying in 20s"
      );
      await wait(20);
    }

    if (!fs.existsSync(logFile)) {
      results.push(`|${testName}|${testURL}|Logs not generated|`);
      console.error(`File ${logFile} not found after 15 retrying`);
      continue;
    }
    console.log("Logfile found, matching steps");
    let recordedSteps, generatedLogs: any;
    try {
      recordedSteps =
        JSON.parse(fs.readFileSync(`./${testName}_${testURL}.json`, "utf8"))
          ?.steps || [];
      generatedLogs = JSON.parse(fs.readFileSync(`./${logFile}`, "utf8"));
    } catch (er) {
      console.log("Log file can't be imported", er);
      continue;
    }
    const stepsMatched =
      generatedLogs.hasPassed &&
      recordedSteps.every((step: any, index: number) => {
        const gStep = generatedLogs.steps[index].type;
        console.log("Step", index + 1, step.type, gStep);
        return step.type === gStep;
      });

    !stepsMatched && console.log("Few Steps did not matched");
    const status = stepsMatched ? "PASS" : "FAIL";

    console.log("Status", status);

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
      .then(() => console.log("Added to DB"))
      .catch(() => console.log("Unable to save in DB"));

    await wait(2);
    console.log("Stopping recorder");
    crusherRecorder.kill("SIGHUP");
    await wait();
  }
  console.log();
  console.log('Saving results to "results.md"');
  fs.writeFileSync("./results.md", results.join("\n"), "utf8");
  console.log("Done");
}

(async () => {
  await prisma.$connect().catch(console.log);
  const files = await getFiles();

  await main(files as any);
  process.exit();
})();
