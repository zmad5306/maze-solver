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

                const openings = this.getOpenings(y, x, width, data);
                const openNorth = openings[0];
                const openSouth = openings[1];

                // first row, entry
                if (open && y === 0 && openSouth) {
                    this.addIntersection(y, x);
                } 
                
                // last row, exit
                else if (open && y === height - 1 && openNorth) {
                    this.addIntersection(y, x);
                } 
                
                // middle rows
                else if (open && this.hasAdjecent(openings)) {
                    this.addIntersection(y, x);
                }
            }
        }
    }

    private hasAdjecent(openings: Array<Boolean>): Boolean {
        const openNorth = openings[0];
        const openSouth = openings[1];
        const openEast = openings[2];
        const openWest = openings[3];

         // two adjecent sides open (90 degree angle)
         if (
             openNorth && openWest || 
             openNorth && openEast || 
             openSouth && openWest || 
             openSouth && openEast
            )  {
                return true;
            }
         // all adjecent sides closed but one
         else if (
             openNorth && !openSouth && !openEast && !openWest || 
             !openNorth && openSouth && !openEast && !openWest || 
             !openNorth && !openSouth && openEast && !openWest || 
             !openNorth && !openSouth && !openEast && openWest) {
                 return true;
             }
         else {
             return false;
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

    private getOpenings(y: number, x: number, width: number, data: Buffer): Array<Boolean> {
        const openNorth = this.openNorth(y, x, width, data);
        const openSouth = this.openSouth(y, x, width, data);
        const openEast = this.openEast(y, x, width, data);
        const openWest = this.openWest(y, x, width, data);
        //north, south, east, west
        return [openNorth, openSouth, openEast, openWest];
    }

    private addIntersection(y: number, x: number) {
        console.log(`intersection found at y: ${y} x: ${x}`);
        this.intersections.push(new Intersection(new Point(y, x)));
    }
}