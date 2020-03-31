const child_process = require("child_process");
const check_pandoc = () => {
  try {
    child_process.execSync("type pandoc", { stdio: "pipe" }).toString();
    return true;
  } catch (error) {
    console.log("Pandoc is not installed... Please install it.");
    return false;
  }
};

const config = {};

config.check_pandoc = check_pandoc;

module.exports = config;
