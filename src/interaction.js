import mapboxgl from "mapbox-gl";
import { lineString } from "@turf/helpers";
import length from "@turf/length";

const Marker = mapboxgl.Marker;
const Popup = mapboxgl.Popup;


export const interaction = (Smap) => {
    /**
   *飞到指定位置
   * @param {*} {lon,lat} 经纬度
   * @param {*} zoom  地图层级
   * @returns
   */
    Smap.prototype.flyToLocation = function ({ lng, lat }, zoom = 16, option = {
        bearing: 0,
        pitch: 0,
    }) {
        const { bearing, pitch } = option;
        this.smap.flyTo({
            center: [lng, lat],
            zoom,
            speed: 1.2,
            curve: 1,
            easing(t) {
                return t;
            },
            bearing,
            pitch,
        });
    }

    /**
     *回到默认位置
    * @returns
    */
    Smap.prototype.flyTodef = function () {
        const { center, zoom } = this.initOptions;
        this.smap.flyTo({
            center,
            zoom,
            speed: 3,
            curve: 1,
            easing(t) {
                return t;
            },
            bearing: 0,
            pitch: 0,
        })
    }

    /**
     * 选取坐标
     * 
    */
    Smap.prototype.takeCoordinates = function (callback) {
        const makePoint = (e) => {
            const { lng, lat } = e.lngLat;
            const pointCoordinate = [lng, lat];
            if (callback) callback(pointCoordinate)
        }
        this.smap.once('click', makePoint);
    }
    /**
     * 单张图片加载
     * @param {*} id 
     * @param {*} url 
    */
    Smap.prototype.loadOneImage = function (id, url) {
        this.smap.loadImage(url, (error, image) => {
            if (error) return;
            if (!this.smap.hasImage(id)) this.smap.addImage(id, image);
        });
    }
    /**
     * 批量加载图标
     * imageList = [{id:"",url:""},{}]
    */
    Smap.prototype.loadMoreImage = function (imageList) {
        if (!Array.isArray(imageList)) throw "imageList is not Array!";
        imageList.map(({ id, url }) => {
            this.loadOneImage(id, url);
        })
    }

    /**
     * 添加点图层
     * 
    */
    Smap.prototype.addPointLayer = function (option = { id, image, minZoom, maxZoom, data }, callback) {
        const { id, image, minZoom, maxZoom, data } = option;
        const source = this.smap.getSource(id);
        const geojson = {
            "type": "FeatureCollection",
            "features": []
        };
        if (source) {
            source.setData(data);
            return;
        }

        const sourceData = {
            type: "geojson",
            data: data || geojson
        }
        this.smap.addSource(id, sourceData);
        const param = {
            id: id,
            type: "symbol",
            source: id,
            paint: {
                "text-color": "#117170",
            },
            minzoom: minZoom || 0,
            maxZoom: maxZoom || 22,
            layout: {
                "icon-allow-overlap": true,
                "icon-image": image,
                "icon-size": [
                    "interpolate",
                    ["linear"], ["zoom"],
                    9, 1,
                    14, 1
                ],
            }
        };
        this.smap.addLayer(param);
        if (callback) {
            callback(this.smap, id);
        } else {
            //默认交互
            this.smap.on("click", id, e => {
                const feature = e.features[0];
                new Popup({ closeButton: false }).setLngLat(feature.geometry.coordinates)
                    .setText(`${feature.properties.name}`)
                    .addTo(map);
            });
        }
    }
    /** 
     * 添加线图层
    */
    Smap.prototype.addLineLayer = function ({ id, style = {}, animation = "none",
        minZoom = 9, maxZoom = 22, dataSource = {
            "type": "FeatureCollection",
            "features": []
        } } = {}, callback) {
        const styleOption = Object.assign({}, style, {
            color: "#ccc000",
            width: 3,
            dashed: false,
            dasharray: [2, 2]
        });
        const { color, width, dashed, dasharray } = styleOption;
        const source = this.smap.getSource(id);
        if (source) {
            source.setData(dataSource);
            return;
        }

        const sourceData = {
            type: "geojson",
            data: dataSource
        }
        this.smap.addSource(id, sourceData);
        const param = {
            id: id,
            type: "line",
            source: id,
            minzoom: minZoom,
            maxZoom: maxZoom,
            paint: {
                "line-color": color,
                "line-width": width,
                "line-opacity": 0.5,
            },
            layout: {
                "line-cap": "butt",
                "line-join": "round",
            }
        };
        this.smap.addLayer(param);
        // if (animate) {
        //     let step = 0;
        //     let progress = 0;
        //     const dashArraySeq = [
        //         [0, 4, 3],
        //         [1, 4, 2],
        //         [2, 4, 1],
        //         [3, 4, 0],
        //         [0, 0, 4, 3],
        //         [0, 1, 4, 2],
        //         [0, 2, 4, 1],
        //         [0, 3, 4, 0]
        //     ];
        //     const interval = () => {
        //         try {
        //             progress += 1;
        //             if (progress % 3 === 1) {
        //                 if (!this.smap || !this.smap.setPaintProperty) return;
        //                 step = (step + 1) % dashArraySeq.length;
        //                 this.smap.setPaintProperty(param.id, "line-dasharray", dashArraySeq[step]);
        //             }
        //             window.requestAnimationFrame(interval);
        //         } catch (error) { }

        //     };
        //     interval();
        // }
        if (callback) {
            callback({ mapobj: this.smap, id });
        }
        // else {
        //     //默认交互
        //     this.smap.on("click", id, e => {
        //         const feature = e.features[0];
        //         new mapboxgl.Popup({ closeButton: false }).setLngLat(feature.geometry.coordinates)
        //             .setText(`${feature.properties.name}`)
        //             .addTo(map);
        //     });
        // }
    }
    /**
     * 移除单一图层
     * @param {string} id
     */
    Smap.prototype.removeLayer = function (id) {

        const source = this.smap.getSource(id);
        const layer = this.smap.getLayer(id);
        if (source) this.smap.removeSource(id);
        if (layer) this.smap.removeLayer(id);
    }
    /**
     * 移除一组图层
     * @param {Array} ids
     */
    Smap.prototype.removeLayers = function (ids) {
        if (!Array.isArray(ids)) throw "param is not Array！";
        ids.map((id) => {
            this.removeLayer(id);
        })
    }
    /**
     *
     *
     * @param {*} [{ color = '#FFFFFF',
     *         width = 3,
     *         borderWidth = 3,
     *         borderColor = '#FF0000' }={}]
     * @returns
     */
    Smap.prototype.createPointElement = function ({ color = '#FFFFFF',
        width = 3,
        borderWidth = 3,
        borderColor = '#FF0000' } = {}) {

        const Element = document.createElement('i'); //marke 创建圆
        Element.className = 'map-create-point';
        Element.style.backgroundColor = color;
        Element.style.borderWidth = `${borderWidth}px`;
        Element.style.borderColor = borderColor;
        Element.style.borderStyle = 'solid';
        Element.style.borderRadius = "50%";
        Element.style.width = `${width * 3}px`;
        Element.style.height = `${width * 3}px`;
        return Element;
    }
    /**
     * 测距
     * 1、收集点数据
     * 2、画线、画点、标注操作
     * 3、事件处理
     * 4、增加周期事件 开始绘制、结束绘制、全部删除、
     */
    Smap.prototype.ranging = function ({ onStart = function () { }, onEnd = function () { } } = {}, onDelete = function () { }, onRevoke = function () { }) {



        const exposed = {};
        const pointCollectInstance = new PointCollect();
        const markerCollectInstance = new MarkerCollect();
        const markerTextCollectInstance = new MarkerCollect();

        exposed.data = pointCollectInstance.collectionPoints;
        // 初始化鼠标移动的点
        let movePoint = null;

        const uuid = String(Date.now());
        const lineId = `${uuid}-line`;
        const delaytime = 200;
        let isEventFirst = true;
        let ismouseMove = true;
        let currentTime = null;
        let clickTimeouter = null;

        const collectionPoints = {};


        // 渲染线条
        const renderLine = (data) => {
            const lineFeature = pointCollectInstance.pointsToLinefeature(data);
            this.addLineLayer({ id: lineId, dataSource: lineFeature });
        };

        // 1.先注册点击事件
        const handleClick = (e) => {
            if (currentTime) {
                const current = Date.now();
                console.log(current - currentTime, 45555666);
                if (Number(current - currentTime) < delaytime) {
                    currentTime = Date.now();
                    clearTimeout(clickTimeouter);
                    // 执行双击事件
                    handlecomplete(e);
                    return;
                }
            }
            currentTime = Date.now();

            clickTimeouter = setTimeout(() => {
                const { lng, lat } = e.lngLat;
                pointCollectInstance.collectPush([lng, lat]);
                markerCollectInstance.collectPush({ lnglat: [lng, lat], element: MarkerCollect.createPointElement(), target: this.smap });

                const len = pointCollectInstance.computeLength();
                const txt = len ? `${Math.round(len * 100) / 100}km` : "起点";
                markerTextCollectInstance.collectPush({ offset: [0, -24], lnglat: [lng, lat], element: MarkerCollect.createMarkerElement({ text: txt }), target: this.smap });
                renderLine(pointCollectInstance.collectionPoints);
                if (isEventFirst) {
                    isEventFirst = false;
                    this.smap.on("mousemove", handleMove);
                    this.smap.on("contextmenu", handleRightClick);
                }
            }, delaytime);
        }


        const handleRightClick = (e) => {

            pointCollectInstance.colllectPop();
            markerCollectInstance.colllectPop();
            markerTextCollectInstance.colllectPop();
            const { lng, lat } = e.lngLat;
            const movepoint = [lng, lat];
            renderLine([...pointCollectInstance.collectionPoints, movepoint]);
            // 撤销上一步
            onRevoke(exposed);
        }

        const handleMove = (e) => {
            if (ismouseMove) {
                ismouseMove = false;
                setTimeout(() => {
                    const { lng, lat } = e.lngLat;
                    const movepoint = [lng, lat];
                    renderLine([...pointCollectInstance.collectionPoints, movepoint]);
                    ismouseMove = true;
                }, 50);
            }

        }

        const deleteAll = () => {
            this.smap.removeLayer(`${uuid}-line`);
            markerCollectInstance.Empty();
            markerTextCollectInstance.Empty();
            // 删除回调
            onDelete(exposed);
        }

        const handlecomplete = (e) => {
            cancelAllevent();
            const { lng, lat } = e.lngLat;
            const movepoint = [lng, lat];
            pointCollectInstance.collectPush([lng, lat]);
            markerCollectInstance.collectPush({ lnglat: [lng, lat], element: MarkerCollect.createPointElement(), target: this.smap });

            const len = pointCollectInstance.computeLength();
            const txt = len ? `${Math.round(len * 100) / 100}km` : "起点";
            markerTextCollectInstance.collectPush({ offset: [0, -24], lnglat: [lng, lat], element: MarkerCollect.createMarkerElement({ text: txt, icon: require('./assets/destroy.png'), iconClick: deleteAll }), target: this.smap });
            renderLine(pointCollectInstance.collectionPoints);
            // 结束时回调
            onEnd(exposed);
        }
        const cancelAllevent = () => {
            this.smap.off("click", handleClick);
            this.smap.off("mousemove", handleMove);
            this.smap.off("contextmenu", handleRightClick);
        }


        this.smap.on('click', handleClick);
        // 绘制开始回调
        exposed.event = { type: "click", fn: handleClick };
        onStart(exposed);
    }

}

function PointCollect() {
    // 初始化点集合
    this.collectionPoints = new Array();
    this.length = 0;
}
PointCollect.prototype.collectPush = function (data) {
    this.length += 1;
    this.collectionPoints.push(data);
    console.log(this.collectionPoints, 98766234);
};
PointCollect.prototype.collectDeleteOne = function (index) {
    this.collectionPoints.splice(index, 1);
    this.length -= 1;
}
PointCollect.prototype.colllectPop = function () {
    if (this.collectionPoints.pop()) {
        this.length -= 1;
    }
}
PointCollect.prototype.pointsToLinefeature = function (data) {
    if (!Array.isArray(data)) return;
    let lineFeature = {
        "type": "FeatureCollection",
        "features": []
    };
    if (data.length >= 2) {
        lineFeature = lineString(data);
    }
    return lineFeature;
}
// 计算长度
PointCollect.prototype.computeLength = function ({ units = "kilometers" } = {}) {
    if (this.length <= 1) {
        console.error("坐标数据...");
        return;
    }
    const lineFeature = lineString(this.collectionPoints);
    const len = length(lineFeature, { units });
    return len;

}
// 计算面积
PointCollect.prototype.computeArea = function () {

}



PointCollect.prototype.pointsToMarkers = function (pointerElement, target) {
    this.collectionPoints.map((point) => {
        const marker = new Marker({
            element: pointerElement,
            offset: [0, 0]
        }).setLngLat(point)
            .setDraggable(false)
            .addTo(target);
    })
}

function MarkerCollect() {
    this.collectionMarkers = new Array();
    this.length = 0;
}

/**
 * @param {*} [{ color = '#FFFFFF',
 *         width = 3,
 *         borderWidth = 3,
 *         borderColor = '#FF0000' }={}]
 * @returns Element
 */
MarkerCollect.createPointElement = function ({ color = '#FFFFFF',
    width = 3,
    borderWidth = 3,
    borderColor = '#FF0000' } = {}) {

    const Element = document.createElement('i'); //marke 创建圆
    Element.className = 'map-create-point';
    Element.style.backgroundColor = color;
    Element.style.borderWidth = `${borderWidth}px`;
    Element.style.borderColor = borderColor;
    Element.style.borderStyle = 'solid';
    Element.style.borderRadius = "50%";
    Element.style.width = `${width * 3}px`;
    Element.style.height = `${width * 3}px`;
    return Element;
}
/**
 * 创建距离、面积标注
 * @param {*} [{ text = "起点", icon = null, iconClick }={}]
 * @returns
 */
MarkerCollect.createMarkerElement = function ({ text = "起点", icon = null, iconClick } = {}) {

    const Element = document.createElement('div');
    Element.style = "display:inline-block; padding:4px 8px;white-space:nowrap;opacity:.8;background-color:#ffcc33; border-radius: 4px;color: #000;";
    Element.textContent = text;

    console.log(icon, 444555);
    if (icon) {
        const destroyImgElement = document.createElement('img');
        destroyImgElement.src = icon;
        destroyImgElement.onclick = () => {
            iconClick && iconClick();
        };
        Element.appendChild(destroyImgElement);
    }
    return Element;
}

MarkerCollect.prototype.collectPush = function ({ lnglat, element, offset = [0, 0], target } = {}) {
    const marker = new Marker({
        element: element,
        offset: offset
    }).setLngLat(lnglat)
        .setDraggable(false)
        .addTo(target);
    this.collectionMarkers.push(marker);
    this.length += 1;
}

MarkerCollect.prototype.colllectPop = function () {
    const marker = this.collectionMarkers.pop();
    if (marker) {
        marker.remove();
        this.length -= 1;
    }
}

MarkerCollect.prototype.Empty = function () {
    while (this.length) {
        const marker = this.collectionMarkers.pop();
        if (marker) {
            marker.remove();
            this.length -= 1;
        }
    }
}

function TextMarker() {
    this.collection = new Array();
}

// 创建Element元素
TextMarker.prototype.createElement = function ({ text = "起点", icon = null, iconClick } = {}) {
    const Element = document.createElement('label');
    Element.className = 'tooltip tooltip-static';
    Element.textContent = text;

    if (icon) {
        let destroyImgElement = document.createElement('img');
        // destroyImgElement.src = require('@/assets/map/destroy.png');
        destroyImgElement.className = 'tooltip-img';
        destroyImgElement.onclick = () => {
            iconClick && iconClick();
        };
        Element.appendChild(destroyImgElement);
    }
    return Element;

}
// 创建marker
// 根据 生成全部marker



