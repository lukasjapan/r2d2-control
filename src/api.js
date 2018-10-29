const express = require("express");
const fs = require("fs");
const cors = require("cors");
const expressRestFs = require("express-rest-fs");
const spawn = require("child_process").spawn;
const readline = require("readline");
const path = require("path");
const streamToSSE = require("express-stream-sse").default;
const { PassThrough } = require("stream");

const api = express();
api.use(cors());
api.use(express.json());

const filePath = __dirname + "/../files/";

api.get("/health-check", function(req, res) {
  res.json({ success: true });
});

// methods from here on need authentication
api.all("/*", function(req, res, next) {
  const apiKey = req.get("Api-Token");
  if (!apiKey || apiKey != process.env.API_TOKEN) {
    //res.status(401).json({ status: "failed", message: "unauthorized" });
  }
  console.log("Authenticated");
  next();
});

api.use("/files", expressRestFs({ basepath: filePath }));

api.get("/play", function(req, res) {
  const filename = filePath + req.query.file;
  const extension = path.extname(filename).substring(1) || "";
  const commandSetting = readConfig().fileMappings[extension] || "";
  const command = commandSetting.replace(/%f/, filename);

  const events = new PassThrough();
  const sse = streamToSSE(res, events);

  if (command) {
    const process = spawn(command, [], { shell: true });

    readline
      .createInterface({
        input: process.stdout,
        terminal: false
      })
      .on("line", function(line) {
        events.emit("data", { stdout: line });
      });

    readline
      .createInterface({
        input: process.stderr,
        terminal: false
      })
      .on("line", function(line) {
        events.emit("data", { stderr: line });
      });

    process.on("exit", function() {
      events.emit("end");
    });

    process.on("error", function(error) {
      events.emit("data", { stderr: error.toString() });
      events.emit("end");
    });

    req.on("close", function() {
      process.kill();
    });
  } else {
    events.emit("data", {
      stderr: "Command for extension '" + extension + "' not found."
    });
    events.emit("end");
  }

  return sse;
});

function readConfig() {
  const defaultConfigPath = __dirname + "/../conf/config.default.json";
  const configPath = __dirname + "/../conf/config.json";

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, "{}");
  }

  return {
    ...JSON.parse(fs.readFileSync(defaultConfigPath)),
    ...JSON.parse(fs.readFileSync(configPath))
  };
}

function writeConfig(config) {
  const configPath = __dirname + "/../conf/config.json";
  fs.writeFileSync(configPath, JSON.stringify(config));
}

api.get("/settings", function(req, res) {
  res.json({ success: true, result: readConfig() });
});

api.put("/settings", function(req, res) {
  writeConfig(req.body);
  res.json({ success: true, result: readConfig() });
});

api.listen(3000);
