using System;
using System.Collections.Generic;

///////////////////////////////////////////////////////////////////////////////////////////////////////
/// THIS LOGIC TO GENRATE MAZES WAS OUT OF SCOPE FOR THIS EXERCISE AND THUS WAS WRITTEN BY CHAT GPT ///
///////////////////////////////////////////////////////////////////////////////////////////////////////

namespace MazeSolver
{
    /// <summary>
    /// Sophisticated maze generator using the Growing Tree family (DFS/Prim mix),
    /// optional braiding (dead-end removal), and seedable RNG.
    /// 0 = wall, 1 = path
    /// </summary>
    public static class MazeGen
    {
        public enum SelectionStrategy
        {
            Newest,  // Pure DFS: long corridors, fewer branches
            Oldest,  // Tends to be broad
            Random,  // Prim-like: bushy, lots of branches
            Mixed    // Weighted blend toward Newest (controlled by newestBias)
        }

        private struct Cell
        {
            public int R, C;
            public Cell(int r, int c) { R = r; C = c; }
        }

        /// <param name="size">Odd integer >= 5 (recommended 15, 21, 31, ...)</param>
        /// <param name="seed">Optional seed for reproducibility</param>
        /// <param name="braid">0.0..1.0 fraction of dead-ends to remove</param>
        /// <param name="strategy">Cell selection strategy (DFS/Prim/Mixed)</param>
        /// <param name="newestBias">When Mixed, 0..1 bias toward 'Newest' (DFS-like)</param>
        public static int[,] Generate(
            int size = 31,
            int? seed = null,
            double braid = 0.15,
            SelectionStrategy strategy = SelectionStrategy.Mixed,
            double newestBias = 0.7)
        {
            if (size < 5 || size % 2 == 0)
                throw new ArgumentException("Size must be odd and >= 5.");

            var rng = seed.HasValue ? new Random(seed.Value) : new Random();
            var maze = new int[size, size]; // defaults to 0 (walls)

            // Directions step by 2 (cells on odd coords are rooms; even are walls)
            int[][] dirs = {
                new[] { -2, 0 }, // N
                new[] {  2, 0 }, // S
                new[] {  0, 2 }, // E
                new[] {  0,-2 }  // W
            };

            // Start at random odd-odd cell
            int startR = RandomOdd(size, rng);
            int startC = RandomOdd(size, rng);

            maze[startR, startC] = 1;

            var active = new List<Cell>();
            active.Add(new Cell(startR, startC));

            // Growing Tree loop
            while (active.Count > 0)
            {
                int idx = SelectIndex(active.Count, strategy, newestBias, rng);
                var current = active[idx];

                // Gather unvisited neighbors two steps away
                var nexts = new List<int[]>();
                for (int i = 0; i < dirs.Length; i++)
                {
                    int nr = current.R + dirs[i][0];
                    int nc = current.C + dirs[i][1];

                    if (nr > 0 && nr < size - 1 && nc > 0 && nc < size - 1 && maze[nr, nc] == 0)
                        nexts.Add(dirs[i]);
                }

                if (nexts.Count == 0)
                {
                    // Dead end in carving; remove from active
                    active.RemoveAt(idx);
                    continue;
                }

                // Pick a random direction, carve wall + neighbor
                var d = nexts[rng.Next(nexts.Count)];
                int wr = current.R + d[0] / 2; // wall between
                int wc = current.C + d[1] / 2;
                int nr2 = current.R + d[0];
                int nc2 = current.C + d[1];

                maze[wr, wc] = 1;
                maze[nr2, nc2] = 1;
                active.Add(new Cell(nr2, nc2));
            }

            // Add entrance/exit
            maze[0, 1] = 1;
            maze[1, 1] = 1;
            maze[size - 1, size - 2] = 1;
            maze[size - 2, size - 2] = 1;

            // Braid (remove some dead-ends to create loops)
            if (braid > 0.0)
                Braid(maze, braid, rng);

            return maze;
        }

        private static int RandomOdd(int size, Random rng)
        {
            // returns 1..size-2 odd
            int v = 1 + 2 * rng.Next((size - 1) / 2);
            if (v >= size) v = size - 2; // safety
            if (v % 2 == 0) v++;         // ensure odd
            return Math.Min(v, size - 2);
        }

        private static int SelectIndex(int count, SelectionStrategy strategy, double newestBias, Random rng)
        {
            switch (strategy)
            {
                case SelectionStrategy.Newest:
                    return count - 1; // DFS-like
                case SelectionStrategy.Oldest:
                    return 0;
                case SelectionStrategy.Random:
                    return rng.Next(count); // Prim-like
                case SelectionStrategy.Mixed:
                default:
                    // Weighted coin: favor newest with 'newestBias'
                    if (rng.NextDouble() < newestBias) return count - 1;
                    return rng.Next(count);
            }
        }

        /// <summary>
        /// Remove some dead-ends by knocking through a side wall into an adjacent corridor,
        /// creating loops. 'fraction' = 0..1 of dead-ends to braid.
        /// </summary>
        private static void Braid(int[,] maze, double fraction, Random rng)
        {
            int rows = maze.GetLength(0), cols = maze.GetLength(1);
            var deadEnds = new List<Cell>();

            for (int r = 1; r < rows - 1; r += 1)
            {
                for (int c = 1; c < cols - 1; c += 1)
                {
                    if (maze[r, c] != 1) continue;
                    int open = 0;
                    if (maze[r - 1, c] == 1) open++;
                    if (maze[r + 1, c] == 1) open++;
                    if (maze[r, c - 1] == 1) open++;
                    if (maze[r, c + 1] == 1) open++;
                    if (open == 1) deadEnds.Add(new Cell(r, c));
                }
            }

            int toBraid = (int)Math.Round(deadEnds.Count * Math.Max(0.0, Math.Min(1.0, fraction)));
            Shuffle(deadEnds, rng);

            // Try to connect each chosen dead-end to another nearby corridor (2 cells away)
            for (int i = 0; i < toBraid && i < deadEnds.Count; i++)
            {
                var d = deadEnds[i];
                var options = new List<int[]>();

                // directions: try drilling into an adjacent wall that leads to another path
                int[][] dirs = { new[] { -1, 0 }, new[] { 1, 0 }, new[] { 0, 1 }, new[] { 0, -1 } };
                foreach (var v in dirs)
                {
                    int wr = d.R + v[0];
                    int wc = d.C + v[1];
                    int rr = d.R + 2 * v[0];
                    int cc = d.C + 2 * v[1];

                    if (rr <= 0 || rr >= rows - 1 || cc <= 0 || cc >= cols - 1)
                        continue;

                    // Only drill if opposite cell is already a passage & the wall is solid
                    if (maze[wr, wc] == 0 && maze[rr, cc] == 1)
                        options.Add(v);
                }

                if (options.Count > 0)
                {
                    var v = options[rng.Next(options.Count)];
                    maze[d.R + v[0], d.C + v[1]] = 1; // knock wall
                }
                // else: no good place to braid this dead-end; leave it
            }
        }

        private static void Shuffle<T>(IList<T> list, Random rng)
        {
            for (int i = list.Count - 1; i > 0; i--)
            {
                int j = rng.Next(i + 1);
                var tmp = list[i];
                list[i] = list[j];
                list[j] = tmp;
            }
        }

        // Pretty printer with colors (walls blue, paths default)
        // Pretty printer with colors
        public static void Print(int[,] grid)
        {
            int rows = grid.GetLength(0), cols = grid.GetLength(1);

            for (int r = 0; r < rows; r++)
            {
                for (int c = 0; c < cols; c++)
                {
                    if (grid[r, c] == 0) // wall
                    {
                        Console.ForegroundColor = ConsoleColor.DarkGray;
                        Console.Write("██");
                    }
                    else if (grid[r, c] == 2) // solution path
                    {
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write("██");
                    }
                    else // open path
                    {
                        Console.ResetColor();
                        Console.Write("  ");
                    }
                }
                Console.WriteLine();
            }
            Console.ResetColor();
}

    }
}
