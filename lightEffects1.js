var X = 0;
var Y = 1;
var Z = 2;
var R = 3;
var Phi = 4;

function getDistance(p1, p2) {
    var sum = 0;
    for (let axis = X; axis <= Z; ++axis) {
        sum += Math.pow(p1[axis] - p2[axis], 2);
    }
    var r = Math.sqrt(sum);
    return r;
}

function lightNextBulb() {
    ballIndex = ++ballIndex % 50
    for (let i = 0; i < NBulbs; ++i) {
        if (i == ballIndex) {
            bulbs[i].color = GetRgb(Math.max(0, Math.min(val, 255)));
        }
        else {
            bulbs[i].color = [0, 0, 0];
        }
    }
}
var SweeperMin = 0;
var SweeperMax = 1;
var SweeperStep = 1.0;
var sweepDir = 1;
var sweeper = SweeperMin;
var startOver = true;
var vMax = 0
var vMin = 1

function interpolateLocations() {
    var p = [];
    var p1 = bulbs[Math.floor(sweeper)].location;
    var p2 = bulbs[(Math.floor(sweeper) + 1) % 50].location;
    for (let axis = X; axis <= Z; ++axis) {
        p[axis] = p1[axis] + (p2[axis] - p1[axis]) * (sweeper % 1.0);
    }
    return p;
}

function interpolateValues(v1, v2) {
    //     let w = sweeper * (SweeperMax / SweeperMin)
    //     return v1 * w + v2 * (1-w)
    let progress = sweeper / (SweeperMax - SweeperMin);
    return v1 * (1 - progress) + v2 * progress;
}

function getClosestCell(row, col) {
    for (let i = 1; i < textWidth / 2; ++i) {
        for (let j = -i; j <= i; j += 2 * i) {
            if (col + j < 0 || col + j >= textWidth) {
                continue;
            }
            if (text[row][col + j] > 0) {
                return Math.round(text[row][col + j] / (i * 1))
            }
        }
    }
    return 0;
}

function getAverageAlpha(fuzzY, fuzzX, row, col) {
    let count = 0;
    let sum = 0;
    for (let r = -fuzzY; r <= fuzzY; ++r) {
        for (let c = -fuzzX; c <= fuzzX; ++c) {
            let a = getPixelAlpha(row + r, col + c);
            let distance = Math.sqrt(r * r + c * c);
            sum += distance == 0 ? a : a / (distance * 2);
            ++count;
        }
    }
    return sum / count;
}

function getPixelAlpha(textRow, textCol) {
    if (textCol < 0 || textCol >= textWidth || textRow < 0 || textRow >= textHeight) {
        return 0;
    }
    let v = text[textRow][textCol]
    if (v > 0) {
        addedPixels[addedPixels.length] = [textRow, textCol];
    }
    return v;
}

var addedPixels = [];
function sweep(direction) {

    sweeper += (SweeperStep * sweepDir);
    if (sweeper >= SweeperMax) {
        for (let row = 0; row < textHeight; ++row) {
            for (let col = 0; col < (textWidth - 1); ++col) {
                text[row][col] = text[row][col + 1]
            }
            text[row][(textWidth - 1)] = text[row][0]
        }
        sweeper = startOver ? SweeperMin : SweeperMax;
        sweepDir = startOver ? sweepDir : -sweepDir;
    }
    if (sweeper < SweeperMin) {
        sweepDir = -sweepDir;
        sweeper = SweeperMin;
    }

    addedPixels = [];
    for (let i = 0; i < NBulbs; ++i) {
        bulbs[i].color = [0, 0, 0];
        let v = 0;
        if (text != null && bulbs[i].location[Z] > -0.2) {
            let yLoc = (0 + ((bulbs[i].location[Y] + 1) / 2.0)) * textHeight;
            let textRow = Math.floor(yLoc);
            let textCol = Math.floor((1 - ((bulbs[i].location[X] + 1) / 2.0)) * (textHeight/1.0))
            // let v1 = getPixelAlpha(textRow, textCol);
            // let v2 = getPixelAlpha(textRow, textCol + 1);
            // v = interpolateValues(v1, v2);
            // v = getPixelAlpha(textRow, textCol);
            v = getAverageAlpha(2,3, textRow, textCol);
            // if (v > 0) v = 1;
        }
        // v *= 1 - Math.abs(bulbs[i].location[Z] - 1)/2;
        bulbs[i].val = v;//((19 * bulbs[i].val) + v) / 20; 
        vMax = Math.max(vMax, v)
        vMin = Math.min(vMin, v)
        range = vMax - vMin
        if (range > 0) {
            bulbs[i].color = heatMapColorforValue(bulbs[i].val / range)
        }
    }

}
