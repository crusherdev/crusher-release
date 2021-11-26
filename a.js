const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const obj = { ".": "period", ",": "Return" };

const genActions = (website) =>
  "Delay 3\n" +
  (website + ",")
    .split("")
    .map((e) => {
      const l = obj[e] || e;
      return `KeyStrPress ${l}
KeyStrRelease ${l}`;
    })
    .join("\n");

const webURL = [
  "google.com",
  "amazon.com",
  "paytm.com",
  "arpitbhalla.me",
  "instagram.com",
  "facebook.com",
];

(async () => {
  await prisma.case.createMany({
    data: webURL.map(genActions).map((actions, i) => ({
      actions,
      url: webURL[i],
    })),
  });
})();
