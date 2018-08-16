function openNorth(y: number, x: number, width: number, data: Buffer): boolean {
    const position = width * (y - 1) + x;
    const i = position << 2;
    return data[i] === 255;
}

function openSouth(y: number, x: number, width: number, data: Buffer): boolean {
    const position = width * (y + 1) + x;
    const i = position << 2;
    return data[i] === 255;
}

function openEast(y: number, x: number, width: number, data: Buffer): boolean {
    const position = width * y + (x + 1);
    const i = position << 2;
    return data[i] === 255;
}

function openWest(y: number, x: number, width: number, data: Buffer): boolean {
    const position = width * y + (x - 1);
    const i = position << 2;
    return data[i] === 255;
}

function countOpenSiblings(y: number, x: number, width: number, data: Buffer): number {
    let openSiblings = 0;

    // adjecent sides open (90 degree angle)
    if (openNorth(y, x, width, data) && openWest(y, x, width, data)) openSiblings++;
    if (openNorth(y, x, width, data) && openEast(y, x, width, data)) openSiblings++;
    if (openSouth(y, x, width, data) && openWest(y, x, width, data)) openSiblings++;
    if (openSouth(y, x, width, data) && openEast(y, x, width, data)) openSiblings++;

    // all adjecent sides closed but one
    if (openNorth(y, x, width, data) && !openSouth(y, x, width, data) && !openEast(y, x, width, data) && !openWest(y, x, width, data)) openSiblings++;
    if (!openNorth(y, x, width, data) && openSouth(y, x, width, data) && !openEast(y, x, width, data) && !openWest(y, x, width, data)) openSiblings++;
    if (!openNorth(y, x, width, data) && !openSouth(y, x, width, data) && openEast(y, x, width, data) && !openWest(y, x, width, data)) openSiblings++;
    if (!openNorth(y, x, width, data) && !openSouth(y, x, width, data) && !openEast(y, x, width, data) && openWest(y, x, width, data)) openSiblings++;

    return openSiblings;
}

function addPoint(y: number, x: number) {
    console.log(`point found at y: ${y} x: ${x}`);
}

export class Maze {
    public points: number;
    constructor(readonly width: number, readonly height: number, private data: Buffer) {
        this.points = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const position = width * y + x;
                const i = position << 2;
                const open = data[i] === 255;

                // first row, entry
                if (open && y === 0 && openSouth(y, x, width, data)) {
                    this.points++;
                    addPoint(y, x);
                } 
                
                // last row, exit
                else if (open && y === height - 1 && openNorth(y, x, width, data)) {
                    this.points++;
                    addPoint(y, x);
                } 
                
                // middle rows
                else if (open && countOpenSiblings(y, x, width, data) > 0) {
                    this.points++;
                    addPoint(y, x);
                }
            }
        }
    }
}