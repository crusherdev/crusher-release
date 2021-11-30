import glob from "glob";

glob("tests/**/*.txt", (er, m) => console.log(m));
