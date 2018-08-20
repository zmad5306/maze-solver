import { Solver, Solution } from './solver';
export class Intersection {
    constructor(readonly intersectPoint: Point, readonly connections: Array<Intersection | null> = []) {}
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
                this.addIntersections(y, x, height, open, openings);
            }
        }
    }

    private addIntersections(y: number, x: number, height: number, open: Boolean, openings: Array<Boolean>): void {
        const openNorth = openings[0];
        const openSouth = openings[1];

        // first row, entry
        if (open && y === 0 && openSouth) {
            const intersection = this.addIntersection(y, x);
        } 
        
        // last row, exit
        else if (open && y === height - 1 && openNorth) {
            const intersection = this.addIntersection(y, x);
            intersection.connections.push(...this.addConnections(intersection))
        } 
        
        // middle rows
        else if (open && this.hasAdjecent(openings)) {
            const intersection = this.addIntersection(y, x);
        }
    }

    private findNorthConnection(intersection: Intersection): Intersection | null {
        let connectTo: Intersection | null = null;
        this.intersections.forEach(i => {
            // it's above
            if (i.intersectPoint.y < intersection.intersectPoint.y && i.intersectPoint.x === intersection.intersectPoint.x) {
                // not the first connection
                if (connectTo != null) {
                    // this intersection is closer
                    if (i.intersectPoint.y > connectTo.intersectPoint.y) {
                        connectTo = i;
                    }
                } 
                // first connection
                else {
                    connectTo = i;
                }
            }
        });
        return connectTo;
    }

    private findWestConnection(intersection: Intersection): Intersection | null {
        let connectTo: Intersection | null = null;
        this.intersections.forEach(i => {
            // it's left
            if (i.intersectPoint.x < intersection.intersectPoint.x && i.intersectPoint.y === intersection.intersectPoint.y) {
                // not the first connection
                if (connectTo != null) {
                    // this intersection is closer
                    if (i.intersectPoint.x > connectTo.intersectPoint.x) {
                        connectTo = i;
                    }
                } 
                // first connection
                else {
                    connectTo = i;
                }
            }
        });
        return connectTo;
    }

    private addConnections(intersection: Intersection): Array<Intersection | null> {
        const connections = new Array<Intersection | null>();
        connections.push(this.findNorthConnection(intersection)); // n
        connections.push(null) // s
        connections.push(null) // e
        connections.push(this.findWestConnection(intersection)) // w
        return connections;
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

    private addIntersection(y: number, x: number): Intersection {
        console.log(`intersection found at y: ${y} x: ${x}`);
        const intersection = new Intersection(new Point(y, x))
        this.intersections.push(intersection);
        return intersection;
    }
}