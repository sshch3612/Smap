export default function (Smap) {
    Smap.prototype.on = function () {
        this.smap.on(...arguments);
    }
    Smap.prototype.once = function () {
        this.smap.once(...arguments);
    }
    Smap.prototype.off = function () {
        this.smap.off(...arguments)
    }
}