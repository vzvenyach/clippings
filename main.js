const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const Readability = require("readability");
const fs = require("fs");
const path = require("path");

/**
 * Takes a url and returns a parsed article
 * @param {str} url The article's url
 * @returns {Promise<article>} promise of the parsed article object
 **/
const getArticleFromURL = async url => {
  return axios
    .get(url, {
      validateStatus: function(status) {
        return status < 400; // Reject only if the status code is greater than or equal to 500
      }
    })
    .then(function(response) {
      const dom = new JSDOM(response.data, { url: url });
      let reader = new Readability(dom.window.document);
      let article = reader.parse();
      return article;
    })
    .catch(function(error) {
      console.log(error);
    });
};

/**
 * This function takes a list of urls and creates a Promise
 * @param {array<string>} urls Takes an array of url strings
 * @returns {Promise} promise with an array of parsed articles
 **/
const getArticlesFromUrlArray = async urls => {
  return Promise.all(urls.map(d => getArticleFromURL(d)));
};

/**
 * This function takes an array of parsed articles and writes to an ePub
 * @param {array<article>} articles the array of parsed articles
 * @param {string} outfile the name of the file to be saved
 */
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
}

/**
 * Command line args and function calls
 **/ 
if (process.argv.length > 3) {
  const outfile = process.argv[2];
  const urls = process.argv.slice(3, process.argv.length + 1);
  getArticlesFromUrlArray(urls).then(articles => {
    articles2ePub(articles, outfile);
  });
} else {
  console.log("Fix the command arguments");
}
