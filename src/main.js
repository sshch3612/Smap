

// import { Scene } from "@antv/l7";
// import { Mapbox } from "@antv/l7-maps";


import { initMixin } from "./init";
import  initTurf  from "./util";

function Smap(options) {

	this._init(options)
}

//初始化加载
initMixin(Smap);
//地图交互
//测绘

//工具函数
initTurf(Smap);
export default Smap;
