export default function (Smap) {
    Smap.prototype.on = function () {
        this.smap.on(...arguments);
    }
}