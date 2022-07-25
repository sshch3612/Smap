import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { interaction } from './interaction';
import iconsource from "./iconsource";
import initEvent from "./event";

// mapboxgl.accessToken = 'pk.eyJ1Ijoic3NoY2giLCJhIjoiY2s4ZTQ1MmR3MGdjODNucDdxa3N5cTFsMSJ9.Nsv26T0aTiOeB-oMj0oPGA';
export const initMixin = (Smap) => {
    Smap.prototype._init = function (options = {
        id, center, zoom, minZoom, maxZoom, sources, layers, style
    }) {
        const vm = this;

        vm.initOptions = options;
        vm.planColor = "#ccc000";
        vm.planLinewidth = 2
        /** 缓存地图注册的事件，避免注册多个事件 */
        // this.storageEvent = [];
        // /** 文本是否标注*/
        // this.istextMark = false;
        /** 地图底图类型集锦*/
        vm.smap = gaodeMap(options);
    };

    interaction(Smap);
    iconsource(Smap);
    initEvent(Smap);
}

export function initLoadMap(options) {
    const { id, center, zoom, minZoom, maxZoom, sources, layers, style, ...restOptions } = options;

    const mapstyle = style || { version: 8, sources, layers }
    return new mapboxgl.Map({
        container: id || "map",
        zoom: zoom || 9,
        center: center || [103.64300272883702, 29.885843850603877],
        minZoom: minZoom || 0,
        maxZoom: maxZoom || 22,
        style: mapstyle,
        ...restOptions
    })
}

const baiduMap = (options) => {
    const { id, center, zoom, minZoom, maxZoom, sources, layers, style } = options;
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
        zoom: 15,
        center: [104.20474088683795,
            30.702932860449977],
        // style:require("./assets/style.json"),
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
                        "http://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7"],
                    tileSize: 256,
                },
                "dydw": {
                    type: "vector",
                    tiles: [
                        "http://182.150.58.166:18082/map/deyang/dw/{z}/{x}/{y}.pbf"
                    ],
                    tileSize: 512
                },
                "test": {
                    type: "geojson",
                    data: require("./test.json")
                }
            },
            sprite: "http://127.0.0.1:5501/src/assets/sprite",
            layers: [
                {
                    id: "base",
                    type: 'raster',
                    source: "base",
                },
                // {
                //     id: "testdw1",
                //     type: "line",
                //     source: "dydw",
                //     "source-layer": "dw",
                //     minzoom: 8,
                //     maxzoom: 22,
                //     filter: [
                //         "match",
                //         [
                //             "geometry-type"
                //         ],
                //         [
                //             "LineString"
                //         ],
                //         true,
                //         false
                //     ],
                //     paint: {
                //         "line-color": "red",
                //         "line-width": 2,
                //         "line-opacity": 0.4,
                //     },
                //     layout: {
                //         "line-cap": "butt",
                //         "line-join": "round",
                //     }
                // },
                // {
                //     id: "test",
                //     type: "line",
                //     source: "test",
                //     paint: {
                //         "line-color": "red",
                //         "line-width": 4,
                //     },
                //     layout:{
                //         "line-sort-key":3
                //     }
                // },
                // {
                //     id: "test1",
                //     type: "line",
                //     source: "test",
                //     paint: {
                //         "line-color": "blue",
                //         "line-width": 4,
                //     },
                //     layout:{
                //         "line-sort-key":6
                //     }
                // }
                // {
                //     id: "testdw",
                //     type: "line",
                //     source: "dydw",
                //     // "source-layer": "dw",
                //     minzoom: 8,
                //     maxzoom: 22,
                //     filter: [
                //         "match",
                //         [
                //             "geometry-type"
                //         ],
                //         [
                //             "LineString"
                //         ],
                //         true,
                //         false
                //     ],
                //     paint: {
                //         'line-pattern': `test`,
                //         "line-color": "red",
                //         "line-width": 2,
                //         // "line-dasharray":[2, 2],
                //         "line-dasharray-transition": {
                //             "duration": 100,
                //             "delay": 0
                //         },
                //     },
                //     layout: {
                //         "line-cap": "butt",
                //         "line-join": "round",
                //     }
                // }
                // {
                //     id: "testdw",
                //     type: "symbol",
                //     source: "dydw",
                //     "source-layer": "dydw",
                //     minzoom: 0,
                //     maxzoom: 22,
                //     onAdd(a) {
                //         console.log(a, "helloworld")
                //     },
                //     filter: [
                //         "match",
                //         [
                //             "geometry-type"
                //         ],
                //         [
                //             "Point"
                //         ],
                //         true,
                //         false
                //     ],

                //     playout: {
                //         "icon-allow-overlap": true,
                //         "icon-image": "facebook",
                //         "icon-size": [
                //             "interpolate",
                //             ["linear"], ["zoom"],
                //             9, 1,
                //             14, 1
                //         ],
                //     }
                // }
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
