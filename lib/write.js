const fs = require("fs");
const path = require("path");

/**
 * This function takes an array of parsed articles and writes to an ePub
 * @param {array<article>} articles the array of parsed articles
 * @param {string} outfile the name of the file to be saved
 */
const articles2ePub = (articles, outfile) => {
  let optArray = [
    "-o",
    outfile,
    `--css=./lib/styles.css`,
    "--from=html",
    "--metadata",
    "title=Generated ePub"
  ];
  var cp = require("child_process");
  let child = cp.spawn("pandoc", optArray);

  /**
   * Creates skeleton HTML files for each article and writes them to stdin
   */
  articles.map(function(article) {
    child.stdin.write(`<!DOCTYPE html>
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head><title>${article.title}</title></head>
      <body><main><h1>${article.title}</h1>
      <h2>${article.byline}</h2>
      ${article.content}</main></body></html>\n`);
  });

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
  // FIXME: Do I need this next line?
  child.stdin.end();
};

module.exports = articles2ePub;
