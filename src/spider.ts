#!/usr/bin/env node
import yargs from "yargs";
import { setPath, saveFile, saveJson, loadFile, loadJson } from "jnj-lib-base-ts/builtin.js";
import { querySelector, querySelectorAll, cheerFromStr, getValue, getValueFromStr, getValuesFromStr, dictFromRoot, dictsFromRoots } from "jnj-lib-web-ts/cheer.js";

// * cli options
const options = yargs
  .usage("Usage: -u <url> -s <selector> -t <target>")
  .option("b", { alias: "by", default: "fetch", describe: "Fetch By(fetch|axios|chrome(puppeteer))", type: "string", demandOption: true })  // fetch|axios|chrome(puppeteer)
  .option("u", { alias: "url", default: "https://www.google.com", describe: "Url", type: "string", demandOption: true })
  .option("o", { alias: "out", default: "string", describe: "Output Type[string|arr|dict|dicts]", type: "string" })
  .option("f", { alias: "filePath", default: "", describe: "save file Path", type: "string" })
  .option("r", { alias: "rootSelector", default: "div", describe: "Root Selector", type: "string", demandOption: true })
  .option("s", { alias: "settingsPath", default: "", describe: "settings Json Path", type: "string", demandOption: true })
  // .option("s", { alias: "selector", default: "", describe: "Selector", type: "string", demandOption: true })
  .option("t", { alias: "target", default: "text", describe: "Target: text|texts|innerhtml", type: "string" })
  .option("l", { alias: "login", default: "", describe: "Login", type: "string" })
  .argv;

// & Utils
const getHtml = async (url, options={}) => {
  const response = await fetch(url, options);
  return await response.text();
}

// & Main
// * exec
switch(options.by) {
  case 'fetch':
    const {url, out, filePath, rootSelector, settingsPath, target} = options;
    let settings;
    console.log('settingsPath', settingsPath);
    if (settingsPath) {  // settings
      settings = loadJson(settingsPath);
      console.log('settings', settings);
    }
    const html = await getHtml(url);
    let $root = cheerFromStr(html);
    let value;
    // const $root = cheerFromStr(await getHtml(url));
    if (out == 'string') {
      value = getValueFromStr(html, rootSelector, target);
      console.log(value);
    } else if (out == 'arr') {
      value = getValuesFromStr(html, rootSelector, target);
      console.log(value);
    } else if (out == 'dict') {
      if (rootSelector) {
        $root = querySelector($root, rootSelector);
      }
      value = dictFromRoot($root, settings);
      console.log(value);
    } else if (out == 'dicts') {
      if (rootSelector) {
        $root = querySelectorAll($root, rootSelector);
      }
      value = dictsFromRoots($root, settings);
      console.log(value);
    }

    if (filePath && out == 'string') {
      if (filePath) { // settings
        console.log(saveFile(filePath, value));
      }
    } else if (filePath) {
      if (filePath) {  // settings
        console.log(saveJson(filePath, value));
      }
    }
    break;
  case 'chrome':
    break;
}


// & EXAMPLE

// C:\JnJ-soft\Developments\Modules\Node\_test\app1> spider -u https://jthcast.dev/posts/2021-04-21-error-report/ -s ./settings/scrap1.json -o dict -f ./scraps/jthcast_dev.json