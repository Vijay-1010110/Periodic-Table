const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("jsdomError", (e) => { console.error("JSDOM ERROR:", e); });
virtualConsole.on("error", (e) => { console.error("ERROR:", e); });
virtualConsole.on("log", (msg) => { console.log("LOG:", msg); });

const dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole });
console.log("JSDOM initialized");
