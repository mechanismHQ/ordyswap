const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

const package = readFileSync(join(__dirname, "package.json"), {
  encoding: "utf-8",
});

const version = JSON.parse(package).version;

const file = `export const VERSION = "${version}";\n`;

writeFileSync(join(__dirname, "src", "commands", "version.ts"), file, {
  encoding: "utf-8",
});
