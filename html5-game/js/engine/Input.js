// ===================================
// RTS: ยุทธการไทย - Input Handler v2
// Mouse, Keyboard, Camera controls
// ===================================

export class InputHandler {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;

        // Mouse state
        this.mouse = {
            x: 0,
            y: 0,
            worldX: 0,
            worldY: 0,
            leftDown: false,
            rightDown: false,
            middleDown: false
        };

        // Selection box
        this.selectionBox = {
            active: false,
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0
        };

        // Mouse drag for camera
        this.cameraDrag = {
            active: false,
            startX: 0,
            startY: 0,
            cameraStartX: 0,
            cameraStartY: 0
        };

        // Keyboard state
        this.keys = {};

        // Command mode
        this.commandMode = null; // null, 'move', 'attack'

        // Settings
        this.settings = {
            edgeScrollEnabled: true,
            cameraSpeed: 5
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        this.canvas.addEventListener('wheel', this.onWheel.bind(this));

        // Keyboard events
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onMouseDown(e) {
        this.updateMousePosition(e);

        if (e.button === 0) { // Left click
            this.mouse.leftDown = true;
            this.onLeftClick();
        } else if (e.button === 1) { // Middle click
            this.mouse.middleDown = true;
            this.startCameraDrag();
        } else if (e.button === 2) { // Right click
            this.mouse.rightDown = true;
            this.onRightClick();
        }
    }

    onMouseUp(e) {
        this.updateMousePosition(e);

        if (e.button === 0) {
            this.mouse.leftDown = false;
            this.onLeftRelease();
        } else if (e.button === 1) {
            this.mouse.middleDown = false;
            this.cameraDrag.active = false;
        } else if (e.button === 2) {
            this.mouse.rightDown = false;
        }
    }

    onMouseMove(e) {
        this.updateMousePosition(e);

        // Update selection box
        if (this.selectionBox.active) {
            this.selectionBox.endX = this.mouse.x;
            this.selectionBox.endY = this.mouse.y;
        }

        // Camera drag
        if (this.cameraDrag.active) {
            const dx = this.mouse.x - this.cameraDrag.startX;
            const dy = this.mouse.y - this.cameraDrag.startY;
            this.game.camera.x = this.cameraDrag.cameraStartX - dx;
            this.game.camera.y = this.cameraDrag.cameraStartY - dy;
        }
    }

    onWheel(e) {
        // Zoom camera
        const zoomSpeed = 0.15;
        const oldZoom = this.game.camera.zoom;

        if (e.deltaY < 0) {
            this.game.camera.zoom = Math.min(2.5, this.game.camera.zoom + zoomSpeed);
        } else {
            this.game.camera.zoom = Math.max(0.4, this.game.camera.zoom - zoomSpeed);
        }

        // Zoom towards mouse position
        if (oldZoom !== this.game.camera.zoom) {
            const zoomRatio = this.game.camera.zoom / oldZoom;
            // Keep mouse position stable (optional, can be complex)
        }
    }

    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        // Convert to world coordinates
        this.mouse.worldX = (this.mouse.x / this.game.camera.zoom) + this.game.camera.x;
        this.mouse.worldY = (this.mouse.y / this.game.camera.zoom) + this.game.camera.y;
    }

    startCameraDrag() {
        this.cameraDrag.active = true;
        this.cameraDrag.startX = this.mouse.x;
        this.cameraDrag.startY = this.mouse.y;
        this.cameraDrag.cameraStartX = this.game.camera.x;
        this.cameraDrag.cameraStartY = this.game.camera.y;
    }

    onLeftClick() {
        // Start selection box
        this.selectionBox.active = true;
        this.selectionBox.startX = this.mouse.x;
        this.selectionBox.startY = this.mouse.y;
        this.selectionBox.endX = this.mouse.x;
        this.selectionBox.endY = this.mouse.y;
    }

    onLeftRelease() {
        if (!this.selectionBox.active) return;

        const box = this.selectionBox;
        const boxWidth = Math.abs(box.endX - box.startX);
        const boxHeight = Math.abs(box.endY - box.startY);

        // If it's a click (small area), select single unit
        if (boxWidth < 5 && boxHeight < 5) {
            this.selectSingleUnit();
        } else {
            // Box selection
            this.selectUnitsInBox();
        }

        this.selectionBox.active = false;
    }

    selectSingleUnit() {
        // Clear previous selection unless shift is held
        if (!this.keys['Shift']) {
            this.game.clearSelection();
        }

        // Find unit under cursor
        const worldX = this.mouse.worldX;
        const worldY = this.mouse.worldY;

        // Check player units first
        for (const unit of this.game.units) {
            if (unit.team === 0 && unit.state !== 'dead' && unit.containsPoint(worldX, worldY)) {
                unit.selected = true;
                this.game.updateUnitPanel();
                return;
            }
        }

        // Check buildings
        for (const building of this.game.buildings) {
            if (building.team === 0 && building.containsPoint(worldX, worldY)) {
                building.selected = true;
                this.game.updateBuildingPanel(building);
                return;
            }
        }
    }

    selectUnitsInBox() {
        const box = this.selectionBox;
        const zoom = this.game.camera.zoom;

        const minX = Math.min(box.startX, box.endX) / zoom + this.game.camera.x;
        const maxX = Math.max(box.startX, box.endX) / zoom + this.game.camera.x;
        const minY = Math.min(box.startY, box.endY) / zoom + this.game.camera.y;
        const maxY = Math.max(box.startY, box.endY) / zoom + this.game.camera.y;

        // Clear previous selection unless shift is held
        if (!this.keys['Shift']) {
            this.game.clearSelection();
        }

        // Select player units in box
        for (const unit of this.game.units) {
            if (unit.team === 0 && unit.state !== 'dead') {
                if (unit.x >= minX && unit.x <= maxX &&
                    unit.y >= minY && unit.y <= maxY) {
                    unit.selected = true;
                }
            }
        }

        this.game.updateUnitPanel();
    }

    onRightClick() {
        const selectedUnits = this.game.getSelectedUnits();
        if (selectedUnits.length === 0) return;

        const worldX = this.mouse.worldX;
        const worldY = this.mouse.worldY;

        // Check if clicking on enemy
        let targetEnemy = null;
        for (const unit of this.game.units) {
            if (unit.team !== 0 && unit.state !== 'dead' && unit.containsPoint(worldX, worldY)) {
                targetEnemy = unit;
                break;
            }
        }

        if (targetEnemy) {
            // Attack command
            for (const unit of selectedUnits) {
                unit.attackTarget(targetEnemy);
            }
            this.game.createCommandEffect(worldX, worldY, 'attack');
        } else {
            // Move command with pathfinding
            this.moveUnitsToPoint(selectedUnits, worldX, worldY);
            this.game.createCommandEffect(worldX, worldY, 'move');
        }
    }

    moveUnitsToPoint(units, targetX, targetY) {
        // Formation movement - spread units around target point
        const count = units.length;
        const spacing = 45;
        const cols = Math.ceil(Math.sqrt(count));

        units.forEach((unit, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const offsetX = (col - (cols - 1) / 2) * spacing;
            const offsetY = (row - (Math.ceil(count / cols) - 1) / 2) * spacing;

            const finalX = targetX + offsetX;
            const finalY = targetY + offsetY;

            // Use pathfinding if available
            if (this.game.pathfinder) {
                const path = this.game.pathfinder.findPath(unit.x, unit.y, finalX, finalY);
                unit.setPath(path);
            } else {
                unit.moveTo(finalX, finalY);
            }
        });
    }

    onKeyDown(e) {
        this.keys[e.key] = true;

        // Hotkeys
        switch (e.key.toLowerCase()) {
            case 'a': // Attack move
                this.commandMode = 'attack';
                break;
            case 'm': // Move
                this.commandMode = 'move';
                break;
            case 's': // Stop
                for (const unit of this.game.getSelectedUnits()) {
                    unit.stop();
                }
                break;
            case 'h': // Hold position
                for (const unit of this.game.getSelectedUnits()) {
                    unit.holdPosition();
                }
                break;
            case 'escape':
                this.commandMode = null;
                this.game.togglePause();
                break;
            case ' ': // Space - center on selected units
                e.preventDefault();
                this.centerOnSelected();
                break;
        }

        // Number keys for control groups
        if (e.key >= '1' && e.key <= '9') {
            if (e.ctrlKey) {
                // Assign control group
                this.game.assignControlGroup(parseInt(e.key));
            } else {
                // Select control group
                this.game.selectControlGroup(parseInt(e.key));
            }
        }
    }

    onKeyUp(e) {
        this.keys[e.key] = false;
    }

    centerOnSelected() {
        const selected = this.game.getSelectedUnits();
        if (selected.length === 0) return;

        let totalX = 0, totalY = 0;
        for (const unit of selected) {
            totalX += unit.x;
            totalY += unit.y;
        }

        const centerX = totalX / selected.length;
        const centerY = totalY / selected.length;

        this.game.camera.x = centerX - this.game.camera.width / 2;
        this.game.camera.y = centerY - this.game.camera.height / 2;
    }

    update(deltaTime) {
        // Camera movement with keyboard
        const cameraSpeed = this.settings.cameraSpeed * 100 * deltaTime;

        if (this.keys['w'] || this.keys['W'] || this.keys['ArrowUp']) {
            this.game.camera.y -= cameraSpeed;
        }
        if (this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']) {
            this.game.camera.y += cameraSpeed;
        }
        if (this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft']) {
            this.game.camera.x -= cameraSpeed;
        }
        if (this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']) {
            this.game.camera.x += cameraSpeed;
        }

        // Edge scrolling
        if (this.settings.edgeScrollEnabled && !this.cameraDrag.active) {
            const edgeSize = 25;
            const edgeSpeed = this.settings.cameraSpeed * 80 * deltaTime;

            if (this.mouse.x < edgeSize && this.mouse.x >= 0) {
                this.game.camera.x -= edgeSpeed;
            } else if (this.mouse.x > this.canvas.width - edgeSize && this.mouse.x <= this.canvas.width) {
                this.game.camera.x += edgeSpeed;
            }
            if (this.mouse.y < edgeSize && this.mouse.y >= 0) {
                this.game.camera.y -= edgeSpeed;
            } else if (this.mouse.y > this.canvas.height - edgeSize && this.mouse.y <= this.canvas.height) {
                this.game.camera.y += edgeSpeed;
            }
        }

        // Clamp camera to map bounds
        const maxX = this.game.mapWidth - (this.game.camera.width / this.game.camera.zoom);
        const maxY = this.game.mapHeight - (this.game.camera.height / this.game.camera.zoom);

        this.game.camera.x = Math.max(0, Math.min(maxX, this.game.camera.x));
        this.game.camera.y = Math.max(0, Math.min(maxY, this.game.camera.y));
    }

    renderSelectionBox(ctx) {
        if (!this.selectionBox.active) return;

        const box = this.selectionBox;
        const x = Math.min(box.startX, box.endX);
        const y = Math.min(box.startY, box.endY);
        const w = Math.abs(box.endX - box.startX);
        const h = Math.abs(box.endY - box.startY);

        // Fill
        ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
        ctx.fillRect(x, y, w, h);

        // Border
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);
    }
}
