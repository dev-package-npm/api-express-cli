#!/usr/bin/env node
import Aec from "./bin/aec";

const aec = new Aec();

const main = async () => {
    try {
        aec.interpretInput();
    } catch (error: any) {
        console.log(error.message);
    }
}

main();