#!/usr/bin/env node
import yargs from "yargs";
import { execSync } from "child_process";
import Path from "path";
import {
  sleep,
  mkdir,
  cpdir,
  loadJson,
  saveJson,
  saveFile,
  Github,
  findGithubAccount,
} from "jnj-lib-base";
import dotenv from "dotenv";
dotenv.config(); // 실행 경로에 있는 `.env`
const templatesPath =
  process.env.ENV_TEMPLATES_PATH ?? "C:/JnJ-soft/Developments/_Templates";

// * cli options
const options = yargs
  .usage("Usage: -u <url> -s <keyword>")
  .option("u", {
    alias: "userName",
    default: "mooninlearn",
    describe: "Name of User",
    type: "string",
    demandOption: true,
  })
  .option("l", {
    alias: "lang",
    default: "node",
    describe: "developemnt language",
    type: "string",
  })
  .option("n", {
    alias: "repoName",
    describe: "NameOfRepository",
    type: "string",
    demandOption: true,
  })
  .option("d", {
    alias: "description",
    describe: "Description For Repository",
    type: "string",
  })
  .option("g", {
    alias: "github",
    default: true,
    describe: "Use Github Repository",
    type: "boolean",
  })
  .option("t", {
    alias: "template",
    default: "none-basic-ts",
    describe: "App Template",
    type: "string",
  }).argv;

// * init github
const initGithub = (options) => {
  const { userName, repoName, lang, description } = options;
  // const github = new Github(userName);
  // github.initRepo({ name: repoName, description });
  const cmd = `github -u ${userName} -e initRepo -n ${repoName} -d "${description}"`;
  execSync(cmd);
  // console.log('initGithub', { name: repoName, description });
};

// * package.json 업데이트
const updatePackageJsonForGithub = (userName, repoName, json) => {
  json = {
    ...json,
    ...{
      repository: {
        type: "git",
        url: `git+https://${userName}@github.com/${userName}/${repoName}.git`,
      },
      bugs: {
        url: `https://github.com/${userName}/${repoName}/issues`,
      },
      homepage: `https://github.com/${userName}/${repoName}#readme`,
    },
  };
  return json;
};

// ** init app
// * Nodejs
const initNode = (options) => {
  const { userName, repoName, description, template, github } = options;
  const { fullName, email } = findGithubAccount(userName);

  // * template 폴더 복사
  const srcDir = Path.join(templatesPath!, `node/${template}`);
  const dstDir = Path.join(process.cwd(), `${repoName}`);

  cpdir(srcDir, dstDir);

  //* package.json 업데이트
  const path = Path.join(process.cwd(), `${repoName}/package.json`);
  let json = loadJson(path);
  json = {
    ...json,
    ...{
      name: repoName,
      version: "0.0.1",
      description: description,
      author: `${fullName} <${email}>`,
    },
  }; // version, description, main, author 업데이트

  // * github
  if (github) {
    updatePackageJsonForGithub(userName, repoName, json);
  }

  // ** package.json 저장
  saveJson(path, json);

  // * npm install
  execSync(`cd ${dstDir} && npm install`);

  // * figma
  // * typescript 인 경우
  const generateRandomCode = (n) => {
    let str = "";
    for (let i = 0; i < n; i++) {
      str += Math.floor(Math.random() * 10);
    }
    return str;
  };

  if (template.includes("-figma-")) {
    const path = Path.join(process.cwd(), `${repoName}/dist/manifest.json`);
    let json = loadJson(path);
    json = {
      ...json,
      ...{
        name: repoName,
        id: `1${generateRandomCode(17)}`,
      },
    };
    saveJson(path, json);
  }
};

// ** main

// * init github
if (options.github) {
  console.log("## init github");
  initGithub(options);
  sleep(1); // TODO: 필요한지 확인
}

// * init app
switch (options.lang.toUpperCase()) {
  case "NODE":
    initNode(options);
    break;
}

// * syntax
// bootapp -l node -u jnjsoftko -n jnj-google-api-ts -d "JnJ Library For Google API" -t bare-basic-ts --no-github
