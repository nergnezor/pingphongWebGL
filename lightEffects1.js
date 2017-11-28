var SweeperStep = 4;
var sweeper = 0;
var searchers = []
var vMax = -9999;
var vMin = 9999;

var X = 0
var Y = 1
var Z = 2
var R = 3
var Phi = 4
class Searcher {
	constructor() {
		this.theta = 0.0
        this.thetaMove = 1.0
        this.yLocation = 0
        this.yMove = 0.0
        this.radius = 0.2
	}
    get Move()
    {
        this.thetaMove = (31*this.thetaMove + (Math.random() - 0.5)/2) / 32
        this.yMove = (31*this.yMove + 2*(Math.random() - 0.5)/1) / 32
        this.theta += this.thetaMove;
        this.yLocation += this.yMove;
        return [this.theta, this.yLocation]
    }
};
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

function interpolateLocations() {
    var p = [];
    var p1 = bulbs[Math.floor(sweeper)].location;
    var p2 = bulbs[(Math.floor(sweeper) + 1) % 50].location;
    for (let axis = X; axis <= Z; ++axis) {
        p[axis] = p1[axis] + (p2[axis] - p1[axis]) * (sweeper % 1.0);
    }
    return p;
}

function interpolateValues(v1, v2, d) {
    //     let w = sweeper * (SweeperMax / SweeperMin)
    //     return v1 * w + v2 * (1-w)
    let progress = sweeper / SweeperStep;
    // progress += d;
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

function getAverageAlpha(d, fuzzY, fuzzX, row, col) {
    let count = 0;
    let sum = 0;
    for (let r = -fuzzY; r <= fuzzY; ++r) {
        for (let c = -fuzzX; c <= fuzzX; ++c) {
            a = getPixelAlpha(row + r, col + c);
            let distance = Math.sqrt(r * r + c * c);
            // console.log(d)
            // a *= 1 - d;
            sum += a / (distance + 1 + d);
            // sum += a;
            ++count;
        }
    }
    return sum / count;
}

function getPixelAlpha(textRow, textCol) {
    while (textCol < 0) {
        textCol += textWidth;
    }
    while (textRow < 0) {
        textRow += textHeight;
    }
    return text[textRow % textHeight][textCol % textWidth]// == 0 ? 0 : 1
}

var addedPixels = [];
function sweepCanvas() {
    if (++sweeper == SweeperStep) {
        for (let row = 0; row < textHeight; ++row) {
            for (let col = 0; col < (textWidth - 1); ++col) {
                text[row][col] = text[row][col + 1]
            }
            text[row][(textWidth - 1)] = text[row][0]
        }
        sweeper = 0
    }

    addedPixels = [];
    for (let i = 0; i < NBulbs; ++i) {
        bulbs[i].color = [0, 0, 0];
        let v = 0;
        let textRow, textCol;
        if (text != null /*&& bulbs[i].location[Z] > -0.2*/) {
            let yLoc = (0 + ((bulbs[i].location[Y] + 1) / 2.0)) * textHeight;
            textRow = Math.floor(yLoc);
            let xLoc = ((bulbs[i].location[Phi] / (2 * Math.PI)) % 1) * (2.3 * textHeight);
            textCol = Math.max(1, Math.floor(xLoc));
            let distance = Math.max(xLoc % 1, 0.5 - xLoc % 1);
            let fuzz = [0, 0];
            let vCurrent = getAverageAlpha(distance, fuzz[0], fuzz[1], textRow, textCol);
            let vNext = getAverageAlpha(distance, fuzz[0], fuzz[1], textRow, textCol + 1);
            v = interpolateValues(vCurrent, vNext, distance);
            // v = vCurrent;
            // if (v > 0) {
            // }
            // else {
            // v = getClosestCell(textRow, textCol);
            // }
        }
        // v = sweeper == Math.floor(10 *  ((bulbs[i].location[Phi] / (2 * Math.PI)) % 1)) ? 1 : 0;
        // bulbs[i].val = ((3* bulbs[i].val) + v) / 4; 
        bulbs[i].val = Math.max(0, v);//((19 * bulbs[i].val) + v) / 20; 
        // bulbs[i].val = Math.sqrt(bulbs[i].val); 
        vMax = Math.max(vMax, bulbs[i].val)
        vMin = Math.min(vMin, bulbs[i].val)
        range = Math.max(1, vMax - vMin)
        bulbs[i].color = HSVtoRGB((0.3*(bulbs[i].val - vMin) / range), 1, 1)
        addedPixels[addedPixels.length] = [textRow, textCol, bulbs[i].val / range];
    }
}
var nSearchers = 3
var searchers = []
for (let i = 0; i < nSearchers; ++i) {
    searchers[i] = new Searcher()
} 
function sweep(direction) {
    for (let i = 0; i < searchers.length; ++i){
        [yLocation, theta] = searchers[i].Move
        yLocation = Math.max(-1, Math.min(1,yLocation))
        for (let j = 0; j < NBulbs; ++j) {
            if  (i == 0) {
                bulbs[j].val = vMax
            }
            let v = getDistance(bulbs[j].location, [Math.cos(theta), yLocation, Math.sin(theta)]);
//         bulbs[i].val = getDistance(bulbs[i].location, bulbs[iCurrent].location);
            bulbs[j].val = Math.min(v, bulbs[j].val)
            vMax = Math.max(vMax, v)
            vMin = Math.min(vMin, v)
            if (i == 2){
                range = Math.max(1, vMax - vMin)
                if (range > 0) {
                    bulbs[j].color = HSVtoRGB(1 - (1 * (bulbs[j].val - vMin) / range), 1, Math.max(0, 0.9 - (bulbs[j].val - vMin) / range))
//                     bulbs[j].color = HSVtoRGB(1 - ((i * 0.3) * (v - vMin) / range), 1, Math.max(0, 0.5 - (bulbs[j].val - vMin) / range))
    //             bulbs[i].color = heatMapColorforValue((bulbs[i].val - vMin) / range)
                }
            }
        }
    }
}
