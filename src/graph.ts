const tinyMaze = [
    [ false, false, false, true, false, false, false, false, false, false ],
    [ false, true, true, true, true, true, true, true, true, false ],
    [ false, true, false, false, false, false, true, false, true, false ],
    [ false, true, true, true, false, true, true, false, true, false ],
    [ false, true, false, true, false, true, false, false, true, false ],
    [ false, true, true, true, true, true, false, true, true, false ],
    [ false, false, false, false, false, true, false, false, false, false ],
    [ false, true, false, true, false, true, false, false, true, false ],
    [ false, true, true, true, true, true, true, true, true, false ],
    [ false, false, false, false, false, false, false, true, false, false ]
];

let points = 0;

function openNorth(y: number, x: number): Boolean {
    const ny = y - 1;
    if (ny < 0) {
        return false;
    } else {
        return tinyMaze[ny][x];
    }
}

function openSouth(y: number, x: number): Boolean {
    const ny = y + 1;
    if (ny > tinyMaze.length - 1) {
        return false;
    } else {
        return tinyMaze[ny][x];
    }
}

function openEast(y: number, x: number): Boolean {
    const nx = x + 1;
    if (nx > tinyMaze[y].length - 1) {
        return false;
    } else {
        return tinyMaze[y][nx];
    }
}

function openWest(y: number, x: number): Boolean {
    const nx = x - 1;
    if (x < 0) {
        return false;
    } else {
        return tinyMaze[y][nx];
    }
}

function countOpenSiblings(y: number, x: number): number {
    let openSiblings = 0;

    // adjecent sides open (90 degree angle)
    if (openNorth(y, x) && openWest(y, x)) openSiblings++;
    if (openNorth(y, x) && openEast(y, x)) openSiblings++;
    if (openSouth(y, x) && openWest(y, x)) openSiblings++;
    if (openSouth(y, x) && openEast(y, x)) openSiblings++;

    // all adjecent sides closed but one
    if (openNorth(y, x) && !openSouth(y, x) && !openEast(y, x) && !openWest(y, x)) openSiblings++;
    if (!openNorth(y, x) && openSouth(y, x) && !openEast(y, x) && !openWest(y, x)) openSiblings++;
    if (!openNorth(y, x) && !openSouth(y, x) && openEast(y, x) && !openWest(y, x)) openSiblings++;
    if (!openNorth(y, x) && !openSouth(y, x) && !openEast(y, x) && openWest(y, x)) openSiblings++;

    return openSiblings;
}

function addPoint(y: number, x: number) {
    console.log(`point found at y: ${y} x: ${x}`);
}

for (let y = 0; y < tinyMaze.length; y++) {
    const row = tinyMaze[y];
    for (let x = 0; x < row.length; x++) {
        const open = row[x];

        // first row, entry
        if (open && y === 0 && openSouth(y, x)) {
            points++;
            addPoint(y, x);
        } 
        
        // last row, exit
        else if (open && y === tinyMaze.length - 1 && openNorth(y, x)) {
            points++;
            addPoint(y, x);
        } 
        
        // middle rows
        else if (open && countOpenSiblings(y, x) > 0) {
            points++;
            addPoint(y, x);
        }
    }
}

console.log('points', points);