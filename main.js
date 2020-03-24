const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const Readability = require("readability");
const fs = require("fs");
const path = require("path");

const getArticleFromURL = async url => {
  console.log(url);
  return axios
    .get(url, {
      validateStatus: function(status) {
        return status < 400; // Reject only if the status code is greater than or equal to 500
      }
    })
    .then(function(response) {
      const dom = new JSDOM(response.data, {url:url});
      let reader = new Readability(dom.window.document);
      let article = reader.parse();
      return article;
    })
    .catch(function(error) {
      console.log(error);
    });
};

const getArticlesFromUrlArray = async urls => {
  return Promise.all(urls.map(d => getArticleFromURL(d)));
};

function articles2ePub(articles, outfile) {
  let optArray = [
    "-o",
    outfile,
    "--css=lib/styles.css",
    "--from=html",
    "--metadata",
    "title=Generated ePub"
  ];
  var cp = require("child_process");
  let child = cp.spawn("pandoc", optArray);
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
  child.stdin.end();
}

if (process.argv.length > 3) {
  const outfile = process.argv[2];
  const urls = process.argv.slice(3, process.argv.length + 1);
  getArticlesFromUrlArray(urls).then(articles => {
    articles2ePub(articles, outfile);
  });
} else {
  console.log("Fix the command arguments");
}
