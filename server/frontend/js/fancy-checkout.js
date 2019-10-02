var FancyCheckout = function(n) {
    var r = {};

    function a(e) {
        if (r[e]) return r[e].exports;
        var t = r[e] = {
            i: e,
            l: !1,
            exports: {}
        };
        return n[e].call(t.exports, t, t.exports, a), t.l = !0, t.exports
    }
    return a.m = n, a.c = r, a.d = function(e, t, n) {
        a.o(e, t) || Object.defineProperty(e, t, {
            enumerable: !0,
            get: n
        })
    }, a.r = function(e) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(e, "__esModule", {
            value: !0
        })
    }, a.t = function(t, e) {
        if (1 & e && (t = a(t)), 8 & e) return t;
        if (4 & e && "object" == typeof t && t && t.__esModule) return t;
        var n = Object.create(null);
        if (a.r(n), Object.defineProperty(n, "default", {
                enumerable: !0,
                value: t
            }), 2 & e && "string" != typeof t)
            for (var r in t) a.d(n, r, function(e) {
                return t[e]
            }.bind(null, r));
        return n
    }, a.n = function(e) {
        var t = e && e.__esModule ? function() {
            return e.default
        } : function() {
            return e
        };
        return a.d(t, "a", t), t
    }, a.o = function(e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }, a.p = "/dist/", a(a.s = 3)
}([function(e, t, n) {
    e.exports = function a(i, o, s) {
        function c(n, e) {
            if (!o[n]) {
                if (!i[n]) {
                    if (d) return d(n, !0);
                    var t = new Error("Cannot find module '" + n + "'");
                    throw t.code = "MODULE_NOT_FOUND", t
                }
                var r = o[n] = {
                    exports: {}
                };
                i[n][0].call(r.exports, function(e) {
                    var t = i[n][1][e];
                    return c(t || e)
                }, r, r.exports, a, i, o, s)
            }
            return o[n].exports
        }
        for (var d = !1, e = 0; e < s.length; e++) c(s[e]);
        return c
    }({
        1: [function(e, t, n) {
            "use strict";
            Object.defineProperty(n, "__esModule", {
                value: !0
            });
            var p = function(e, t) {
                if (Array.isArray(e)) return e;
                if (Symbol.iterator in Object(e)) return function(e, t) {
                    var n = [],
                        r = !0,
                        a = !1,
                        i = void 0;
                    try {
                        for (var o, s = e[Symbol.iterator](); !(r = (o = s.next()).done) && (n.push(o.value), !t || n.length !== t); r = !0);
                    } catch (e) {
                        a = !0, i = e
                    } finally {
                        try {
                            !r && s.return && s.return()
                        } finally {
                            if (a) throw i
                        }
                    }
                    return n
                }(e, t);
                throw new TypeError("Invalid attempt to destructure non-iterable instance")
            };
            n.default = function(e) {
                var f = e.toString().replace(/\D/g, "").substr(0, 6),
                    h = [];
                return i.default.forEach(function(l) {
                    l.pattern.forEach(function(e) {
                        var t, n, r, a, i, o, s, c, d, u;
                        r = f, a = e, (Array.isArray(a) ? (i = r, o = p(a, 2), s = o[0], c = o[1], d = s.toString().length, u = parseInt(i.substr(0, d)), s <= u && u <= c) : (t = r, (n = a) instanceof RegExp ? n.test(t) : (n = n.toString(), t.substr(0, n.length) === n))) && h.unshift(l.name)
                    })
                }), h[0] || ""
            };
            var r, a = e("./cards"),
                i = (r = a) && r.__esModule ? r : {
                    default: r
                }
        }, {
            "./cards": 2
        }],
        2: [function(e, t, n) {
            "use strict";
            Object.defineProperty(n, "__esModule", {
                value: !0
            }), n.default = [{
                name: "visa",
                pattern: [4]
            }, {
                name: "mastercard",
                pattern: [
                    [51, 55],
                    [2221, 2720]
                ]
            }, {
                name: "amex",
                pattern: [34, 37]
            }, {
                name: "diners",
                pattern: [36, 309, [300, 305],
                    [38, 39]
                ]
            }, {
                name: "unionpay",
                pattern: [62]
            }, {
                name: "discover",
                pattern: [6011, [622126, 622925],
                    [644, 649], 65
                ]
            }, {
                name: "jcb",
                pattern: [35]
            }, {
                name: "maestro",
                pattern: [5018, 502, 503, 506, 56, 57, 58, 639, 6220, 67]
            }, {
                name: "elo",
                pattern: [401178, 401179, 431274, 438935, 451416, 457393, 457631, 457632, 504175, 627780, 636297, 636297, 636368, [506699, 506778],
                    [509e3, 509999],
                    [650031, 650033],
                    [650035, 650051],
                    [650405, 650439],
                    [650485, 650538],
                    [650541, 650598],
                    [650700, 650718],
                    [650720, 650727],
                    [650901, 650920],
                    [651652, 651679],
                    [655e3, 655019],
                    [655021, 655058],
                    [650921, 650978]
                ]
            }, {
                name: "hipercard",
                pattern: [384100, 384140, 384160, /^60(?!11)/]
            }]
        }, {}],
        3: [function(e, t, n) {
            "use strict";
            Object.defineProperty(n, "__esModule", {
                value: !0
            });
            var r = e("./cards");
            Object.defineProperty(n, "cards", {
                enumerable: !0,
                get: function() {
                    return i(r).default
                }
            });
            var a = e("./cardType");

            function i(e) {
                return e && e.__esModule ? e : {
                    default: e
                }
            }
            Object.defineProperty(n, "cardType", {
                enumerable: !0,
                get: function() {
                    return i(a).default
                }
            })
        }, {
            "./cardType": 1,
            "./cards": 2
        }]
    }, {}, [3])(3)
}, function(e, t, n) {}, , function(e, t, n) {
    "use strict";

    function a(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
        }
    }
    n.r(t);
    var r = function() {
            function t() {
                ! function(e, t) {
                    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                }(this, t);
                var e = document.querySelector.bind(document);
                this.cardNumber = e("#numero-do-cartao-front"), this.cardNumberBack = e("#numero-do-cartao-back"), this.cardName = e("#nome-front"), this.cardNameBack = e("#nome-back"), this.cardDate = e("#data-front"), this.cardDateBack = e("#data-back"), this.cardBack = e("#cartao-back"), this.areaTitle = e("#titulo-area"), this.cardAreaTitle = e("#card-area-titulo"), this.areaButton = e("#button-area"), this.flipper = e("#flipper"), this.littleMachine = e("#maquininha"), this.niceEdge = e("#bordinha-nice"), this.successFeedback = e("#feedback-sucesso"), this.total = e("#total"), this.willDisappearAll = document.querySelectorAll(".vai-sumir"), this.willDisappear = e(".vai-sumir"), this.scrolTop = this.scrolTop.bind(this), this.secondStep = this.secondStep.bind(this), this.submit = this.submit.bind(this)
            }
            var e, n, r;
            return e = t, (n = [{
                key: "scrolTop",
                value: function() {
                    window.scroll({
                        top: 0,
                        left: 0,
                        behavior: "smooth"
                    })
                }
            }, {
                key: "secondStep",
                value: function() {
                    var e = this;
                    this.littleMachine.addEventListener("transitionend", function() {
                        e.littleMachine.style.cssText = "\n        height:auto;\n        z-index: 999;\n        padding: 50px 35px 90px 35px;\n        width: 80%;\n        margin:0px auto;\n        background: #362563;\n        background: -moz-linear-gradient(360deg, #362563 0%, #4b2563 100%);\n        background: -webkit-linear-gradient(360deg, #362563 0%,#4b2563 100%);\n        background: linear-gradient(360deg, #362563 0%,#4b2563 100%);\n        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#362563', endColorstr='#4b2563',GradientType=1 );\n        border-bottom: 6px solid #20163d;\n        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.45);\n      ", e.niceEdge.style.opacity = "1"
                    }), this.flipper.addEventListener("animationend", function() {
                        e.successFeedback.style.cssText = "opacity:1; transform: translate(-50%, -100%);"
                    })
                }
            }, {
                key: "submit",
                value: function() {
                    var e = this;
                    this.littleMachine.style.height = "".concat(this.littleMachine.offsetHeight, "px"), this.scrolTop(), this.cardNumberBack.insertAdjacentHTML("afterbegin", this.cardNumber.value), this.cardNameBack.insertAdjacentHTML("afterbegin", this.cardName.value.toUpperCase()), this.cardDateBack.insertAdjacentHTML("afterbegin", this.cardDate.value), this.cardAreaTitle.classList.add("fadeOut"), this.areaTitle.classList.add("fadeOut"), this.areaButton.classList.add("fadeOut"), this.flipper.classList.add("anima-flipper"), this.cardBack.classList.add("anima-cartao-back"), this.littleMachine.classList.add("animacao-maquininha"), this.cardBack.addEventListener("animationend", function() {
                        e.willDisappearAll.forEach(function(e) {
                            e.style.animation = "vaiSumir 300ms both"
                        }), e.willDisappear.addEventListener("animationend", function() {
                            e.willDisappearAll.forEach(function(e) {
                                return e.remove()
                            }), e.total.style.cssText = "padding:15px; border:2px solid rgba(255,255,255,0.7); border-radius:4px;", e.littleMachine.style.height = "100px", e.secondStep()
                        }, !1)
                    }, !1)
                }
            }]) && a(e.prototype, n), r && a(e, r), t
        }(),
        i = {
            init: function(e, t) {
                var n = e,
                    r = t;
                window.setTimeout(function() {
                    n.value = r(n.value)
                }, 1)
            },
            creditCardPattern: function(e) {
                var t = e;
                return t = (t = (t = (t = t.replace(/\D/g, "")).replace(/^(\d{4})(\d)/g, "$1 $2")).replace(/^(\d{4})\s(\d{4})(\d)/g, "$1 $2 $3")).replace(/^(\d{4})\s(\d{4})\s(\d{4})(\d)/g, "$1 $2 $3 $4")
            },
            datePattern: function(e) {
                var t = e;
                return t = t.replace(/^(\d{2})(\d{4})/g, "$1/$2")
            }
        },
        o = function() {
            var e = document.getElementById("numero-do-cartao-front"),
                t = document.getElementById("data-front");
            e.addEventListener("keypress", function(e) {
                i.init(this, i.creditCardPattern)
            }), t.addEventListener("keypress", function(e) {
                i.init(this, i.datePattern)
            })
        },
        s = {
            onlyRegex: function(e, t) {
                var n = e.keyCode || e.which;
                n = String.fromCharCode(n), t.test(n) || (e.returnValue = !1, e.preventDefault && e.preventDefault())
            }
        },
        c = function() {
            var e = document.getElementById("numero-do-cartao-front"),
                t = document.getElementById("nome-front"),
                n = document.getElementById("data-front"),
                r = document.getElementById("cvv-front");
            e.addEventListener("paste", function(e) {
                return e.preventDefault()
            }), e.addEventListener("copy", function(e) {
                return e.preventDefault()
            }), e.addEventListener("cut", function(e) {
                return e.preventDefault()
            }), e.addEventListener("keypress", function(e) {
                return s.onlyRegex(e, /\d/)
            }), t.addEventListener("keypress", function(e) {
                return s.onlyRegex(e, /[A-z\s]/)
            }), n.addEventListener("keypress", function(e) {
                return s.onlyRegex(e, /[\d]/)
            }), n.addEventListener("keypress", function(e) {
                return s.onlyRegex(e, /[\d]/)
            }), r.addEventListener("keypress", function(e) {
                return s.onlyRegex(e, /[\d]/)
            })
        },
        d = n(0);

    function u(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
        }
    }
    var l = function() {
            function t() {
                ! function(e, t) {
                    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                }(this, t);
                var e = document.querySelector.bind(document);
                this.cardFlag = e("#marca-cartao"), this.cardNumber = e("#numero-do-cartao-front"), this.init = this.init.bind(this), this.add = this.add.bind(this), this.remove = this.remove.bind(this), this.countChars = this.countChars.bind(this)
            }
            var e, n, r;
            return e = t, (n = [{
                key: "init",
                value: function(e) {
                    var t = e.target.value;
                    t.length <= 3 ? this.remove() : Object(d.cardType)(t) && this.add(t)
                }
            }, {
                key: "add",
                value: function(e) {
                    var t = this,
                        n = Object(d.cardType)(e),
                        r = this.countChars(n);
                    this.cardFlag.setAttribute("alt", "Logo cartão de crédito " + n), this.cardFlag.setAttribute("src", "dist/img/flags/" + n + ".png"), this.cardNumber.setAttribute("minlength", r.minlength + 3), this.cardNumber.setAttribute("maxlength", r.maxlength + 3), window.setTimeout(function() {
                        t.cardFlag.classList.add("marca-cartao-entra")
                    }, 100)
                }
            }, {
                key: "remove",
                value: function() {
                    var e = this;
                    this.cardFlag.classList.remove("marca-cartao-entra"), window.setTimeout(function() {
                        e.cardFlag.setAttribute("src", "dist/img/flags/visa.png"), e.cardFlag.setAttribute("alt", ""), e.cardNumber.removeAttribute("minlength"), e.cardNumber.setAttribute("maxlength", 22)
                    }, 100)
                }
            }, {
                key: "countChars",
                value: function(e) {
                    var t, n;
                    switch (e) {
                        case "amex":
                            n = t = 15;
                            break;
                        case "diners":
                            t = 14, n = 16;
                            break;
                        case "discover":
                        case "elo":
                            n = t = 16;
                            break;
                        case "hipercard":
                            t = 13, n = 19;
                            break;
                        case "jcb":
                        case "mastercard":
                            n = t = 16;
                            break;
                        case "visa":
                            t = 13, n = 16
                    }
                    return {
                        minlength: t,
                        maxlength: n
                    }
                }
            }]) && u(e.prototype, n), r && u(e, r), t
        }(),
        f = function() {
            var e = new l;
            document.getElementById("numero-do-cartao-front").addEventListener("keyup", e.init)
        };
    o(), c(), f();
    n(1);

    function h() {
        (new r).submit()
    }
    n.d(t, "init", function() {
        return h
    })
}]);