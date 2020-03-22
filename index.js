const fs = require("fs");
const path = require("path");
const glob = require("glob-ignore");
const fsPromises = require("fs").promises;

const getFiles = function(pathDir, search, ignore) {
  const findIgnoredFiles = async function(pathDir, ignore) {
    let ignoredData;
    if (ignore) {
      ignoredData = await fsPromises.readFile(
        pathDir + ignore,
        "utf8",
        (err, data) => {
          if (err) throw err;
          return data;
        }
      );
    } else {
      ignoredData = "";
    }
    return ignoredData;
  };

  findIgnoredFiles(pathDir, ignore)
    .then(res => {
      let ignoredArray = res.split("\n");
      let pathConcat = path.join(pathDir, search);
      return {
        ignoredArray,
        pathConcat
      };
    })
    .then(res => {
      let globFunc = async () => {
        let promise = new Promise((resolve, reject) => {
          glob(res.pathConcat, res.ignoredArray, function(err, files) {
            if (err) {
              console.log(err);
              return;
            } else {
              if (files.length > 0) {
                resolve(files);
              } else {
                console.log("No files found");
                return;
              }
            }
          });
        });
        let result = await promise;
        return result;
      };
      globFunc().then(res => {
        if (!res) {
          console.log("Error");
        } else {
          res.map(item => {
            fs.readFile(item, (err, data) => {
              if (err) throw err;
              if (!data.includes("/* script was here */\n\n")) {
                fs.appendFile(item, "/* script was here */\n\n", err => {
                  if (err) throw err;
                  console.log(`The data was appended to ${item}`);
                });
              } else {
                console.log(`${item} already contains that string`);
              }
            });
          });
        }
      });
    });
};

getFiles(
  "/Users/filipploss/Desktop/DevProjects/Node_search/",
  "**/*.js",
  "/.gitignore"
);


