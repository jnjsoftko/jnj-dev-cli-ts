#!/usr/bin/env node
import { Github } from "jnj-lib-base";
import yargs from "yargs";

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
  .option("e", {
    alias: "exec",
    default: "createRepo",
    describe: "exec command createRepo/inintRepo(create+clone+config)/copyRepo(clone+config)/deleteRepo",
    type: "string",
    demandOption: true,
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
  }).argv;

// * github instance
const github = new Github(options.userName);

// * exec
switch (options.exec) {
  case "initRepo":
    github.initRepo({
      name: options.repoName,
      description: options.description,
    });
    break;
  case "createRepo":
    github.createRepo({
      name: options.repoName,
      description: options.description,
    });
    break;
  case "copyRepo":
    github.copyRepo({
      name: options.repoName,
      description: options.description,
    });
    break;
  case "emptyRepo":
    github.createRepo({
      name: options.repoName,
      description: options.description,
      auto_init: false,
      gitignore_template: null,
      license_template: null,
    });

    break;
  case "pushRepo": // only push
    console.log("name: ", options.repoName);
    github.pushRepo({
      name: options.repoName,
      description: options.description,
    });
    break;
  case "deleteRepo":
    github.deleteRepo({ owner: options.userName, repo: options.repoName });
    break;
}

// github -u mooninlearn -n udemy-test -e pushRepo -d "test pushRepo"
