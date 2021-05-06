

// import { Scene } from "@antv/l7";
// import { Mapbox } from "@antv/l7-maps";


import { initMixin } from "./init";
import initGlobalApi from "./initGlobalApi";

function Smap(options) {

	this._init(options)
}

//初始化加载
initMixin(Smap);
//地图交互
//测绘

//工具函数
initGlobalApi(Smap);

//图层分组
export default Smap;
