import mapboxgl from "mapbox-gl";
import { addLayerToGroup } from "./layergroups";
import { lineString } from "@turf/helpers";
import * as turf from "@turf/turf";
import length from "@turf/length";
import * as rulerCur from "./assets/point.png";

const Marker = mapboxgl.Marker;
const Popup = mapboxgl.Popup;


export const interaction = (Smap) => {


    /**
     * 设置canvas 鼠标样式
     *
     * @param {*} type ruler
     * 鼠标样式  要使用绝对地址
     * 支持 cur  ico格式图片
     *  
     */
    Smap.prototype.setCanvasCursor = function (type, remoteUrl) {
        // TODO 增加鼠标样式集锦
        const canvasStyle = this.smap.getCanvas().style;
        if (type === "custom") {
            canvasStyle.cursor = `url(${remoteUrl}) 12 12,pointer`;
        } else {
            canvasStyle.cursor = type;
        }

        return this;
    }
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
     * exposed
    */
    Smap.prototype.takeCoordinates = function ({ id, image = "dynamic-point", onStart = function () { }, onDoing = function () { }, onDelete = function () { }, onEnd = function () { } } = {}) {

        const _this = this;
        const exposed = {
            mapinstance: _this
        };

        const uuid = String(Date.now());
        const layerId = id || `${uuid}-point`;

        let isFirst = true;

        exposed.data = []
        const makePoint = (e) => {
            const { lng, lat } = e.lngLat;
            const pointCoordinate = [lng, lat];
            const dataPoint = turf.point(pointCoordinate);
            exposed.data = pointCoordinate;
            const sourceId = this.setGeojsonSource(layerId, dataPoint);

            if (sourceId) {
                const layerData = this.setPointLayer({ id: layerId, image, sourceid: sourceId });
                this.addLayer("tool", layerData);
            }
            if (isFirst) {
                isFirst = false;
                onDoing(exposed);
            }
            onEnd(exposed)
        }

        const cancelAllevent = () => {
            this.smap.off("click", makePoint);
        }

        const deleteAll = () => {
            cancelAllevent()
            this.smap.removeLayer(layerId);
            delete exposed.event;
            onDelete(exposed);
        }

        this.smap.on('click', makePoint);
        exposed.event = { type: "click", fn: makePoint }
        exposed.remove = deleteAll;
        onStart(exposed)
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
     * 设置geojson图层数据源
     * @param {*} id
     * @param {*} data
     * @returns  false 
     */
    Smap.prototype.setGeojsonSource = function (id, data) {

        const source = this.smap.getSource(id);
        if (source) {
            source.setData(data);
            return undefined;
        }
        const geojson = {
            "type": "FeatureCollection",
            "features": []
        };
        const sourceData = {
            type: "geojson",
            data: data || geojson
        }
        this.smap.addSource(id, sourceData);
        return id;
    }

    /**
     * 设置点图层
     * 
    */
    Smap.prototype.setPointLayer = function (option = { id, image, minZoom, maxZoom, sourceid }) {
        const { id, image, minZoom, maxZoom, sourceid, data } = option;
        const layerData = {
            id: id,
            type: "symbol",
            source: sourceid,
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
        return layerData;
    }

    /**
     * 设置线图层
     * 
    */
    Smap.prototype.setLineLayer = function ({ sourceid, id, image, flash = false, style = {}, animation = "none",
        minZoom = 9, maxZoom = 22 } = {}) {

        const styleOption = Object.assign({}, style, {
            color: "#ccc000",
            width: 3,
            dashed: false,
            dasharray: [2, 2]
        });
        const { color, width, dashed, dasharray } = styleOption;
        const layerData = {
            id: id,
            type: "line",
            source: sourceId,
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
        if (flash) layerData.paint['line-pattern'] = image
        return layerData
    }

    /**
     * 设置fill图层
     * 
    */
    Smap.prototype.setFillLayer = function ({ sourceId, id, style = {},
        minZoom = 9, maxZoom = 22 } = {}) {

        const styleOption = Object.assign({}, style, {
            backgroundcolor: "#ccc000",
        });
        const { backgroundcolor } = styleOption;
        const layerData = {
            id: id,
            type: "fill",
            source: sourceId,
            minzoom: minZoom,
            maxZoom: maxZoom,
            paint: {
                'fill-color': backgroundcolor,
                'fill-opacity': 0.5,
            },
        };
        return layerData
    }


    Smap.prototype.addLayer = function (groupId, layer, beforeId, callback) {
        if (typeof beforeId !== "string") {
            callback = beforeId;
            beforeId = undefined;
        }
        addLayerToGroup(this.smap, groupId, layer, beforeId);
        if (callback) {
            callback(this.smap, layer.id);
        }
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
            // this.smap.on("click", id, e => {
            //     const feature = e.features[0];
            //     new Popup({ closeButton: false }).setLngLat(feature.geometry.coordinates)
            //         .setText(`${feature.properties.name}`)
            //         .addTo(map);
            // });
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
        if (layer) this.smap.removeLayer(id);
        if (source) this.smap.removeSource(id);

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
    Smap.prototype.ranging = function ({ draggable = false, onStart = function () { }, onDoing = function () { }, onDrag = function () { }, onDragEnd = function () { }, onDelete = function () { }, onRevoke = function () { }, onEnd = function () { } } = {}) {


        const _this = this;
        const exposed = {
            mapinstance: _this
        };
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
            const sourceId = this.setGeojsonSource(lineId, lineFeature);
            if (sourceId) {
                const layerData = this.setLineLayer({ id: lineId, sourceid: sourceId });
                this.addLayer("tool", layerData);
            }
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
                    onDoing(exposed);
                    this.smap.on("mousemove", handleMove);
                    this.smap.on("contextmenu", handleRightClick);
                }
            }, delaytime);
        }


        const handleRightClick = (e) => {

            if (pointCollectInstance.collectionPoints.length <= 1) {
                // 撤销到第一步，就是删除
                deleteAll();
                cancelAllevent();
                onEnd(exposed);
                return;
            }
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

            if (draggable) {
                handleMarkerEvent();
            }
        }
        const cancelAllevent = () => {
            this.smap.off("click", handleClick);
            this.smap.off("mousemove", handleMove);
            this.smap.off("contextmenu", handleRightClick);
        }

        const markerTextUpdate = (index) => {
            //更新文本标签
            for (let j = 0; j < pointCollectInstance.collectionPoints.length; j += 1) {
                const len = pointCollectInstance.computeLength({ lastIndex: j + 1 });
                const txt = len ? `${Math.round(len * 100) / 100}km` : "起点";
                if (index == j) {
                    markerTextCollectInstance.collectUpdate({ index: j, txt, lnglat: pointCollectInstance.collectionPoints[j] });
                } else {
                    markerTextCollectInstance.collectUpdate({ index: j, txt });
                }

            }
        }
        //Marker 对象注册监听事件
        const handleMarkerEvent = () => {
            const markers = markerCollectInstance.collectionMarkers;
            for (let i = 0; i < markers.length; i += 1) {
                (function (i) {
                    const marker = markers[i].setDraggable(true);
                    // marker.getElement().addEventListener("mouseover", (e) => {
                    //     console.log(e, 87777);
                    // })
                    marker.on("drag", (e) => {
                        const { lng, lat } = e.target.getLngLat();
                        pointCollectInstance.collectUpdate(i, [lng, lat]);
                        renderLine(pointCollectInstance.collectionPoints);
                        markerTextUpdate(i);
                        onDrag(exposed);
                    })
                    marker.on("dragend", () => {
                        onDragEnd(exposed);
                    })
                })(i)
            }
        }

        this.smap.on('click', handleClick);
        // 绘制开始回调
        exposed.event = { type: "click", fn: handleClick };
        onStart(exposed);
    }
    /**
     * 测多边形面积
     * 1、收集点数据
     * 2、画线、画点、标注操作
     * 3、事件处理
     * 4、增加周期事件 开始绘制、结束绘制、全部删除、
     */
    Smap.prototype.measureArea = function ({ draggable = false, onStart = function () { }, onDoing = function () { }, onDelete = function () { }, onRevoke = function () { }, onDrag = function () { }, onDragEnd = function () { }, onEnd = function () { } } = {}) {



        const _this = this;
        const exposed = {
            mapinstance: _this
        };

        const pointCollectInstance = new PointCollect();
        const markerCollectInstance = new MarkerCollect();
        const markerTextCollectInstance = new MarkerCollect();

        exposed.data = pointCollectInstance.collectionPoints;
        // 初始化鼠标移动的点
        let movePoint = null;

        const uuid = String(Date.now());
        const polyonId = `${uuid}-polygon`;
        const lineId = `${uuid}-id`;
        const delaytime = 200;
        let isEventFirst = true;
        let ismouseMove = true;
        let currentTime = null;
        let clickTimeouter = null;

        const collectionPoints = {};

        //动态更新标签、面积切换功能
        const updateCenter = (data, icon = null, iconClick) => {
            if (data.length < 3) {
                return;
            }
            const polygonFeature = pointCollectInstance.pointsToFillfeature(data);
            const lnglat = turf.centroid(polygonFeature).geometry.coordinates;
            const polygonArea = turf.area(polygonFeature);
            const rounded_area_num = Math.round(polygonArea * 100) / 100;
            let rounded_area = `${rounded_area_num} 平方米`;

            if (markerTextCollectInstance.length == 0) {
                markerTextCollectInstance.collectPush({ offset: [0, -24], lnglat: lnglat, element: MarkerCollect.createMarkerElement({ text: rounded_area }), target: this.smap });
            } else {
                if (icon) {
                    const textElement = document.createElement("span");
                    let currentIndex = 0;
                    textElement.onclick = () => {
                        console.log("你点击了我");
                        currentIndex += 1;
                        const residue = currentIndex % 3;
                        let currentText = '';
                        switch (residue) {
                            case 0:
                                currentText = `${rounded_area_num} 平方米`;
                                break;
                            case 1:
                                currentText = `${((rounded_area_num / 10000) * 15).toFixed(2)} 亩`;
                                break;
                            case 2:
                                currentText = `${(rounded_area_num / 10000).toFixed(2)} 公顷`;
                                break;
                            default:
                                break;
                        }
                        textElement.textContent = currentText;
                    }
                    textElement.textContent = rounded_area;
                    rounded_area = textElement;
                }
                markerTextCollectInstance.collectUpdate({ index: 0, txt: rounded_area, lnglat, icon, iconClick });
            }
        }
        // 渲染线条\多边形
        const renderLine = (data) => {
            const lineFeature = pointCollectInstance.pointsToLinefeature(data);
            const fillFeature = pointCollectInstance.pointsToFillfeature(data);
            const sourceId = this.setGeojsonSource(lineId, lineFeature);
            const fillSourceId = this.setGeojsonSource(polyonId, fillFeature);

            if (sourceId) {
                const layerData = this.setLineLayer({ id: lineId, sourceid: sourceId });
                this.addLayer("tool", layerData);
            }
            if (fillSourceId) {
                const layerData = this.setFillLayer({ id: polyonId, sourceId: fillSourceId });
                this.addLayer("tool", layerData);
            }
        };

        // 1.先注册点击事件
        const handleClick = (e) => {
            if (currentTime) {
                const current = Date.now();
                if (Number(current - currentTime) < delaytime) {
                    currentTime = Date.now();
                    clearTimeout(clickTimeouter);

                    if (pointCollectInstance.collectionPoints.length <= 1) {
                        return;
                    }
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

                renderLine(pointCollectInstance.collectionPoints);
                updateCenter(pointCollectInstance.collectionPoints);
                if (isEventFirst) {
                    isEventFirst = false;
                    onDoing(exposed)
                    this.smap.on("mousemove", handleMove);
                    this.smap.on("contextmenu", handleRightClick);
                }
            }, delaytime);
        }


        const handleRightClick = (e) => {
            if (pointCollectInstance.collectionPoints.length <= 1) {
                // 撤销到第一步，就是删除
                deleteAll();
                cancelAllevent();
                onEnd(exposed);
                return;
            }
            pointCollectInstance.colllectPop();
            markerCollectInstance.colllectPop();
            markerTextCollectInstance.colllectPop();

            const { lng, lat } = e.lngLat;
            const movepoint = [lng, lat];
            renderLine([...pointCollectInstance.collectionPoints, movepoint]);
            updateCenter([...pointCollectInstance.collectionPoints, movepoint]);
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
                    updateCenter([...pointCollectInstance.collectionPoints, movepoint]);
                    ismouseMove = true;
                }, 50);
            }

        }

        const deleteAll = () => {
            this.smap.removeLayer(lineId);
            this.smap.removeLayer(polyonId);
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
            updateCenter(pointCollectInstance.collectionPoints, require("./assets/destroy.png"), deleteAll);
            renderLine(pointCollectInstance.collectionPoints);
            // 结束时回调
            onEnd(exposed);

            if (draggable) {
                handleMarkerEvent();
            }
        }
        const cancelAllevent = () => {
            this.smap.off("click", handleClick);
            this.smap.off("mousemove", handleMove);
            this.smap.off("contextmenu", handleRightClick);
        }

        // const markerTextUpdate = (index) => {
        //     //更新文本标签
        //     for (let j = 0; j < pointCollectInstance.collectionPoints.length; j += 1) {
        //         const len = pointCollectInstance.computeLength({ lastIndex: j + 1 });
        //         const txt = len ? `${Math.round(len * 100) / 100}km` : "起点";
        //         if (index == j) {
        //             markerTextCollectInstance.collectUpdate({ index: j, txt, lnglat: pointCollectInstance.collectionPoints[j] });
        //         } else {
        //             markerTextCollectInstance.collectUpdate({ index: j, txt });
        //         }

        //     }
        // }
        //Marker 对象注册监听事件
        const handleMarkerEvent = () => {
            const markers = markerCollectInstance.collectionMarkers;
            for (let i = 0; i < markers.length; i += 1) {
                (function (i) {
                    const marker = markers[i].setDraggable(true);
                    marker.on("drag", (e) => {
                        const { lng, lat } = e.target.getLngLat();
                        pointCollectInstance.collectUpdate(i, [lng, lat]);
                        renderLine(pointCollectInstance.collectionPoints);
                        // markerTextUpdate(i);
                        onDrag(exposed);
                    })
                    marker.on("dragend", () => {
                        onDragEnd(exposed);
                    })
                })(i)
            }
        }

        this.smap.on('click', handleClick);
        // 绘制开始回调
        exposed.event = { type: "click", fn: handleClick };
        onStart(exposed);
    }
    /**
     * 根据半径画圆
     * 
    */
    Smap.prototype.drawCircle = function ({ mode = 1, onStart = function () { }, onDoing = function () { }, onDelete = function () { }, onRevoke = function () { }, onEnd = function () { } } = {}) {



        const _this = this;
        const exposed = {
            mapinstance: _this
        };

        const pointCollectInstance = new PointCollect();
        const markerCollectInstance = new MarkerCollect();
        const markerTextCollectInstance = new MarkerCollect();

        exposed.data = pointCollectInstance.collectionPoints;

        const uuid = String(Date.now());
        let _id = 0;
        const lineId = `${uuid}-line`;
        const circleId = `${uuid}-circle`;
        let isEventFirst = true;
        let ismouseMove = true;

        const collectionPoints = {};


        const updateCenter = (data, icon = null, iconClick) => {
            if (data.length < 2) {
                return;
            }
            const circleFeature = pointCollectInstance.twopointsToCirclefeature(data);
            const lnglat = turf.centroid(circleFeature).geometry.coordinates;
            const circleArea = turf.area(circleFeature);
            const rounded_area_num = Math.round(circleArea * 100) / 100;
            let rounded_area = `${rounded_area_num} 平方米`;

            if (markerTextCollectInstance.length == 0) {
                markerTextCollectInstance.collectPush({ offset: [0, -24], lnglat: lnglat, element: MarkerCollect.createMarkerElement({ text: rounded_area }), target: this.smap });
            } else {
                if (icon) {
                    const textElement = document.createElement("span");
                    let currentIndex = 0;
                    textElement.onclick = () => {
                        console.log("你点击了我");
                        currentIndex += 1;
                        const residue = currentIndex % 3;
                        let currentText = '';
                        switch (residue) {
                            case 0:
                                currentText = `${rounded_area_num} 平方米`;
                                break;
                            case 1:
                                currentText = `${((rounded_area_num / 10000) * 15).toFixed(2)} 亩`;
                                break;
                            case 2:
                                currentText = `${(rounded_area_num / 10000).toFixed(2)} 公顷`;
                                break;
                            default:
                                break;
                        }
                        textElement.textContent = currentText;
                    }
                    textElement.textContent = rounded_area;
                    rounded_area = textElement;
                }
                markerTextCollectInstance.collectUpdate({ index: 0, txt: rounded_area, lnglat, icon, iconClick });
            }
        }
        // 渲染线条、圆形bing
        const renderLine = (data) => {
            const lineFeature = pointCollectInstance.pointsToLinefeature(data);
            const sourceId = this.setGeojsonSource(lineId, lineFeature);
            const circleFeature = pointCollectInstance.twopointsToCirclefeature(data)
            const circleSourceId = this.setGeojsonSource(circleId, circleFeature);
            console.log(circleSourceId, 44444);
            if (sourceId) {
                const layerData = this.setLineLayer({ id: lineId, sourceid: sourceId });
                this.addLayer("tool", layerData);
            }
            if (circleSourceId) {
                const layerData = this.setFillLayer({ id: circleId, sourceId: circleSourceId });
                this.addLayer("tool", layerData)
            }
        };

        const radiusToCircle = ({ data, radius, options = { steps: 200, units: 'kilometers' } } = {}) => {
            if (data.length < 1) return;
            const circleFeature = pointCollectInstance.pointsToCirclefeature(data[0], radius, options)
            const circleSourceId = this.setGeojsonSource(circleId, circleFeature);
            console.log(this, circleSourceId, circleFeature, 5555);
            if (circleSourceId) {
                const layerData = this.setFillLayer({ id: circleId, sourceId: circleSourceId });
                this.addLayer("tool", layerData)
            }
            const lnglat = data[0];
            const circleArea = turf.area(circleFeature);
            const rounded_area_num = Math.round(circleArea * 100) / 100;
            let rounded_area = `${rounded_area_num} 平方米`;

            markerTextCollectInstance.collectPush({ offset: [0, -24], lnglat: lnglat, element: MarkerCollect.createMarkerElement({ text: rounded_area }), target: this.smap });
            const textElement = document.createElement("span");
            let currentIndex = 0;
            textElement.onclick = () => {
                console.log("你点击了我");
                currentIndex += 1;
                const residue = currentIndex % 3;
                let currentText = '';
                switch (residue) {
                    case 0:
                        currentText = `${rounded_area_num} 平方米`;
                        break;
                    case 1:
                        currentText = `${((rounded_area_num / 10000) * 15).toFixed(2)} 亩`;
                        break;
                    case 2:
                        currentText = `${(rounded_area_num / 10000).toFixed(2)} 公顷`;
                        break;
                    default:
                        break;
                }
                textElement.textContent = currentText;
            }
            textElement.textContent = rounded_area;
            rounded_area = textElement;
            markerTextCollectInstance.collectUpdate({ index: 0, txt: rounded_area, lnglat, icon: require("./assets/destroy.png"), iconClick: deleteAll });
        }

        // 1.先注册点击事件
        const handleClick = (e) => {

            const { lng, lat } = e.lngLat;
            pointCollectInstance.collectPush([lng, lat]);
            markerCollectInstance.collectPush({ lnglat: [lng, lat], element: MarkerCollect.createPointElement(), target: this.smap });

            renderLine(pointCollectInstance.collectionPoints);

            if (isEventFirst && mode === 1) {
                isEventFirst = false;
                onDoing(exposed);
                this.smap.once("click", handlecomplete);
                this.smap.on("mousemove", handleMove);
                this.smap.on("contextmenu", handleRightClick);

            }
            if (mode === 2) {
                onDoing(exposed);
                exposed.onOk = handleDrawComplete;
                exposed.onCancel = deleteAll;
                onEnd(exposed);
            }
        }


        const handleRightClick = (e) => {

            if (pointCollectInstance.collectionPoints.length <= 1) {
                // 撤销到第一步，就是删除
                deleteAll();
                cancelAllevent();
                onEnd(exposed);
                return;
            }
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
                    updateCenter([...pointCollectInstance.collectionPoints, movepoint]);
                    ismouseMove = true;
                }, 50);
            }

        }

        const deleteAll = () => {
            this.removeLayer(`${uuid}-line`);
            this.removeLayer(`${uuid}-circle`);
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

            markerCollectInstance.Empty();

            updateCenter(pointCollectInstance.collectionPoints, require("./assets/destroy.png"), deleteAll);
            renderLine(pointCollectInstance.collectionPoints);
            // 结束时回调
            onEnd(exposed);
        }

        // 根据半径回调画圆
        const handleDrawComplete = (radius, options = { steps: 200, units: 'kilometers' }) => {
            if (_id > 0) return; // 防止重复调用
            _id += 1;
            radiusToCircle({ data: pointCollectInstance.collectionPoints, radius, options });
            markerCollectInstance.Empty();
        }
        const cancelAllevent = () => {
            this.smap.off("click", handlecomplete);
            this.smap.off("mousemove", handleMove);
            this.smap.off("contextmenu", handleRightClick);
        }


        this.smap.once('click', handleClick);
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

PointCollect.prototype.collectUpdate = function (index, data) {
    this.collectionPoints[index] = data;
}

PointCollect.prototype.Empty = function () {
    this.collectionPoints = [];
    this.length = 0;
}

PointCollect.prototype.pointsToLinefeature = function (data) {
    data = Array.prototype.slice.call(data);
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

PointCollect.prototype.twopointsToCirclefeature = function (data, options = {
    steps: 200, units: 'kilometers'
}) {
    let circleFeature = {
        "type": "FeatureCollection",
        "features": []
    };
    if (!Array.isArray(data)) return;
    if (data.length > 1) {
        const center = data[0];
        const from = turf.point(data[0]);
        const to = turf.point(data[1]);
        const radius = turf.distance(from, to, options);
        console.log(radius, 444444);
        if (radius) {
            circleFeature = turf.circle(center, radius, options);
        }
    }
    return circleFeature;
}

PointCollect.prototype.pointsToCirclefeature = function (center, radius, options = {
    steps: 200, units: 'kilometers'
}) {
    if (!radius) {
        console.warn("请输入正确的半径")
        return;
    }
    return turf.circle(center, radius, options);
}

PointCollect.prototype.pointsToFillfeature = function (data) {
    data = Array.prototype.slice.call(data);
    if (!Array.isArray(data)) return;
    let fillFeature = {
        "type": "FeatureCollection",
        "features": []
    };
    if (data.length >= 3) {
        fillFeature = turf.polygon([[...data, data[0]]]);
    }
    return fillFeature;
}
// 计算长度
PointCollect.prototype.computeLength = function ({ lastIndex, units = "kilometers" } = {}) {
    if (this.length <= 1 || (lastIndex && lastIndex <= 1)) {
        console.error("坐标数据...");
        return;
    }
    const lineFeature = lineString(lastIndex ? this.collectionPoints.slice(0, lastIndex) : this.collectionPoints);
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
    Element.style = "display:inline-block; padding:4px 8px;white-space:nowrap;opacity:.8;background-color:#ffcc33; border-radius: 4px;color: #000;margin-right:12px;";
    const TextElement = document.createElement("span");
    TextElement.className = "markertext";
    if (typeof text == "string") {
        TextElement.textContent = text;
    }
    if (text instanceof HTMLElement) {
        TextElement.appendChild(text);
    }

    Element.appendChild(TextElement);

    if (icon) {
        const destroyImgElement = document.createElement('img');
        destroyImgElement.style = "transform:translateY(3px)";
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

MarkerCollect.prototype.collectUpdate = function ({ index, txt, lnglat, icon, iconClick } = {}) {
    const marker = this.collectionMarkers[index];
    if (lnglat) {
        marker.setLngLat(lnglat);
    }
    if (typeof txt == "string") {
        this.collectionMarkers[index]._element.childNodes[0].innerHTML = txt;
    }
    if (txt instanceof HTMLElement) {
        this.collectionMarkers[index]._element.childNodes[0].innerHTML = ""
        this.collectionMarkers[index]._element.childNodes[0].appendChild(txt);
    }
    if (icon) {
        const destroyImgElement = document.createElement('img');
        destroyImgElement.src = icon;
        destroyImgElement.onclick = () => {
            iconClick && iconClick();
        };
        this.collectionMarkers[index]._element.appendChild(destroyImgElement);
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



