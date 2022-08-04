var fs = require("fs")

// const fileArray = ["A", "B"];
const result = [];

const basePath = './geo'
const path = require('path')
const errorPath = [];


let dirArray = [basePath]
let fileArray = [];


function mapDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((filename, index) => {
    let pathname = path.join(dir, filename);
    const fileInfo = fs.statSync(pathname);
    if (fileInfo.isDirectory()) {
      dirArray.push(pathname);
    }
    if (fileInfo.isFile()) {
      fileArray.push(pathname);
    }
  })
}
function readFile(file) {
  try {
    const str = require(`./${file}`);
    const features = str.features;
    for (let i = 0; i < features.length; i++) {
      let feature = features[i];
      let name = feature.properties['name'];
      let cd = feature.properties["centroid"] || feature.properties["center"]
      if (!name) continue;
      if (!cd) continue;
      let level = feature.properties['level'];

      let a = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: cd
        },
        properties: {
          level,
          name,
          "name:zh": name,
        },
        id: Date.now()
      }
      result.push(a);
    }
  } catch (error) {
    errorPath.push(file)
  }
}

function main() {
  while (dirArray.length) {
    mapDir(dirArray.pop())
  }
  for (let item of fileArray) {
    readFile(item);
  }
  // console.log(item, 1114444);
  let last = {
    "type": "FeatureCollection",
    "features": result
  }
  console.log(JSON.stringify(last), 44);

  fs.writeFileSync("C_b.json", JSON.stringify(last));
  fs.writeFileSync("errorFile.json", JSON.stringify(errorPath));
  console.log(JSON.stringify(errorPath), "jieshu")
}

main()








