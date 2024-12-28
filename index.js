const Jimp = require('jimp');

// 返回0-1的灰度值
function rgbaToGray(r, g, b, a) {
    // 使用加权平均法计算灰度值
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    // 如果需要考虑透明度，可以根据需要调整
    // 这里我们简单地返回灰度值
    return gray / 255
}

function rgbaToRgb(r, g, b, a) {
    a = a / 255;
    // 使用 Alpha 通道调整亮度
    const background = 1; // 假设背景是白色
    const newR = Math.round((1 - a) * background + a * r);
    const newG = Math.round((1 - a) * background + a * g);
    const newB = Math.round((1 - a) * background + a * b);
    return { r: newR, g: newG, b: newB };
}

// 上下两个像素点 简单平均
function averageColor(pixel1, pixel2) {
    const r = Math.round((pixel1.r + pixel2.r) / 2);
    const g = Math.round((pixel1.g + pixel2.g) / 2);
    const b = Math.round((pixel1.b + pixel2.b) / 2);
    return { r, g, b };
}

// 格式化颜色打印
function rgbText(r, g, b, text) {
    return `\x1b[38;2;${r};${g};${b}m${text}`; // \x1b[0m`;
}

function getBlock(top, bottom) {
    let block = ''
    if (top === 0 && bottom === 0) block = " "
    else if (top === 1 && bottom === 0) block = "▀"
    else if (top === 0 && bottom === 1) block = "▄"
    else if (top === 1 && bottom === 1) block = "█"
    return block
}

module.exports = function (imagePath,{ w = null, h = null, scale = 1}) {

    // 读取图像文件
    // Jimp.Jimp.read('_data/tempQRCode.png')
    Jimp.Jimp.read(imagePath)
        // Jimp.Jimp.read('_data/333.jpg')
        // Jimp.Jimp.read('_data/444.jpg')
        // Jimp.Jimp.read('_data/555.jpg')
        .then(async image => {
            // image.bitmap.width * 0.2 > 200 ? image.resize({ w: width }) : image.scale(scale)
            w && image.resize({ w })
            h && image.resize({ h })
            image.scale(scale)


            const width = image.bitmap.width;
            const height = image.bitmap.height;
            const imageArray = [];

            // 遍历每个像素并将其存储在二维数组中
            for (let y = 0; y < height; y += 2) {
                const row = [];
                for (let x = 0; x < width; x++) {
                    const pixelColor1 = image.getPixelColor(x, y);
                    const pixelColor2 = image.getPixelColor(x, y + 1);
                    const rgba1 = Jimp.intToRGBA(pixelColor1);
                    const rgba2 = Jimp.intToRGBA(pixelColor2);
                    const rgb1 = rgbaToRgb(rgba1.r, rgba1.g, rgba1.b, rgba1.a)
                    const rgb2 = rgbaToRgb(rgba2.r, rgba2.g, rgba2.b, rgba2.a)
                    const newRGB = averageColor(rgb1, rgb2)
                    // rgbText(newRGB.r, newRGB.g, newRGB.b, getBlock(rgbaToGray(rgba1.r, rgba1.g, rgba1.b, rgba1.a), rgbaToGray(rgba2.r, rgba2.g, rgba2.b, rgba2.a)))
                    const block = rgbText(newRGB.r, newRGB.g, newRGB.b, getBlock(1, 1))
                    row.push(block);
                }
                imageArray.push(row); // 将行数组推入图像数组
            }

            // 打印二维数组
            // console.log(imageArray);
            for (let i = 0; i < imageArray.length; i++) {
                const row = imageArray[i];
                console.log(row.join('') + '\x1b[0m')
            }
        })
        .catch(err => {
            console.error(err);
            console.log('finish')
        });


}