import { Maze } from './maze';
import {PngWrapper, pngFactory} from './png-utils';

const args = process.argv.slice(2);
const path = args[0];
const png = pngFactory(path);
const maze = new Maze(png.width, png.height, png.data);
console.log('points', maze.points);