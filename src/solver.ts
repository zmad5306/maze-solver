import { Maze } from './maze';

export class Solution {
    
}

export interface Solver {
    solve(maze: Maze): Solution;
}

export class DepthFirstSolver implements Solver {
    solve(maze: Maze): Solution {
        return {} as Solution;
    }
}