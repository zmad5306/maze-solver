using MazeSolver;

var size = 61;
var maze = MazeGen.Generate(size);
MazeGen.Print(maze);
Console.WriteLine();

Queue<Point> queue = new Queue<Point>();
List<Point> visited = new List<Point>();

Point start = null;
Point end = null;

for (int i = 0; i < size; i++)
{
    if (maze[0, i] == 1) 
    {
        start = new Point{
            x = 0,
            y = i
        };
    }
}

if (null != start)
{
    queue.Enqueue(start);
}

while (queue.Count > 0) {
    var point = queue.Dequeue();
    
    if (visited.Contains(point))
    {
        continue;
    }

    visited.Add(point);

    if (point.x == size - 1 && maze[point.x, point.y] == 1)
    {
        end = point;
    }

    if (point.y > 0)
    {
        // look left
        if (maze[point.x, point.y - 1] == 1)
        {
            var next = new Point() 
            { 
                x = point.x,
                y = point.y - 1,
                parent = point
            };
            queue.Enqueue(next);
        }
    }

    if (point.x > 0)
    {
        // look up
        if (maze[point.x - 1, point.y] == 1)
        {
            var next = new Point() 
            { 
                x = point.x - 1,
                y = point.y,
                parent = point
            };
            queue.Enqueue(next);
        }
    }

    if (point.y < size - 1)
    {
        // look right
        if (maze[point.x, point.y + 1] == 1)
        {
            var next = new Point() 
            { 
                x = point.x,
                y = point.y + 1,
                parent = point
            };
            queue.Enqueue(next);
        }
    }

    if (point.x < size - 1)
    {
        // look down
        if (maze[point.x + 1, point.y] == 1)
        {
            var next = new Point() 
            { 
                x = point.x + 1,
                y = point.y,
                parent = point
            };
            queue.Enqueue(next);
        }
    }
}

if (end != null)
{
    var parent = end;

    while (parent != null)
    {
        maze[parent.x, parent.y] = 2;
        parent = parent.parent;
    }

    MazeGen.Print(maze);
}

internal class Point() {
    public int x {get; set;}
    public int y {get; set;}
    public Point parent {get; set;}

    public override bool Equals(object obj)
    {
        if (obj is Point other)
        {
            return x == other.x && y == other.y;
        }
        return false;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(x, y);
    }
}
