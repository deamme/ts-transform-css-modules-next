"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _getClassNames = require("ts-transform-css-modules-next/dist/getClassNames");
var _importStylesMap = { "slide-in": "a b c ", "block-large": "d e f g h m ", "block-small": "i j k l " };
require("./div.styl")
exports.default = <div className={"test" + _getClassNames("test", _importStylesMap)}/>;
