var fs = require("fs")

// const fileArray = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const fileArray = ["1"];
const result = [];


function readFile(file) {
    const str = require(`./other/${file}.geojson`);
    console.log(str,444);
    const features = str.features;
    for (let i = 0; i < features.length; i++) {
        let feature = features[i];
        let name = feature.properties['name'];
        if (!name) continue;
        let level = feature.properties['level'];
        let a = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: feature.properties["centroid"]
            },
            properties: {
                level,
                name,
                "name:zh": name,
            },
            id: Date.now()
        }
        console.log(feature, a, "features")
        result.push(a);
    }
}
// const str = require("./B.json");

for (let item of fileArray) {
    readFile(item);
}







let last = {
    "type": "FeatureCollection",
    "features": result
}
console.log(JSON.stringify(last), 44);

fs.writeFileSync("C_c.json", JSON.stringify(last));