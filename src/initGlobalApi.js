/**
 * url:http://turfjs.org/docs/
 * 
 */
import * as turf from '@turf/turf';
import mapboxgl from 'mapbox-gl';
import { proxyGetMousetip as mousetip } from "./util";

export default function initGlobalApi(Smap) {
    Smap.$turf = turf;
    Smap.$mapbox = mapboxgl;
    Smap.point = point;
    Smap.featureCollection = featureCollection;
    Smap.$util = {
        mousetip
    }
}


/**
 * 点坐标转化为 point feature 
 *
 * @param {*} coordinates
 * @param {*} [properties={}]
 * @returns
 */
const point = function (coordinates, properties = {}) {

    if (!Array.isArray(coordinates)) throw "param is not Array!";
    return turf.point(coordinates, properties)
}

/**
 *
 *
 * @param {*} featureArray
 */
const featureCollection = function (featureArray) {
    if (!Array.isArray(featureArray)) throw "param is not Array";
    return turf.featureCollection(featureArray);
}