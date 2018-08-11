import { readFile, createReadStream, createWriteStream } from 'fs';
import { PNG, PNGOptions } from 'pngjs';
import { on } from 'cluster';

class Block {
    constructor(readonly open: Boolean, readonly x: number, readonly y: number) {};
}

const src = createReadStream('src/tiny.png');
const png = new PNG({} as PNGOptions);
const data = new Array<Array<Block>>();
const paths = new Array<Array<Block>>();

function parse(png: PNG): void {
    for (let h = 0; h < png.height; h++) {
        let lineArray = new Array<Block>();
        for (let w = 0; w < png.width; w++) {
            const position = png.width * h + w;
            const i = position << 2;
            const open = png.data[i] === 255;
            const block = new Block(open, w, h);
            lineArray.push(block);
        }
        data.push(lineArray);
    }
}

function getOpenAdjecents(block: Block): Array<Block> {
    const x = block.x;
    const y = block.y;
    const adjecents = new Array<Block>();
    if (y > 0) {
        const adjecent = data[y-1][x];
        if (adjecent.open) {
            adjecents.push(adjecent);
        }
    }
    if (x > 0) {
        const adjecent = data[y][x-1];
        if (adjecent.open) {
            adjecents.push(adjecent);
        }

    }
    if (y + 1 < data.length) {
        const adjecent = data[y+1][x];
        if (adjecent.open) {
            adjecents.push(adjecent);
        }
    }
    if (x + 1 < data[y].length) {
        const adjecent = data[y][x+1];
        if (adjecent.open) {
            adjecents.push(adjecent);
        }
    }
    return adjecents;
}

function writeWinningImage(path: Array<Block>) {
    const src = createReadStream('src/tiny.png');
    const srcPng = new PNG({} as PNGOptions);

    srcPng.on('parsed', () => {
        const png = new PNG({ width: srcPng.width, height: srcPng.height} as PNGOptions);
        png.data = srcPng.data;
        path.forEach(b => {
            const position = png.width * b.y + b.x;
            const i = position << 2;
            png.data[i] = 124;
        });
        png.pack().pipe(createWriteStream(`src/tiny${new Date().getTime().toString()}.png`)); 
    });
    
    src.pipe(srcPng);
}

function findPath(block: Block, path: Array<Block> = []): void {
    path.push(block);
    if (block.y + 1 === data.length) {
        console.log('we have a winner');
        writeWinningImage(path);
    }
    if (paths.indexOf(path) === -1) {
        paths.push(path);
    }
    const adjecents = getOpenAdjecents(block);
    if (adjecents.length > 0) {
        const adjecent = adjecents[0];
        if (path.indexOf(adjecent) === -1) {
            findPath(adjecents[0], path);
        }
    }
    if (adjecents.length > 1) {
        for (let i = 1; i < adjecents.length; i++) {
            const adjecent = adjecents[i];
            if (path.indexOf(adjecent) === -1) {
                findPath(adjecent, [...path]);
            }
        }
    }
}

function solve(): void {
    const firstRow = data[0];
    if (firstRow) {
        firstRow.forEach(b => {
            if (b.open) {
                findPath(b);
            }
        });
    }
}

png.on('parsed', () => {
    console.log('size', png.width, 'x', png.height);
    parse(png);
    solve();
});

src.pipe(png);