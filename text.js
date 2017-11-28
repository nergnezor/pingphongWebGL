var ctx = document.getElementById('screen').getContext('2d');
ctx.width = 200;
ctx.height = 30;
// ctx.font = "46px Calibri";
// ctx.font = "40px Comic Sans Ms";
// ctx.font = "42px sans-serif";
ctx.font = "44px Schweiz";
ctx.fillStyle = "rgb(0, 0, 0)";

function textToPixels(txt) {
    let image = []
    var data32;                                       // we'll use uint32 for speed

    ctx.clearRect(0, 0, ctx.width, ctx.height);                        // clear canvas so we can
    // var img = new Image();
//     var img = document.getElementById('image');
//     img.crossOrigin = "anonymous";
    // img.src = 'mario.png';
//     img.onload = function () {
//         ctx.drawImage(img, 0, 0, ctx.width, ctx.height);
    //     originalImageData = ctx.canvas.toDataURL();
    // }

    ctx.fillText(txt.toUpperCase().split('').join('  '), 10, ctx.height);           // draw the text (default 10px)
    // ctx.strokeText(txt, 0, ctx.height, ctx.width);

    data32 = new Uint32Array(ctx.getImageData(0, 0, ctx.width, ctx.height).data.buffer);
    let i = 0
    for (let row = 0; row < ctx.height; ++row) {
        image[row] = new Uint8Array(ctx.width)
        for (let col = 0; col < ctx.width; ++col) {
            let v = data32[i++];
            image[row][col] = v >> 24;
            if (v != 0)
                console.log(v);
        }
    }
    return image
}
