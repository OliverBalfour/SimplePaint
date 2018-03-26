var HSBRect = (function () {
    function HSBRect(width, height) {
        if (typeof width === "undefined") { width = 0x80; }
        if (typeof height === "undefined") { height = 0x80; }
        this._hue = 0;
        this._sa = document.createElement('canvas');
        this._sa.height = 1;
        this._sa.style.setProperty('position', 'absolute');
        this._br = document.createElement('canvas');
        this._br.width = 1;
        this._br.style.setProperty('position', 'absolute');
        this._div = document.createElement('div');
        this._div.style.setProperty('background-color', 'white');
        this._div.appendChild(this._sa);
        this._div.appendChild(this._br);
        this.width = width;
        this.height = height;
    }
    HSBRect.prototype._renderSa = function () {
        var ctx = this._sa.getContext('2d');
        var grad = ctx.createLinearGradient(0, 0, this._sa.width, 1);
        var c = 'hsla(' + this._hue + ',100%,50%,';
        grad.addColorStop(0, c + '0)');
        grad.addColorStop(1, c + '1)');
        ctx.fillStyle = grad;
        ctx.clearRect(0, 0, this._sa.width, 1);
        ctx.fillRect(0, 0, this._sa.width, 1);
    };
    HSBRect.prototype._renderBr = function () {
        var ctx = this._br.getContext('2d');
        var grad = ctx.createLinearGradient(0, 0, 1, this._br.height);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'black');
        ctx.fillStyle = grad;
        ctx.clearRect(0, 0, 1, this._br.height);
        ctx.fillRect(0, 0, 1, this._br.height);
    };
    HSBRect.prototype._size = function () {
        var w = this._sa.width + 'px';
        var h = this._br.height + 'px';
        this._div.style.setProperty('width', w);
        this._div.style.setProperty('height', h);
        this._sa.style.setProperty('width', w);
        this._sa.style.setProperty('height', h);
        this._br.style.setProperty('width', w);
        this._br.style.setProperty('height', h);
    };
    Object.defineProperty(HSBRect.prototype, "DOMElement", {
        get: function () {
            return this._div;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HSBRect.prototype, "hue", {
        get: function () {
            return this._hue;
        },
        set: function (value) {
            this._hue = value;
            this._renderSa();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HSBRect.prototype, "width", {
        get: function () {
            return this._sa.width;
        },
        set: function (value) {
            this._sa.width = value;
            this._size();
            this._renderSa();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HSBRect.prototype, "height", {
        get: function () {
            return this._br.height;
        },
        set: function (value) {
            this._br.height = value;
            this._size();
            this._renderBr();
        },
        enumerable: true,
        configurable: true
    });
    return HSBRect;
})();
