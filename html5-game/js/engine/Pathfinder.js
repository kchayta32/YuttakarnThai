// ===================================
// RTS: ยุทธการไทย - A* Pathfinding
// Grid-based pathfinding system
// ===================================

export class Pathfinder {
    constructor(game) {
        this.game = game;
        this.gridSize = 40; // Size of each grid cell
        this.grid = null;
        this.gridWidth = 0;
        this.gridHeight = 0;
        this.noiseSeed = 42.42; // Must match TerrainRenderer
    }

    /**
     * Initialize pathfinding grid from map
     */
    initGrid(mapWidth, mapHeight, obstacles) {
        this.gridWidth = Math.ceil(mapWidth / this.gridSize);
        this.gridHeight = Math.ceil(mapHeight / this.gridSize);

        // Create grid (0 = walkable, 1 = blocked)
        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = 0; // Default walkable
            }
        }

        // Mark obstacles
        for (const obs of obstacles) {
            this.markObstacle(obs);
        }
    }

    /**
     * Mark an area as blocked
     */
    markObstacle(obs) {
        if (obs.type === 'water' || obs.type === 'mountain') {
            const startX = Math.floor(obs.x / this.gridSize);
            const startY = Math.floor(obs.y / this.gridSize);
            const endX = Math.ceil((obs.x + obs.width) / this.gridSize);
            const endY = Math.ceil((obs.y + obs.height) / this.gridSize);

            for (let y = startY; y < endY && y < this.gridHeight; y++) {
                for (let x = startX; x < endX && x < this.gridWidth; x++) {
                    if (y >= 0 && x >= 0) {
                        this.grid[y][x] = 1;
                    }
                }
            }
        } else if (obs.type === 'forest') {
            // Mark individual trees as obstacles based on deterministic layout
            const treeDensity = 9000; // Match TerrainRenderer
            const treeCount = Math.floor((obs.width * obs.height) / treeDensity);
            const seed = obs.x * 7 + obs.y * 13;

            for (let i = 0; i < treeCount; i++) {
                const padding = 80;
                const treeX = obs.x - padding + this.pseudoRandomFloat(seed + i * 3) * (obs.width + padding * 2);
                const treeY = obs.y - padding + this.pseudoRandomFloat(seed + i * 5) * (obs.height + padding * 2);

                const gx = Math.floor(treeX / this.gridSize);
                const gy = Math.floor(treeY / this.gridSize);

                if (gy >= 0 && gy < this.gridHeight && gx >= 0 && gx < this.gridWidth) {
                    this.grid[gy][gx] = 1;
                }
            }
        }
    }

    /**
     * Add building as obstacle
     */
    addBuildingObstacle(building) {
        const size = building.size || 80;
        const halfSize = size / 2;

        const startX = Math.floor((building.x - halfSize) / this.gridSize);
        const startY = Math.floor((building.y - halfSize) / this.gridSize);
        const endX = Math.ceil((building.x + halfSize) / this.gridSize);
        const endY = Math.ceil((building.y + halfSize) / this.gridSize);

        for (let y = startY; y < endY && y < this.gridHeight; y++) {
            for (let x = startX; x < endX && x < this.gridWidth; x++) {
                if (y >= 0 && x >= 0) {
                    this.grid[y][x] = 1;
                }
            }
        }
    }

    /**
     * Convert world position to grid position
     */
    worldToGrid(x, y) {
        return {
            x: Math.floor(x / this.gridSize),
            y: Math.floor(y / this.gridSize)
        };
    }

    /**
     * Convert grid position to world position (center of cell)
     */
    gridToWorld(gx, gy) {
        return {
            x: gx * this.gridSize + this.gridSize / 2,
            y: gy * this.gridSize + this.gridSize / 2
        };
    }

    /**
     * Check if grid cell is walkable
     */
    isWalkable(gx, gy) {
        if (gx < 0 || gx >= this.gridWidth || gy < 0 || gy >= this.gridHeight) {
            return false;
        }
        return this.grid[gy][gx] === 0;
    }

    /**
     * A* Pathfinding algorithm
     * Returns array of {x, y} world positions or null if no path
     */
    findPath(startX, startY, endX, endY) {
        const start = this.worldToGrid(startX, startY);
        const end = this.worldToGrid(endX, endY);

        // Check if start or end is blocked
        if (!this.isWalkable(start.x, start.y)) {
            start.x = this.findNearestWalkable(start.x, start.y).x;
            start.y = this.findNearestWalkable(start.x, start.y).y;
        }

        if (!this.isWalkable(end.x, end.y)) {
            const nearest = this.findNearestWalkable(end.x, end.y);
            end.x = nearest.x;
            end.y = nearest.y;
        }

        // A* algorithm
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        const key = (x, y) => `${x},${y}`;

        gScore.set(key(start.x, start.y), 0);
        fScore.set(key(start.x, start.y), this.heuristic(start, end));
        openSet.push({ x: start.x, y: start.y });

        const directions = [
            { x: 0, y: -1 },  // up
            { x: 1, y: 0 },   // right
            { x: 0, y: 1 },   // down
            { x: -1, y: 0 },  // left
            { x: 1, y: -1 },  // up-right (diagonal)
            { x: 1, y: 1 },   // down-right
            { x: -1, y: 1 },  // down-left
            { x: -1, y: -1 }  // up-left
        ];

        let iterations = 0;
        const maxIterations = 1000;

        while (openSet.length > 0 && iterations < maxIterations) {
            iterations++;

            // Find node with lowest fScore
            openSet.sort((a, b) => {
                const fa = fScore.get(key(a.x, a.y)) || Infinity;
                const fb = fScore.get(key(b.x, b.y)) || Infinity;
                return fa - fb;
            });

            const current = openSet.shift();
            const currentKey = key(current.x, current.y);

            // Reached goal?
            if (current.x === end.x && current.y === end.y) {
                return this.reconstructPath(cameFrom, current);
            }

            closedSet.add(currentKey);

            // Check neighbors
            for (const dir of directions) {
                const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
                const neighborKey = key(neighbor.x, neighbor.y);

                if (closedSet.has(neighborKey)) continue;
                if (!this.isWalkable(neighbor.x, neighbor.y)) continue;

                // Diagonal movement check - prevent cutting corners
                if (dir.x !== 0 && dir.y !== 0) {
                    if (!this.isWalkable(current.x + dir.x, current.y) ||
                        !this.isWalkable(current.x, current.y + dir.y)) {
                        continue;
                    }
                }

                const moveCost = (dir.x !== 0 && dir.y !== 0) ? 1.414 : 1;
                const tentativeG = (gScore.get(currentKey) || 0) + moveCost;

                if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeG);
                    fScore.set(neighborKey, tentativeG + this.heuristic(neighbor, end));

                    if (!openSet.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        // No path found - return direct path
        return [this.gridToWorld(end.x, end.y)];
    }

    /**
     * Heuristic: Diagonal distance
     */
    heuristic(a, b) {
        const dx = Math.abs(a.x - b.x);
        const dy = Math.abs(a.y - b.y);
        return dx + dy + (1.414 - 2) * Math.min(dx, dy);
    }

    /**
     * Reconstruct path from A* result
     */
    reconstructPath(cameFrom, current) {
        const path = [];
        const key = (x, y) => `${x},${y}`;

        let node = current;
        while (node) {
            const worldPos = this.gridToWorld(node.x, node.y);
            path.unshift(worldPos);
            node = cameFrom.get(key(node.x, node.y));
        }

        // Smooth path by removing unnecessary waypoints
        return this.smoothPath(path);
    }

    /**
     * Smooth path by removing collinear points
     */
    smoothPath(path) {
        if (path.length <= 2) return path;

        const smoothed = [path[0]];

        for (let i = 1; i < path.length - 1; i++) {
            const prev = path[i - 1];
            const curr = path[i];
            const next = path[i + 1];

            // Check if direction changes
            const dir1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
            const dir2 = Math.atan2(next.y - curr.y, next.x - curr.x);

            if (Math.abs(dir1 - dir2) > 0.1) {
                smoothed.push(curr);
            }
        }

        smoothed.push(path[path.length - 1]);
        return smoothed;
    }

    /**
     * Find nearest walkable cell
     */
    findNearestWalkable(gx, gy) {
        const maxRadius = 10;

        for (let r = 1; r <= maxRadius; r++) {
            for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                    if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;

                    const nx = gx + dx;
                    const ny = gy + dy;

                    if (this.isWalkable(nx, ny)) {
                        return { x: nx, y: ny };
                    }
                }
            }
        }

        return { x: gx, y: gy };
    }

    /**
     * Debug: Render grid
     */
    renderDebug(ctx, camera) {
        ctx.globalAlpha = 0.3;

        const startX = Math.floor(camera.x / this.gridSize);
        const startY = Math.floor(camera.y / this.gridSize);
        const endX = Math.ceil((camera.x + camera.width) / this.gridSize);
        const endY = Math.ceil((camera.y + camera.height) / this.gridSize);

        for (let y = startY; y <= endY && y < this.gridHeight; y++) {
            for (let x = startX; x <= endX && x < this.gridWidth; x++) {
                if (y < 0 || x < 0) continue;

                const screenX = x * this.gridSize - camera.x;
                const screenY = y * this.gridSize - camera.y;

                if (this.grid[y][x] === 1) {
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(screenX, screenY, this.gridSize - 1, this.gridSize - 1);
                }
            }
        }

        ctx.globalAlpha = 1;
    }

    // Pseudo-random utilities (Must match TerrainRenderer)
    pseudoRandom(seed) {
        const x = Math.sin(seed + this.noiseSeed) * 10000;
        return Math.floor((x - Math.floor(x)) * 1000);
    }

    pseudoRandomFloat(seed) {
        return (this.pseudoRandom(seed) % 1000) / 1000;
    }
}
