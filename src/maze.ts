const black = 255;

function pos(y: number, x: number, width: number): number {
    const position = width * y + x;
    return position << 2;
}

function openNorth(y: number, x: number, width: number, data: Buffer): boolean {
    return data[pos(y - 1, x, width)] === black;
}

function openSouth(y: number, x: number, width: number, data: Buffer): boolean {
    return data[pos(y + 1, x, width)] === black;
}

function openEast(y: number, x: number, width: number, data: Buffer): boolean {
    return data[pos(y, x + 1, width)] === black;
}

function openWest(y: number, x: number, width: number, data: Buffer): boolean {
    return data[pos(y, x - 1, width)] === black;
}

function adjecentOpenings(y: number, x: number, width: number, data: Buffer): number {
    let adjecentOpenings = 0;
    const on = openNorth(y, x, width, data);
    const os = openSouth(y, x, width, data);
    const oe = openEast(y, x, width, data);
    const ow = openWest(y, x, width, data);

    // two adjecent sides open (90 degree angle)
    if (on && ow) adjecentOpenings++;
    if (on && oe) adjecentOpenings++;
    if (os && ow) adjecentOpenings++;
    if (os && oe) adjecentOpenings++;

    // all adjecent sides closed but one
    if (on && !os && !oe && !ow) adjecentOpenings++;
    if (!on && os && !oe && !ow) adjecentOpenings++;
    if (!on && !os && oe && !ow) adjecentOpenings++;
    if (!on && !os && !oe && ow) adjecentOpenings++;

    return adjecentOpenings;
}

export class Point {
    constructor(readonly y: number, readonly x: number) {}
}

export class Maze {

    readonly points: Array<Point>;

    constructor(readonly width: number, readonly height: number, private data: Buffer) {
        this.points = new Array<Point>();
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const position = width * y + x;
                const i = position << 2;
                const open = data[i] === 255;

                // first row, entry
                if (open && y === 0 && openSouth(y, x, width, data)) {
                    this.addPoint(y, x);
                } 
                
                // last row, exit
                else if (open && y === height - 1 && openNorth(y, x, width, data)) {
                    this.addPoint(y, x);
                } 
                
                // middle rows
                else if (open && adjecentOpenings(y, x, width, data) > 0) {
                    this.addPoint(y, x);
                }
            }
        }
    }

    private addPoint(y: number, x: number) {
        console.log(`point found at y: ${y} x: ${x}`);
        this.points.push(new Point(y, x));
    }
}