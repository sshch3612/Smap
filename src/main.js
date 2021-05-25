

// import { Scene } from "@antv/l7";
// import { Mapbox } from "@antv/l7-maps";
import * as  layerGrounp from "./layergroups";

import { initMixin } from "./init";
import initGlobalApi from "./initGlobalApi";
import * as mapUtil from "./util";

function Map(options) {

	this._init(options)
}

//初始化加载
initMixin(Map);
//地图交互
//测绘

//工具函数
initGlobalApi(Map);

//图层分组
const exported = {
	Map,
	layerGrounp,
	mapUtil
}

export default exported;

