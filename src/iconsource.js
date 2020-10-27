export default function iconsource(Smap) {
    /**
     * 加载动点图
     * @param {*} id 
     * @param {*} size 
     * @param {*} color 
     * @param {*} scale 
     */
    Smap.prototype.loadDynamicPoint = function ({ id = "dynamic-point",
        size = 60,
        color = '255, 100, 100',
        scale = 2.0 }) {
        const _this = this;
        size = size * scale;
        const gifImage = {
            width: size,
            height: size,
            data: new Uint8Array(size * size * 4),
            onAdd: function () {
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                this.context = canvas.getContext('2d');
            },
            render: function () {
                const duration = 1000;
                const t = (performance.now() % duration) / duration;

                const radius = (size / 2) * t;
                const context = this.context;

                // // draw outer circle
                context.clearRect(0, 0, this.width, this.height);
                context.beginPath();
                context.arc(this.width / 2, this.height / 2, 10, 0, Math.PI * 2);
                context.fillStyle = `rgba(${color})`;
                context.fill();
                context.beginPath();
                context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
                context.fillStyle = `rgba(${color},.5)`;
                context.strokeStyle = `rgba(${color})`;
                context.lineWidth = 2 + 4 * (1 - t);
                context.fill();
                context.stroke();

                // update this image's data with data from the canvas
                this.data = context.getImageData(0, 0, this.width, this.height).data;
                _this.smap.triggerRepaint();
                return true;
            },
        };
        _this.smap.addImage(id, gifImage); // 可作为icon-image使用
    }
    Smap.prototype.loadDynamicIconPoint = function ({ id, size = 60, color = "55, 200, 200", imageObj = require("./assets/point.png"), scale = 1.0 }) {
        const _this = this;
        size = size * scale;
        const gifImage = {
            width: size,
            height: size,
            data: new Uint8Array(size * size * 4),
            onAdd: function () {
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                this.context = canvas.getContext('2d');

                this.img = new Image();
                this.img.src = imageObj;
                //插入图片

            },
            render: function () {
                const duration = 1000;
                const t = (performance.now() % duration) / duration;

                const radius = (size / 2) * .5;
                const outerRadius = (size / 2) * 0.4 + radius;
                const context = this.context;

                // // draw outer circle
                context.clearRect(0, 0, this.width, this.height);
                context.beginPath();
                context.arc(
                    this.width / 2,
                    this.height / 2,
                    radius,
                    0,
                    Math.PI * 2
                );
                context.strokeStyle = `rgba(${color},` + (1 - t) + ')';
                context.lineWidth = 2 + 10 * (1 - t);
                context.stroke();

                context.drawImage(this.img, size / 4, size / 4, size / 2, size / 2);

                // update this image's data with data from the canvas
                this.data = context.getImageData(
                    0,
                    0,
                    this.width,
                    this.height
                ).data;
                _this.smap.triggerRepaint()
                return true
            }
        }
        _this.smap.addImage(id, gifImage) // 可作为icon-image使用
    }
}