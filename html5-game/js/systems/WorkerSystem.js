// ===================================
// RTS: ยุทธการไทย - Worker System
// Resource gathering like Warcraft
// ===================================

export class WorkerSystem {
    constructor(game) {
        this.game = game;

        // Resource nodes
        this.resourceNodes = [];

        // Worker assignments
        this.workerAssignments = new Map();

        // Settings
        this.harvestRate = {
            food: 5,   // per second
            gold: 3
        };
        this.carryCapacity = {
            food: 10,
            gold: 8
        };
        this.depositRange = 100;
    }

    /**
     * Initialize resource nodes from map data
     */
    initFromMap(mapData) {
        this.resourceNodes = [];

        // Add resource nodes from map features
        for (const feature of (mapData.features || [])) {
            if (feature.type === 'rice_field' || feature.resourceType === 'food') {
                this.addResourceNode({
                    type: 'food',
                    x: feature.x + feature.width / 2,
                    y: feature.y + feature.height / 2,
                    amount: feature.amount || 1000,
                    maxAmount: feature.amount || 1000,
                    icon: '🌾'
                });
            } else if (feature.type === 'gold_mine' || feature.resourceType === 'gold') {
                this.addResourceNode({
                    type: 'gold',
                    x: feature.x + feature.width / 2,
                    y: feature.y + feature.height / 2,
                    amount: feature.amount || 800,
                    maxAmount: feature.amount || 800,
                    icon: '💰'
                });
            }
        }

        // Add default resource nodes if none exist
        if (this.resourceNodes.length === 0) {
            // Add some default resource nodes near player base
            this.addResourceNode({
                type: 'food',
                x: 400,
                y: 600,
                amount: 1000,
                maxAmount: 1000,
                icon: '🌾'
            });
            this.addResourceNode({
                type: 'gold',
                x: 600,
                y: 500,
                amount: 800,
                maxAmount: 800,
                icon: '💰'
            });
        }
    }

    /**
     * Add a resource node
     */
    addResourceNode(node) {
        this.resourceNodes.push({
            id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...node,
            workersAssigned: []
        });
    }

    /**
     * Assign worker to harvest from resource
     */
    assignWorker(worker, resourceNode) {
        if (!worker || worker.type !== 'worker') return false;

        // Remove from previous assignment
        this.unassignWorker(worker);

        // Assign to new resource
        this.workerAssignments.set(worker.id, {
            resourceNode,
            state: 'moving_to_resource', // moving_to_resource, harvesting, returning, depositing
            carrying: 0,
            carryType: resourceNode.type
        });

        resourceNode.workersAssigned.push(worker.id);

        // Set worker target
        worker.targetResource = resourceNode;
        worker.state = 'gathering';

        return true;
    }

    /**
     * Unassign worker from current task
     */
    unassignWorker(worker) {
        const assignment = this.workerAssignments.get(worker.id);
        if (assignment) {
            const node = assignment.resourceNode;
            const idx = node.workersAssigned.indexOf(worker.id);
            if (idx !== -1) {
                node.workersAssigned.splice(idx, 1);
            }
            this.workerAssignments.delete(worker.id);
        }
    }

    /**
     * Update all worker gathering
     */
    update(deltaTime) {
        for (const [workerId, assignment] of this.workerAssignments) {
            const worker = this.game.units.find(u => u.id === workerId);
            if (!worker || worker.state === 'dead') {
                this.workerAssignments.delete(workerId);
                continue;
            }

            this.updateWorker(worker, assignment, deltaTime);
        }
    }

    /**
     * Update individual worker
     */
    updateWorker(worker, assignment, deltaTime) {
        const node = assignment.resourceNode;

        switch (assignment.state) {
            case 'moving_to_resource':
                // Check if arrived at resource
                const distToResource = Math.hypot(worker.x - node.x, worker.y - node.y);
                if (distToResource < 40) {
                    assignment.state = 'harvesting';
                    worker.state = 'harvesting';
                } else if (worker.state !== 'moving') {
                    // Move to resource
                    worker.moveTo(node.x, node.y);
                }
                break;

            case 'harvesting':
                // Harvest resources
                if (node.amount > 0) {
                    const harvestAmount = this.harvestRate[node.type] * deltaTime;
                    const actualHarvest = Math.min(harvestAmount, node.amount,
                        this.carryCapacity[node.type] - assignment.carrying);

                    assignment.carrying += actualHarvest;
                    node.amount -= actualHarvest;

                    // Check if full or node depleted
                    if (assignment.carrying >= this.carryCapacity[node.type] || node.amount <= 0) {
                        assignment.state = 'returning';
                        worker.state = 'returning';

                        // Find nearest deposit building
                        const depositBuilding = this.findNearestDepositBuilding(worker, node.type);
                        if (depositBuilding) {
                            worker.moveTo(depositBuilding.x, depositBuilding.y);
                            assignment.depositTarget = depositBuilding;
                        }
                    }
                } else {
                    // Node depleted, find another
                    this.findNewResource(worker, node.type);
                }
                break;

            case 'returning':
                // Check if arrived at deposit building
                const target = assignment.depositTarget;
                if (target) {
                    const distToDeposit = Math.hypot(worker.x - target.x, worker.y - target.y);
                    if (distToDeposit < this.depositRange) {
                        assignment.state = 'depositing';
                    } else if (worker.state !== 'moving') {
                        worker.moveTo(target.x, target.y);
                    }
                }
                break;

            case 'depositing':
                // Deposit resources
                this.game.resources[assignment.carryType] += assignment.carrying;
                assignment.carrying = 0;

                // Go back to resource
                if (node.amount > 0) {
                    assignment.state = 'moving_to_resource';
                    worker.moveTo(node.x, node.y);
                } else {
                    // Find new resource
                    this.findNewResource(worker, node.type);
                }
                break;
        }
    }

    /**
     * Find nearest deposit building for resource type
     */
    findNearestDepositBuilding(worker, resourceType) {
        let nearest = null;
        let nearestDist = Infinity;

        // Town hall or specific storage buildings
        const validTypes = ['town_hall', 'storehouse'];
        if (resourceType === 'food') validTypes.push('granary');
        if (resourceType === 'gold') validTypes.push('treasury');

        for (const building of this.game.buildings) {
            if (!building.isEnemy && building.isComplete) {
                // For now, allow any friendly building as deposit
                const dist = Math.hypot(worker.x - building.x, worker.y - building.y);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = building;
                }
            }
        }

        return nearest;
    }

    /**
     * Find new resource node of same type
     */
    findNewResource(worker, resourceType) {
        let nearest = null;
        let nearestDist = Infinity;

        for (const node of this.resourceNodes) {
            if (node.type === resourceType && node.amount > 0) {
                const dist = Math.hypot(worker.x - node.x, worker.y - node.y);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = node;
                }
            }
        }

        if (nearest) {
            this.assignWorker(worker, nearest);
        } else {
            // No more resources of this type
            this.unassignWorker(worker);
            worker.state = 'idle';
        }
    }

    /**
     * Render resource nodes
     */
    renderResourceNodes(ctx, camera) {
        const zoom = camera.zoom || 1;

        for (const node of this.resourceNodes) {
            if (node.amount <= 0) continue;

            const screenX = (node.x - camera.x) * zoom;
            const screenY = (node.y - camera.y) * zoom;

            // Skip if off screen
            if (screenX < -50 || screenX > camera.width + 50 ||
                screenY < -50 || screenY > camera.height + 50) {
                continue;
            }

            // Draw resource node
            const size = 40 * zoom;

            // Glow effect
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, size);
            if (node.type === 'food') {
                gradient.addColorStop(0, 'rgba(46, 204, 113, 0.4)');
                gradient.addColorStop(1, 'rgba(46, 204, 113, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(241, 196, 15, 0.4)');
                gradient.addColorStop(1, 'rgba(241, 196, 15, 0)');
            }
            ctx.fillStyle = gradient;
            ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            ctx.fill();

            // Icon
            ctx.font = `${size * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(node.icon, screenX, screenY);

            // Amount indicator
            const percent = node.amount / node.maxAmount;
            ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
            ctx.font = `${10 * zoom}px Kanit`;
            ctx.fillText(Math.round(node.amount), screenX, screenY + size * 0.8);
        }
    }

    /**
     * Get resource node at position
     */
    getResourceAt(x, y) {
        for (const node of this.resourceNodes) {
            if (node.amount <= 0) continue;
            const dist = Math.hypot(x - node.x, y - node.y);
            if (dist < 50) {
                return node;
            }
        }
        return null;
    }
}
