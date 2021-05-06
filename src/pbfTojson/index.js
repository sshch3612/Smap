var vtpbf = require('vt-pbf')
var VectorTile = require('vector-tile').VectorTile
var fs = require("fs")
var Pbf = require("pbf")

var data = fs.readFileSync(__dirname + '/test.pbf')
var tile = new VectorTile(new Pbf(data))
console.log(tile,444);
var orig = tile.layers['dydw'].feature(0).toGeoJSON(0, 0, 1)

console.log(tile, 555, orig);
// var buff = vtpbf(tile)
// fs.writeFileSync('my-tile.pbf', buff)

fs.writeFileSync("my-test.json", JSON.stringify(orig));