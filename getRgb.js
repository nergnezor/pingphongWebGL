var Black = [0, 0, 0]
var Purple = [255, 0, 255]
var Red = [255, 0, 0]
var RedDark = [10, 0, 40]
var Green = [0, 255, 30]
var GreenDark = [0, 10, 0]
var Blue = [0, 0, 255]
var White = [255, 255, 255]
var Yellow = [200,50,0]

var Min = 0.0
var Max = 0.0
var nSegments = 3

var colorOrder = [
[255,80,0],
// [0,200,0],
[100,0,80],
// White,
//     Blue,
//     Blue,
//     Green,
//     Red,
// [5,1,5],
    Black
]
/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/
function HSVtoRGB(h, s, v) {
    var color = []
    var rgb = []
    var r, g ,b ,i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    color[0] = Math.round(r * 255)
    color[1] = Math.round(g * 255)
    color[2] = Math.round(b * 255)
    return color
}
function heatMapColorforValue(value) {
    var color = []
    value *= colorOrder.length - 1
    var startIndex = Math.floor(value)
    startIndex = Math.min(colorOrder.length - 1, startIndex)
    var endIndex = Math.min(colorOrder.length - 1, startIndex + 1)
    var startColor = colorOrder[startIndex]
    var endColor = colorOrder[endIndex]
    value = (value % 1)
    for (let i = 0; i < 3; ++i) {
        color[i] = (1 - value) * startColor[i]
        color[i] += value * endColor[i]
        color[i] = Math.round(color[i]);
    }
    // console.log(color)
    return color
}