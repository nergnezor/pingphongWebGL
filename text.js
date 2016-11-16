var ctx = document.createElement('canvas').getContext('2d');
ctx.width = 350;
ctx.height = 45;
ctx.font = "bold 60px Verdana";
ctx.fillStyle = "rgb(0, 0, 0)";

function textToPixels(txt) {
    var data32;                                       // we'll use uint32 for speed

    ctx.clearRect(0, 0, ctx.width, ctx.height);                        // clear canvas so we can
    ctx.fillText(txt.toUpperCase().split('').join(' '), 10, ctx.height);           // draw the text (default 10px)
// ctx.strokeText(txt, 0, ctx.height, ctx.width);

    // get a Uint32 representation of the bitmap:
    data32 = new Uint32Array(ctx.getImageData(0, 0, ctx.width, ctx.height).data.buffer);
    let image = []
    let i = 0
    for (let row = 0; row < ctx.height; ++row){
        image[row] = new Uint8Array(ctx.width)
        for (let col = 0; col < ctx.width; ++col){
            image[row][col] = data32[i++] >> 24 
        }
    }
    return image
}