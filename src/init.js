export const initMixin = (Smap) => {
    Smap.prototype._init = function (options, mapType, mapSource) {
        const vm = this;

        vm.initOptions = options;
        /** 缓存地图注册的事件，避免注册多个事件 */
        // this.storageEvent = [];
        // /** 文本是否标注*/
        // this.istextMark = false;
        /** 地图底图类型集锦*/
        vm.mapType = mapType;
        vm.sources = mapSource;

        // initLoadMap(vm, options);
    }
}

// export function initLoadMap(vm, options) {
//     const { id, layerNames, center, zoom, minZoom, maxZoom } = options;
//     const layers = [];
//     const sources = this.sources;

//     Object.keys(this.sources).forEach(key => {
//         const layer = {
//             id: key,
//             type: 'raster',
//             source: key,
//             layout: {
//                 visibility: 'none',
//             },
//         };
//         if (layerNames.includes(key)) {
//             layer.layout.visibility = 'visible';
//         }
//         layers.push(layer);
//     });
//     const scene = new Scene({
//         id,
//         map: new Mapbox({
//             // style: "http://192.168.1.87:8082/map/deyang/dysl/tileSet/style.json",
//             style: {
//                 version: 8,
//                 sprite: "http://10.176.143.28:8082/msyx/picture/sprite@2x",
//                 glyphs: "http://10.176.143.28:8082/msyx/font/{fontstack}/{range}.pbf",
//                 sources: sources,
//                 layers
//             },
//             minZoom: minZoom,
//             maxZoom: maxZoom,
//             center,
//             zoom,
//         })
//     });
//     vm.smap = scene.map;
// }
