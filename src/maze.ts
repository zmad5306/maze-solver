export class Intersection {
    constructor(readonly intersectPoint: Point) {}
}

export class Point {
    constructor(readonly y: number, readonly x: number) {}
}

export class Maze {

    readonly intersections: Array<Intersection>;
    readonly black = 255;

    constructor(readonly width: number, readonly height: number, private data: Buffer) {
        this.intersections = new Array<Intersection>();
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const position = width * y + x;
                const i = position << 2;
                const open = data[i] === 255;

                // first row, entry
                if (open && y === 0 && this.openSouth(y, x, width, data)) {
                    this.addIntersection(y, x);
                } 
                
                // last row, exit
                else if (open && y === height - 1 && this.openNorth(y, x, width, data)) {
                    this.addIntersection(y, x);
                } 
                
                // middle rows
                else if (open && this.adjecentOpenings(y, x, width, data) > 0) {
                    this.addIntersection(y, x);
                }
            }
        }
    }

    private pos(y: number, x: number, width: number): number {
        const position = width * y + x;
        return position << 2;
    }

    private openNorth(y: number, x: number, width: number, data: Buffer): boolean {
        return data[this.pos(y - 1, x, width)] === this.black;
    }

    private openSouth(y: number, x: number, width: number, data: Buffer): boolean {
        return data[this.pos(y + 1, x, width)] === this.black;
    }

    private openEast(y: number, x: number, width: number, data: Buffer): boolean {
        return data[this.pos(y, x + 1, width)] === this.black;
    }

    private openWest(y: number, x: number, width: number, data: Buffer): boolean {
        return data[this.pos(y, x - 1, width)] === this.black;
    }

    private adjecentOpenings(y: number, x: number, width: number, data: Buffer): number {
        const on = this.openNorth(y, x, width, data);
        const os = this.openSouth(y, x, width, data);
        const oe = this.openEast(y, x, width, data);
        const ow = this.openWest(y, x, width, data);

        let adjecentOpenings = 0;

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

    private addIntersection(y: number, x: number) {
        console.log(`intersection found at y: ${y} x: ${x}`);
        this.intersections.push(new Intersection(new Point(y, x)));
    }
}