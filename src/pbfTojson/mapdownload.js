const axios = require('axios');
const fs = require('fs');


const factor = 4;
const limitZoom = 5;// 下载层级控制
const remoteUrl = "http://192.168.0.38:5500/";
const rootDir = "./out";

async function download(inputName, outputName) {
    try {
        const res = await axios({ url: `${remoteUrl}${inputName}.jpg`, responseType: "arraybuffer" });

        const path = await writeFile(rootDir, inputName)
        // fs.writeFileSync(`${path}/${inputName}.jpg`, res.data, 'binary');
        fs.writeFileSync(`${path}.jpg`, res.data, 'binary');
    } catch (e) {

    }
}

async function writeFile(rootDir, inputName) {
    const zDir = inputName.length;
    let filePath = rootDir + "/" + zDir;
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
    };
    let factorx = 0;
    let factory = 0;
    for (let i = 0; i < zDir; i += 1) {
        const str = inputName[i];
        factorx *= 2;
        factory *= 2;
        if (str == "0" || str == "1") {

        }
        if (str == "2" || str == "3") {
            factorx += 1;
        }

        if (str == "0" || str == "2") {

        }
        if (str == "1" || str == "3") {
            factory += 1;
        }
    }
    const xDir = factorx;
    filePath = filePath + "/" + xDir;
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
    };
    const yDir = factory;
    filePath = filePath + "/" + yDir;
    return filePath;
}

async function main() {
    const queue = ["0", "1", "2", "3"];
    while (queue.length) {
        const p = queue.shift();
        if (p.length < limitZoom) {
            for (let i = 0; i < 4; i += 1) {
                queue.push(p + i);
            }
        }
        await download(p)
    }
}

main();