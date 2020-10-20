
import mapboxgl from "mapbox-gl";
import { Scene } from "@antv/l7";
import { Mapbox } from "@antv/l7-maps";
import 'mapbox-gl/dist/mapbox-gl.css';

import { initMixin } from "./init";

function Smap(options) {

	this._init(options)
}

//初始化加载
initMixin(Smap);
//地图交互
//测绘
