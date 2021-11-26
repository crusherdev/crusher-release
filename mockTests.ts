import template from "./template";

const obj = { ".": "period" };

const genActions = (website: string) =>
  website
    .split("")
    .map((e: unknown) => {
      const l = obj[e as "."] || e;
      return `KeyStrPress ${l}
KeyStrRelease ${l}`;
    })
    .join("\n");

const webURL = [
  "linkedin.com",
  "github.com",
  "google.com",
  "amazon.com",
  "paytm.com",
  "arpitbhalla.me",
  "instagram.com",
  "facebook.com",
];

export const mock = webURL.map(genActions).map((actions, i) => ({
  id: "demoID" + i,
  actions: template(actions),
  url: webURL[i],
}));
