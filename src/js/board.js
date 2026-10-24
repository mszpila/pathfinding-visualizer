import { ROWS, COLS, STEP_MS } from './constants.js';
import { cellId } from './grid.js';
import { aStar } from './astar.js';
import { state } from './state.js';

export const getCell = (id) => document.getElementById(id);

export const createBoard = () => {
    const table = document.getElementById('board');
    for (let r = 0; r < ROWS; r++) {
        const row = table.insertRow(-1);
        row.setAttribute('id', 'row ' + r);
        for (let c = 0; c < COLS; c++) {
            const cell = row.insertCell(-1);
            cell.setAttribute('id', cellId(r, c));
            if (cell.id !== state.start && cell.id !== state.end) {
                cell.classList.add('unvisited');
            }
        }
    }
    getCell(state.start).classList.add('start');
    getCell(state.end).classList.add('end');
};

const isWallCell = (id) => getCell(id).className === 'wall';

const paintVisitedCell = (id) => {
    const cell = getCell(id);
    if (cell.className === 'unvisited') {
        cell.classList.remove('unvisited');
        cell.classList.add('visited');
    } else if (cell.className === 'start' || cell.className === 'unvisited end') {
        cell.classList.add('visited');
    }
};

const paintPathCell = (id) => getCell(id).classList.add('path');

const animateResult = (visited, path, reachedGoal) => {
    let i = 0;
    for (const id of visited.keys()) {
        setTimeout(() => paintVisitedCell(id), STEP_MS * i++);
    }
    if (reachedGoal) {
        path.forEach((id, j) => {
            setTimeout(() => paintPathCell(id), STEP_MS * (visited.size + j));
        });
    }
};

const drawResult = (visited, path, reachedGoal) => {
    for (const id of visited.keys()) {
        paintVisitedCell(id);
    }
    if (reachedGoal) {
        path.forEach(paintPathCell);
    }
};

export const validateWalls = () => {
    for (const id of state.walls) {
        const cell = getCell(id);
        if (cell.className === 'unvisited' || cell.className === 'visited') {
            cell.classList.remove('unvisited', 'visited');
            cell.classList.add('wall');
        }
    }
};

export const clearFunction = () => {
    for (const id of state.visited.keys()) {
        const cell = getCell(id);
        if (cell.classList.contains('visited') && !cell.classList.contains('start')) {
            cell.classList.remove('visited');
            cell.classList.add('unvisited');
        } else if (cell.classList.contains('start')) {
            cell.classList.remove('visited');
        }
        cell.classList.remove('path');
    }
    state.visited = new Map();
    state.path = [];
    state.algoClicked = false;
    state.reachedGoal = false;
};

export const clearBoard = () => {
    clearFunction();
    for (const id of state.walls) {
        const cell = getCell(id);
        if (cell.classList.contains('wall')) {
            cell.classList.remove('wall');
            cell.classList.add('unvisited');
        }
    }
    state.walls = new Set();
};

export const startAlgorithm = (instant = false) => {
    state.algoClicked = true;
    const { visited, path, reachedGoal } = aStar({
        start: state.start,
        end: state.end,
        rows: ROWS,
        cols: COLS,
        isWall: isWallCell,
    });
    Object.assign(state, { visited, path, reachedGoal });
    if (instant) {
        drawResult(visited, path, reachedGoal);
    } else {
        animateResult(visited, path, reachedGoal);
    }
};

export const runAStartAlgorithm = () => startAlgorithm();

export const addWall = (id) => {
    state.walls.add(id);
};

export const removeWall = (id) => {
    state.walls.delete(id);
};
