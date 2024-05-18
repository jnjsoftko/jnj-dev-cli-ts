#!/usr/bin/env node
// & IMPORT
//&============================================================================
import yargs from "yargs";
import { execSync } from "child_process";
import Path from "path";
import { sleep, mkdir, cpdir, loadJson, saveJson, loadFile, saveFile, Github, findGithubAccount } from "jnj-lib-base";
import { loadIni, saveIni } from "jnj-lib-doc";
import dotenv from "dotenv";

// & CONSTS / VARIABLES
//&============================================================================

dotenv.config(); // 실행 경로에 있는 `.env`
const templatesPath = process.env.ENV_TEMPLATES_PATH ?? "C:/JnJ-soft/Developments/_Templates";

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
    // - lang: language(node|python|go|flutter|)
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

// & FUNCTIONS
//&============================================================================
/**
 * Init github
 * @param options
 *  - userName: github user name
 *  - repoName: repository name
 *  - description: project(repository) description
 *
 * @example
 * initGithub({userName: '', repoName: ''})
 */
const initGithub = (options) => {
  const { userName, repoName, description } = options;
  const cmd = `github -u ${userName} -e initRepo -n ${repoName} -d "${description}"`;
  execSync(cmd);
};

/**
 * Upadte package.json
 * @param userName: github user name
 * @param repoName: repository name
 * @param json: loadJson(`package.json`)
 *
 * @example
 * updatePackageJsonForGithub(userName: '', repoName: '', json: loadJson(`package.json`))
 */
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

/**
 * Init Nodejs
 * @param options
 *  - userName: github user name
 *  - repoName: repository name
 *  - description: project(repository) description
 *
 * @example
 * initGithub({userName: '', repoName: ''})
 */
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
  execSync(`cd "${dstDir}" && npm install`);

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

/**
 * Init Python
 * @param options
 *  - userName: github user name
 *  - repoName: repository name
 *  - description: project(repository) description
 *
 * @example
 * initGithub({userName: '', repoName: ''})
 */
const initPython = (options) => {
  const { userName, repoName, description, template, github } = options;
  const { fullName, email } = findGithubAccount(userName);

  // * template 폴더 복사
  const srcDir = Path.join(templatesPath!, `python/${template}`);
  const dstDir = Path.join(process.cwd(), `${repoName}`);

  cpdir(srcDir, dstDir);

  //* setup.cfg 업데이트
  const path = Path.join(process.cwd(), `${repoName}/setup.cfg`);
  const data = { name: repoName, description: description, author: `${fullName} <${email}>` };

  const replacements = { " ": "_0_", "<": "_1_", ">": "_2_" }; // ? Error 유발 문자 치환

  let _datas = [];
  for (let [key, val] of Object.entries(data)) {
    // * 치환(제한 문자 Error)
    for (let [k, v] of Object.entries(replacements)) {
      val = val.replaceAll(k, v);
    }
    _datas.push(`'${key}':'${val}'`);
  }
  const _data = "{" + _datas.join(",") + "}";
  // console.log(_data);
  execSync(`config.exe -a update_cfg -s ${path} -D ${_data}`);

  // 역치환
  // let str = fs.readFileSync(path, { encoding: "utf-8" });
  let str = loadFile(path);
  // console.log(str);
  for (let [k, v] of Object.entries(replacements)) {
    str = str.replaceAll(v, k);
  }
  saveFile(path, str);
  // fs.writeFileSync(path, str, "utf-8");
};

// & MAIN
//&============================================================================

// ** Init app
//-----------------------------------------------------------------------------
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
  case "PYTHON":
    initPython(options);
    break;
}

// * syntax
// bootapp -l node -u jnjsoftko -n jnj-google-api-ts -d "JnJ Library For Google API" -t bare-basic-ts --no-github
