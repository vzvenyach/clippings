#!/usr/bin/env node

const articles = require("./lib/articles.js");
const articles2ePub = require("./lib/write.js");
const { program } = require("commander");

program.version("0.2.0");

program
  .command("config")
  .description("Configure this thing...")
  .action(function() {
    console.log("Not implemented...");
  });

program
  .command("run <outfile> <urls...>")
  .description("Run this thing...")
  .action(function(outfile, urls) {
    urls.slice(3, process.argv.length + 1);
    articles.getArticlesFromUrlArray(urls).then(a => {
      articles2ePub(a, outfile);
    });
  });

program.parse(process.argv);
