import './dropdown.js';
import { createBoard, clearFunction, clearBoard, runAStartAlgorithm } from './board.js';
import { addEvents } from './events.js';

document.getElementById('startButton').addEventListener('click', () => {
    clearFunction();
    runAStartAlgorithm();
});
document.getElementById('clearBoardButton').addEventListener('click', clearBoard);
document.getElementById('clearPathButton').addEventListener('click', clearFunction);

createBoard();
addEvents();
