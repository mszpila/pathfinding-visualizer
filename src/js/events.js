import { ROWS, COLS } from './constants.js';
import { cellId } from './grid.js';
import { state } from './state.js';
import { getCell, validateWalls, clearFunction, startAlgorithm, addWall, removeWall } from './board.js';

const START_DRAG_TYPES = new Set(['start', 'start visited path']);
const END_DRAG_TYPES = new Set(['end', 'end path']);
const WALL_DRAW_TYPES = new Set(['unvisited', 'visited', 'visited path']);

const isDraggingStart = () => START_DRAG_TYPES.has(state.typeOfNode);

const isDraggingEnd = () => END_DRAG_TYPES.has(state.typeOfNode);

const isStartOrEnd = (cell) => cell.classList.contains('start') || cell.classList.contains('end');

const onMouseDown = (event) => {
    event.preventDefault();
    const cell = event.currentTarget;
    state.typeOfNode = cell.className;

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

    state.isPressed = true;
};

const onMouseUp = () => {
    state.isPressed = false;
};

const onMouseLeave = (event) => {
    if (!state.isPressed) {
        return;
    }
    const cell = event.currentTarget;
    const marker = isDraggingStart() ? 'start' : isDraggingEnd() ? 'end' : null;
    if (marker) {
        cell.classList.remove(marker);
        cell.classList.add('unvisited');
        validateWalls();
    }
};

const moveMarker = (cell, marker) => {
    cell.classList.remove('wall', 'unvisited');
    cell.classList.add(marker);
    state[marker] = cell.id;
    if (state.algoClicked) {
        clearFunction();
        startAlgorithm();
    }
    validateWalls();
};

const onMouseEnter = (event) => {
    if (!state.isPressed) {
        return;
    }
    const cell = event.currentTarget;

    if (isDraggingStart()) {
        moveMarker(cell, 'start');
    } else if (isDraggingEnd()) {
        moveMarker(cell, 'end');
    } else if (WALL_DRAW_TYPES.has(state.typeOfNode)) {
        if (!isStartOrEnd(cell)) {
            cell.classList.remove(...cell.classList);
            cell.classList.add('wall');
            addWall(cell.id);
        }
    } else if (state.typeOfNode === 'wall') {
        if (!isStartOrEnd(cell)) {
            cell.classList.remove('wall');
            cell.classList.add('unvisited');
            removeWall(cell.id);
        }
    }
};

export const addEvents = () => {
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
