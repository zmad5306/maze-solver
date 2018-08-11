import { createReadStream, createWriteStream } from 'fs';
import { PNG, PNGOptions } from 'pngjs';

// the model object
class Block {
    constructor(readonly open: Boolean, readonly x: number, readonly y: number) {};
}

// global variable to hold the data and possible paths
const args = process.argv.slice(2);
const inputFileName = args[0];
const src = createReadStream(inputFileName);
const png = new PNG({} as PNGOptions);
const data = new Array<Array<Block>>();
const paths = new Array<Array<Block>>();

// read the maze into memory storing Block objects
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

// returns all open adjecent blocks, these are possible next blocks in each path
function getOpenAdjecents(block: Block): Array<Block> {
    const x = block.x;
    const y = block.y;
    const adjecents = new Array<Block>();

    // north
    if (y > 0) {
        const adjecent = data[y-1][x];
        if (adjecent.open) {
            adjecents.push(adjecent);
        }
    }

    // west
    if (x > 0) {
        const adjecent = data[y][x-1];
        if (adjecent.open) {
            adjecents.push(adjecent);
        }

    }

    // south
    if (y + 1 < data.length) {
        const adjecent = data[y+1][x];
        if (adjecent.open) {
            adjecents.push(adjecent);
        }
    }

    // east
    if (x + 1 < data[y].length) {
        const adjecent = data[y][x+1];
        if (adjecent.open) {
            adjecents.push(adjecent);
        }
    }

    return adjecents;
}

// saves the path to a copy of the input image
function writeWinningImage(path: Array<Block>) {
    // open the input file, we are going to copy it and highlight the winning path
    const src = createReadStream(inputFileName);
    const srcPng = new PNG({} as PNGOptions);

    // file is opened start copying it
    srcPng.on('parsed', () => {

        // make a new file
        const png = new PNG({ width: srcPng.width, height: srcPng.height} as PNGOptions);
        // copy all data from src to new file
        png.data = srcPng.data;

        // overlay winning path with a different color
        path.forEach(b => {
            const position = png.width * b.y + b.x;
            const i = position << 2;
            png.data[i] = 124;
        });

        // write the winning file
        png.pack().pipe(createWriteStream(`winners/${Math.floor(Math.random() * (999999999 - 100000000) ) + 100000000}.png`)); 
    });
    
    // open the input file, this triggers on parsed
    src.pipe(srcPng);
}

// searches for all paths, the fucntion is invoked recursively
function findPath(block: Block, path: Array<Block> = []): void {
    // store the new path
    path.push(block);

    // if the path made it to the bottom of maze, it must be winner, there is only one open space in the last row of the maze
    if (block.y + 1 === data.length) {
        console.log('we have a winner');
        writeWinningImage(path);
    }

    // store the path if its new
    if (paths.indexOf(path) === -1) {
        paths.push(path);
    }

    // find the adjecent open blocks
    const adjecents = getOpenAdjecents(block);

    // follow the open adjecent blocks
    adjecents.forEach(b => {

        // only follow adjecent blocks that are not already in this path
        if (path.indexOf(b) === -1) {
            findPath(b, [...path]);
        }
    });
}

// function to solve the maze
function solve(): void {
    // get the first row and find the entry cell, there may be only one open cell in the top row
    const firstRow = data[0];
    if (firstRow) {
        firstRow.forEach(b => {
            if (b.open) {
                findPath(b);
            }
        });
    }
}

// input file is parsed and ready to be processed
png.on('parsed', () => {
    console.log('size', png.width, 'x', png.height);
    
    // load the maze into memory
    parse(png);

    //solve it
    solve();
});

// load the src file into the png object, this triggers, png.on parsed
src.pipe(png);