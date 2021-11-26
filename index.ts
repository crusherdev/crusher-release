import util from "util";
import { PrismaClient } from "@prisma/client";
import { exec, spawn } from "child_process";
import fs from "fs";
import { mock } from "./mockTests";
const execPromise = util.promisify(exec);

// const prisma = new PrismaClient();

const log = (id: string) => console.log.bind(null, `[${id}]`);

const wait = (timeout = 1) =>
  new Promise((r) =>
    setTimeout(() => {
      r("");
    }, timeout * 1000)
  );

const LIMIT = 5;
const GITHUB_SHA = process.env.GITHUB_SHA || "template-sha";
const TEST_SUITE_ID = Number(process.env.GITHUB_SHA) || 1;

async function main() {
  // await prisma.$connect();

  const cases = mock;
  //  await prisma.case.findMany({
  //   skip: LIMIT * (TEST_SUITE_ID - 1),
  //   take: LIMIT,
  // });

  if (!fs.existsSync("tests")) {
    fs.mkdirSync("tests");
  }

  for (const { actions, id, url } of cases) {
    const path = "tests/" + url + ".txt";
    log(id)("Starting Crusher app");
    const crusherRecorder = spawn("crusher-electron-app");

    await wait(0.5);
    fs.writeFileSync(path, actions, "utf8");

    log(id)("Performing actions on crusher recorder");
    const { stderr, stdout } = await execPromise(
      `xmacroplay -d 50 "$DISPLAY" < ${path}`
    );

    const status = stderr ? "FAILED" : "PASS";
    log(id)(status);
    // await prisma.test.create({
    //   data: {
    //     sha: GITHUB_SHA,
    //     caseID: id,
    //     status,
    //     logs: stdout,
    //   },
    // });

    log(id)("Killing Crusher app");

    crusherRecorder.kill("SIGHUP");
    await wait();
  }
}

main().catch(console.log);
