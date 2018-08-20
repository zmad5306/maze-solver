import { DepthFirstSolver } from './solver';
import { Maze } from './maze';
import { pngFactory } from './png-utils';

const args = process.argv.slice(2);
const path = args[0];
const png = pngFactory(path);
const maze = new Maze(png.width, png.height, png.data);
console.log('intersections', maze.intersections.length);
const solution = new DepthFirstSolver().solve(maze)
console.log('solution', solution);