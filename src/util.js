/**
 * url:http://turfjs.org/docs/
 * 
 */
import * as turf from '@turf/turf';


export default function (Smap) {
    Smap.prototype.Turf = (function () {
        return {
            turf: turf,
            point,
            featureCollection
        }
    })()
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
