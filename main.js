const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const Readability = require("readability");
const fs = require("fs");
const path = require("path");

if (process.argv.length == 4) {
  const url = process.argv[2];
  const outfile = process.argv[3];
  url2ePub(url, outfile);
} else {
  console.log("Please pass a URL as the first argument");
}

function url2ePub(url, outfile) {
  axios
    .get(url, {
      validateStatus: function(status) {
        return status < 400; // Reject only if the status code is greater than or equal to 500
      }
    })
    .then(function(response) {
      const dom = new JSDOM(response.data);
      let reader = new Readability(dom.window.document);
      let article = reader.parse();
      var cp = require("child_process");
      let child = cp.spawn("pandoc", [
        "-o",
        outfile,
        "--css=lib/styles.css",
        "--from=html",
        "--metadata",
        `title=${article.title}`,
        "--metadata",
        `author=${article.byline}`
      ]);
      child.stdin.write(`${article.content}\n`);
      child.stdin.end();
      child.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
      });
      child.stderr.on("data", data => {
        console.error(`stderr: ${data}`);
      });
      child.on("close", code => {
        console.log(`child process exited with code ${code}`);
      });
      child.stdin.end();
    })
    .catch(function(error) {
      console.log(error);
    })
    .then(function() {
      // always executed
    });
}
