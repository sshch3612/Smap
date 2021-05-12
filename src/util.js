//鼠标指针提示
function mousetip() {
    this.init();
}
mousetip.prototype.init = function () {
    const Element = document.createElement("div");
    Element.className = "mousetip";
    Element.style.position = "fixed";
    this.tipElement = Element;
    document.body.appendChild(this.tipElement);
}

mousetip.prototype.updatePosition = function (mouseX, mouseY) {
    this.tipElement.style.left = `${mouseX}px`;
    this.tipElement.style.top = `${mouseY}px`;
}

mousetip.prototype.updateText = function (element) {
    if (typeof element == "string") {
        this.tipElement.innerHTML = element;
    } else {
        this.tipElement.appendChild(element);
    }
}

mousetip.prototype.clearText = function () {
    this.tipElement.innerHTML = "";
}

mousetip.prototype.destroy = function () {
    this.tipElement.remove();
    this.tipElement = null;
}


export const proxyGetMousetip = (function () {
    let instance = null;
    return function () {
        if (!instance || !instance.tipElement) {
            instance = new mousetip();
        }
        return instance
    }
})()




export const isDOM = (typeof HTMLElement === 'object') ?
    function (obj) {
        return obj instanceof HTMLElement;
    } :
    function (obj) {
        return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
    }


export const fullScreen = (id) => {
    var el = document.getElementById(id)
    var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (typeof rfs != "undefined" && rfs) {
        rfs.call(el);
    };
    return;
}
export const exitScreen = () => {
    var exitMethod = document.exitFullscreen || //W3C
        document['mozCancelFullScreen'] ||    //Chrome等
        document['webkitExitFullscreen'] || //FireFox
        document['webkitExitFullscreen']; //IE11
    if (exitMethod) {
        exitMethod.call(document);
    } else {
        alert('请使用谷歌浏览器打开')
    }
}


const util = {
    mousetip: proxyGetMousetip,
    fullScreen,
    exitScreen,
    isDOM,
}
export default util;