var Black = [0, 0, 0]
var Purple = [255, 0, 255]
var Red = [255, 0, 0]
var RedDark = [100, 0, 0]
var Green = [0, 255, 30]
var GreenDark = [0, 10, 0]
var Blue = [0, 0, 255]
var White = [255, 255, 255]
var Yellow = [255,100,0]

var Min = 0.0
var Max = 1.0
var nSegments = 3

var colorOrder = [
    Black,
    // RedDark,
    // GreenDark,
    // Purple,
    // Yellow,
    // Green,
    Red,
    // Blue,
    // Purple,
    // Purple,
    // Black,
    // White,
]

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