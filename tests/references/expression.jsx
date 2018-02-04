"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _getClassNames = require("ts-transform-css-modules-next/dist/getClassNames");
var _importStylesMap = { "slide-in": "ae af ag ", "header": "ah ai ", "header-content": "aj ak al am an ao ap ", "time": "aq ar as at au ", "h3": "av aw ax ay az ba bb ", "h3-text": "bc bd be bf bg ", "h4": "bh bi bj bk ", "h5": "aq at bl au ", "content": "ak bk al am ao ap bm ", "paragraf-md": "bn bo bk bp bq ", "quote": "aq bo bk bp bj br bs bt bu bv bw ", "paragraf-sm": "bn bo bp bx ", "mb2": "bv " };
require("./main.styl")
exports.default = <div className={"test" + _getClassNames("test", _importStylesMap)}/>;
