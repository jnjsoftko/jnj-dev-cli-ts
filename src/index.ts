#!/usr/bin/env node
import { ping } from "jnj-lib-base-ts/basic.js";
import { ENV } from "jnj-lib-base-ts/env.js";

console.log(ping());
console.log('jnj-dev-cli-ts', ENV.SETTINGS_PATH);