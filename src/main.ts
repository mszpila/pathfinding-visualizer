function toggleDropdown(element: string): void {
    for (const dropdown of document.getElementsByClassName('dropdownMenu')) {
        if (dropdown.id !== element) {
            dropdown.classList.remove('show');
        }
    }
    document.getElementById(element)!.classList.toggle('show');
}

window.onclick = function(event: MouseEvent) {
    if (!(event.target as Element).matches('.dropOk')) {
        for (const dropdown of document.getElementsByClassName('dropdownMenu')) {
            dropdown.classList.remove('show');
        }
    }
}

type Marker = 'start' | 'end';

interface AStarOptions {
    start: string;
    end: string;
    rows: number;
    cols: number;
    isWall: (id: string) => boolean;
}

interface AStarResult {
    visited: GridNode[];
    path: string[];
    reachedGoal: boolean;
}

const ROWS = 18;
const COLS = 50;
const STEP_MS = 10;

let start = '10-7';
let end = '10-42';
let walls: string[] = [];

let isPressed = false;
let typeOfNode = '';
let algoClicked = false;

let visited: GridNode[] = [];
let path: string[] = [];
let reachedGoal = false;

const cellId = (y: number, x: number): string => `${y}-${x}`;

const parseId = (id: string): number[] => id.split('-').map(Number);

const heuristic = (id: string, target: string): number => {
    const [y1, x1] = parseId(id);
    const [y2, x2] = parseId(target);
    return Math.abs(y1 - y2) + Math.abs(x1 - x2);
};

class GridNode {
    constructor(
        public yx: string,
        public previousNode: GridNode | null,
        public score: number,
        public gScore: number,
        public toEndScore: number,
        public isWall: boolean,
        public isWeighted: boolean,
    ) {}
}

const createNode = (yx: string, previousNode: GridNode | null, gScore: number, target: string): GridNode => {
    const h = heuristic(yx, target);
    return new GridNode(yx, previousNode, gScore + h, gScore, h, false, false);
};

const getNeighbours = (id: string, rows: number, cols: number): string[] => {
    const [y, x] = parseId(id);
    return [[y, x + 1], [y, x - 1], [y + 1, x], [y - 1, x]]
        .filter(([ny, nx]) => ny >= 0 && ny < rows && nx >= 0 && nx < cols)
        .map(([ny, nx]) => cellId(ny, nx));
};

const pickBestNode = (nodes: GridNode[]): GridNode => {
    const lowestScore = Math.min(...nodes.map(node => node.score));
    const candidates = nodes.filter(node => node.score === lowestScore);
    const lowestEndScore = Math.min(...candidates.map(node => node.toEndScore));
    return candidates.find(node => node.toEndScore === lowestEndScore)!;
};

const buildPath = (lastNode: GridNode): string[] => {
    const result: string[] = [];
    for (let node: GridNode | null = lastNode; node !== null; node = node.previousNode) {
        result.push(node.yx);
    }
    return result.reverse();
};

const aStar = ({ start, end, rows, cols, isWall }: AStarOptions): AStarResult => {
    const toVisit: GridNode[] = [createNode(start, null, 0, end)];
    const closed: GridNode[] = [];

    while (toVisit.length) {
        const current = pickBestNode(toVisit);
        toVisit.splice(toVisit.findIndex(node => node.yx === current.yx), 1);
        closed.push(current);

        if (current.yx === end) {
            return { visited: closed, path: buildPath(current), reachedGoal: true };
        }

        for (const neighbourId of getNeighbours(current.yx, rows, cols)) {
            if (isWall(neighbourId) || closed.some(node => node.yx === neighbourId)) {
                continue;
            }

            const gScore = current.gScore + 1;
            const existing = toVisit.find(node => node.yx === neighbourId);

            if (!existing) {
                toVisit.push(createNode(neighbourId, current, gScore, end));
            } else if (gScore < existing.gScore) {
                existing.previousNode = current;
                existing.gScore = gScore;
                existing.score = gScore + existing.toEndScore;
            }
        }
    }

    return { visited: closed, path: [], reachedGoal: false };
};

const getCell = (id: string): HTMLElement => document.getElementById(id)!;

const createBoard = (): void => {
    const table = document.getElementById('board') as HTMLTableElement;
    for (let r = 0; r < ROWS; r++) {
        const row = table.insertRow(-1);
        row.setAttribute('id', 'row ' + r);
        for (let c = 0; c < COLS; c++) {
            const cell = row.insertCell(-1);
            cell.setAttribute('id', cellId(r, c));
            if (cell.id !== start && cell.id !== end) {
                cell.classList.add('unvisited');
            }
        }
    }
    getCell(start).classList.add('start');
    getCell(end).classList.add('end');
};

const isWallCell = (id: string): boolean => getCell(id).className === 'wall';

const paintVisitedCell = (id: string): void => {
    const cell = getCell(id);
    if (cell.className === 'unvisited') {
        cell.classList.remove('unvisited');
        cell.classList.add('visited');
    } else if (cell.className === 'start' || cell.className === 'unvisited end') {
        cell.classList.add('visited');
    }
};

const paintPathCell = (id: string): void => getCell(id).classList.add('path');

const animateResult = (visited: GridNode[], path: string[], reachedGoal: boolean): void => {
    visited.forEach((node, i) => {
        setTimeout(() => paintVisitedCell(node.yx), STEP_MS * i);
    });
    if (reachedGoal) {
        path.forEach((id, i) => {
            setTimeout(() => paintPathCell(id), STEP_MS * (visited.length + i));
        });
    }
};

const drawResult = (visited: GridNode[], path: string[], reachedGoal: boolean): void => {
    visited.forEach(node => paintVisitedCell(node.yx));
    if (reachedGoal) {
        path.forEach(paintPathCell);
    }
};

const validateWalls = (): void => {
    walls.map(getCell).forEach(cell => {
        if (cell.className === 'unvisited' || cell.className === 'visited') {
            cell.classList.remove('unvisited', 'visited');
            cell.classList.add('wall');
        }
    });
};

const clearFunction = (): void => {
    visited.forEach(node => {
        const cell = getCell(node.yx);
        if (cell.classList.contains('visited') && !cell.classList.contains('start')) {
            cell.classList.remove('visited');
            cell.classList.add('unvisited');
        } else if (cell.classList.contains('start')) {
            cell.classList.remove('visited');
        }
        cell.classList.remove('path');
    });
    visited = [];
    path = [];
    algoClicked = false;
    reachedGoal = false;
};

const clearBoard = (): void => {
    clearFunction();
    walls.map(getCell).forEach(cell => {
        if (cell.classList.contains('wall')) {
            cell.classList.remove('wall');
            cell.classList.add('unvisited');
        }
    });
    walls = [];
};

const startAlgorithm = (instant = false): void => {
    algoClicked = true;
    ({ visited, path, reachedGoal } = aStar({ start, end, rows: ROWS, cols: COLS, isWall: isWallCell }));
    if (instant) {
        drawResult(visited, path, reachedGoal);
    } else {
        animateResult(visited, path, reachedGoal);
    }
};

const runAStartAlgorithm = (): void => startAlgorithm();

const addWall = (id: string): void => {
    if (!walls.includes(id)) {
        walls.push(id);
    }
};

const removeWall = (id: string): void => {
    if (walls.includes(id)) {
        walls.splice(walls.indexOf(id), 1);
    }
};

const isDraggingStart = (): boolean => typeOfNode === 'start' || typeOfNode === 'start visited path';

const isDraggingEnd = (): boolean => typeOfNode === 'end' || typeOfNode === 'end path';

const isStartOrEnd = (cell: HTMLElement): boolean => cell.classList.contains('start') || cell.classList.contains('end');

const onMouseDown = (event: MouseEvent): void => {
    event.preventDefault();
    const cell = event.currentTarget as HTMLTableCellElement;
    typeOfNode = cell.className;

    if (cell.classList.contains('unvisited')) {
        cell.classList.remove('unvisited');
        cell.classList.add('wall');
        addWall(cell.id);
    } else if (cell.classList.contains('wall')) {
        cell.classList.remove('wall');
        cell.classList.add('unvisited');
        removeWall(cell.id);
    } else if (cell.classList.contains('visited') && !cell.classList.contains('start')) {
        cell.classList.remove(...cell.classList);
        cell.classList.add('wall');
        addWall(cell.id);
    }

    isPressed = true;
};

const onMouseUp = (): void => {
    isPressed = false;
};

const onMouseLeave = (event: MouseEvent): void => {
    if (!isPressed) {
        return;
    }
    const cell = event.currentTarget as HTMLTableCellElement;
    const marker: Marker | null = isDraggingStart() ? 'start' : isDraggingEnd() ? 'end' : null;
    if (marker) {
        cell.classList.remove(marker);
        cell.classList.add('unvisited');
        validateWalls();
    }
};

const moveMarker = (cell: HTMLTableCellElement, marker: Marker): void => {
    cell.classList.remove('wall', 'unvisited');
    cell.classList.add(marker);
    if (marker === 'start') {
        start = cell.id;
    } else {
        end = cell.id;
    }
    if (algoClicked) {
        clearFunction();
        startAlgorithm();
    }
    validateWalls();
};

const onMouseEnter = (event: MouseEvent): void => {
    if (!isPressed) {
        return;
    }
    const cell = event.currentTarget as HTMLTableCellElement;

    if (isDraggingStart()) {
        moveMarker(cell, 'start');
    } else if (isDraggingEnd()) {
        moveMarker(cell, 'end');
    } else if (['unvisited', 'visited', 'visited path'].includes(typeOfNode)) {
        if (!isStartOrEnd(cell)) {
            cell.classList.remove(...cell.classList);
            cell.classList.add('wall');
            addWall(cell.id);
        }
    } else if (typeOfNode === 'wall') {
        if (!isStartOrEnd(cell)) {
            cell.classList.remove('wall');
            cell.classList.add('unvisited');
            removeWall(cell.id);
        }
    }
};

const addEvents = (): void => {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = getCell(cellId(r, c));
            cell.onmousedown = onMouseDown;
            cell.onmouseup = onMouseUp;
            cell.onmouseleave = onMouseLeave;
            cell.onmouseenter = onMouseEnter;
        }
    }
};

createBoard();
addEvents();
