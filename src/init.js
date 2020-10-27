import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { interaction } from './interaction';
import iconsource from "./iconsource";
import initEvent from "./event";

mapboxgl.accessToken = 'pk.eyJ1Ijoic3NoY2giLCJhIjoiY2s4ZTQ1MmR3MGdjODNucDdxa3N5cTFsMSJ9.Nsv26T0aTiOeB-oMj0oPGA';
export const initMixin = (Smap) => {
    Smap.prototype._init = function (options = {
        id, center, zoom, minZoom, maxZoom
    }, mapType, mapSource) {
        const vm = this;

        vm.initOptions = options;
        /** 缓存地图注册的事件，避免注册多个事件 */
        // this.storageEvent = [];
        // /** 文本是否标注*/
        // this.istextMark = false;
        /** 地图底图类型集锦*/
        vm.mapType = mapType;
        vm.sources = mapSource;
        vm.smap = baiduMap(options);
    };

    interaction(Smap);
    iconsource(Smap);  
    initEvent(Smap);
}

export function initLoadMap(options) {
    const { id, layerNames, center, zoom, minZoom, maxZoom } = options;
    // const layers = [];
    // const sources = this.sources;

    // Object.keys(this.sources).forEach(key => {
    //     const layer = {
    //         id: key,
    //         type: 'raster',
    //         source: key,
    //         layout: {
    //             visibility: 'none',
    //         },
    //     };
    //     if (layerNames.includes(key)) {
    //         layer.layout.visibility = 'visible';
    //     }
    //     layers.push(layer);
    // });
    // const scene = new Scene({
    //     id,
    //     map: new Mapbox({
    //         // style: "http://192.168.1.87:8082/map/deyang/dysl/tileSet/style.json",
    //         style: {
    //             version: 8,
    //             sprite: "http://10.176.143.28:8082/msyx/picture/sprite@2x",
    //             glyphs: "http://10.176.143.28:8082/msyx/font/{fontstack}/{range}.pbf",
    //             sources: sources,
    //             layers
    //         },
    //         minZoom: minZoom,
    //         maxZoom: maxZoom,
    //         center,
    //         zoom,
    //     })
    // });
    // vm.smap = scene.map;
    return new mapboxgl.Map({
        container: id || "map",
        style: 'mapbox://styles/mapbox/streets-v9'
    })
}

const baiduMap = (options) => {
    const { id, layerNames, center, zoom, minZoom, maxZoom } = options;
    return new mapboxgl.Map({
        container: id || "map",
        zoom: 9,
        center: [103.64300272883702, 29.885843850603877],
        style: {
            version: 8,
            sources: {
                "base": {
                    type: "raster",
                    tiles: [
                        // "http://api.map.baidu.com/customimage/tile?x={x}&y={y}&z={z}&customid=midnight"
                        "https://maponline0.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20201020&from=jsapi2_0"
                    ],
                    tileSize: 256,
                },
            },
            layers: [
                {
                    id: "base",
                    type: 'raster',
                    source: "base",
                }
            ]
        }
    })
}

const gaodeMap = (options) => {
    const { id, layerNames, center, zoom, minZoom, maxZoom } = options;
    return new mapboxgl.Map({
        container: id || "map",
        zoom: 9,
        center: [103.64300272883702, 29.885843850603877],
        style: {
            version: 8,
            sources: {
                "base": {
                    type: "raster",
                    tiles: [
                        // wprd0{1-4} 
                        // scl=1&style=7 为矢量图（含路网和注记）
                        // scl=2&style=7 为矢量图（含路网但不含注记）
                        // scl=1&style=6 为影像底图（不含路网，不含注记）
                        // scl=2&style=6 为影像底图（不含路网、不含注记）
                        // scl=1&style=8 为影像路图（含路网，含注记）
                        // scl=2&style=8 为影像路网（含路网，不含注记）
                        "http://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8"],
                    tileSize: 256,
                },
            },
            layers: [
                {
                    id: "base",
                    type: 'raster',
                    source: "base",
                }
            ]
        }
    })
}

const googleMap = (options) => {
    const { id, layerNames, center, zoom, minZoom, maxZoom } = options;
    return new mapboxgl.Map({
        container: id || "map",
        zoom: 9,
        center: [103.64300272883702, 29.885843850603877],
        style: {
            version: 8,
            sources: {
                "base": {
                    type: "raster",
                    tiles: [
                        // mt(0—3) Google地图使用了四个服务地址
                        // lyrs=
                        // m：路线图
                        // t：地形图
                        // p：带标签的地形图
                        // s：卫星图
                        // y：带标签的卫星图
                        // h：标签层（路名、地名等）
                        "https://mt1.google.cn/maps/vt?lyrs=h%40721&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}"
                    ],
                    tileSize: 256,
                },
            },
            layers: [
                {
                    id: "base",
                    type: 'raster',
                    source: "base",
                }
            ]
        }
    })
}
