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
                new mapboxgl.Popup({ closeButton: false }).setLngLat(feature.geometry.coordinates)
                    .setText(`${feature.properties.name}`)
                    .addTo(map);
            });
        }
    }
    /**
     * 添加线图层
    */
    Smap.prototype.addLineLayer = function (option = { id, color, width, animate, minZoom, maxZoom, data }, callback) {
        const { id, color, width, animate, minZoom, maxZoom, data } = option;
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
            type: "line",
            source: id,
            minzoom: minZoom || 0,
            maxZoom: maxZoom || 22,
            paint: {
                "line-color": color,
                "line-width": width || 2,
                "line-opacity": 0.5,
            },
            layout: {
                "line-cap": "butt",
                "line-join": "round",
            }
        };
        this.smap.addLayer(param);
        if (animate) {
            let step = 0;
            let progress = 0;
            const dashArraySeq = [
                [0, 4, 3],
                [1, 4, 2],
                [2, 4, 1],
                [3, 4, 0],
                [0, 0, 4, 3],
                [0, 1, 4, 2],
                [0, 2, 4, 1],
                [0, 3, 4, 0]
            ];
            const interval = () => {
                try {
                    progress += 1;
                    if (progress % 3 === 1) {
                        if (!this.smap || !this.smap.setPaintProperty) return;
                        step = (step + 1) % dashArraySeq.length;
                        this.smap.setPaintProperty(param.id, "line-dasharray", dashArraySeq[step]);
                    }
                    window.requestAnimationFrame(interval);
                } catch (error) { }

            };
            interval();
        }
        if (callback) {
            callback(this.smap, id);
        } else {
            //默认交互
            this.smap.on("click", id, e => {
                const feature = e.features[0];
                new mapboxgl.Popup({ closeButton: false }).setLngLat(feature.geometry.coordinates)
                    .setText(`${feature.properties.name}`)
                    .addTo(map);
            });
        }
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

}