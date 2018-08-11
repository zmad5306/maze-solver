import { readFile, createReadStream } from 'fs';
import { PNG, PNGOptions } from 'pngjs';

const src = createReadStream('src/tiny.png');
const png = new PNG({} as PNGOptions);
const parsedData = new Array<Array<Boolean>>();

function parse(png: PNG): void {
    for (let h = 0; h < png.height; h++) {
        let lineArray = new Array<Boolean>();
        for (let w = 0; w < png.width; w++) {
            var i = (png.width * h + w) << 2;
            lineArray.push(png.data[i] === 255);
        }
        parsedData.push(lineArray);
    }
    console.log(parsedData);
}

png.on('parsed', () => {
    console.log('size', png.width, 'x', png.height);
    parse(png);
});

src.pipe(png);