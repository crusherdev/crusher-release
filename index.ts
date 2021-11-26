import { PrismaClient } from "@prisma/client";
import util from "util";
import { exec } from "child_process";

const execPromise = util.promisify(exec);

const prisma = new PrismaClient();

const log = (id: string) => console.log.bind(`[${id}]`);
const wait = (timeout = 2000) =>
  new Promise((r) =>
    setTimeout(() => {
      r("");
    }, timeout)
  );

const LIMIT = 5;
const GITHUB_SHA = process.env.GITHUB_SHA || "efrvc";
const TEST_SUITE_ID = Number(process.env.GITHUB_SHA) || 1;

async function main() {
  await prisma.$connect();

  const cases = await prisma.case.findMany({
    skip: LIMIT * (TEST_SUITE_ID - 1),
    take: LIMIT,
  });

  for (const { actions, id } of cases) {
    // start Crusher recorder
    log(id)("Starting Crusher app");
    execPromise("crusher-electron-app");
    await wait();
    // Perform actions on crusher recorder
    log(id)("Performing actions");
    const { stderr, stdout } = await execPromise(
      `xmacroplay -d 50 "$DISPLAY" < tests/microsoft.txt`
    );

    const status = stderr ? "FAILED" : "PASS";
    log(id)(status);
    await prisma.test.create({
      data: {
        sha: GITHUB_SHA,
        caseID: id,
        status,
        logs: stdout,
      },
    });

    log("Killing Crusher app");
    // kill Crusher recorder
    await execPromise("pkill crusher-electron-app");
  }
}

main().catch(console.log);
