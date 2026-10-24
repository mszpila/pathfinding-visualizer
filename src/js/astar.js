import { parseId, getNeighbours } from './grid.js';

const heuristic = (id, target) => {
    const [y1, x1] = parseId(id);
    const [y2, x2] = parseId(target);
    return Math.abs(y1 - y2) + Math.abs(x1 - x2);
};

function Node(yx, previousNode, score, gScore, toEndScore, isWall, isWeighted) {
    this.yx = yx;
    this.previousNode = previousNode;
    this.score = score;
    this.gScore = gScore;
    this.toEndScore = toEndScore;
    this.isWall = isWall;
    this.isWeighted = isWeighted;
}

const createNode = (yx, previousNode, gScore, target) => {
    const h = heuristic(yx, target);
    return new Node(yx, previousNode, gScore + h, gScore, h, false, false);
};

const pickBestNode = (nodes) => {
    let best = null;
    for (const node of nodes.values()) {
        if (
            best === null ||
            node.score < best.score ||
            (node.score === best.score && node.toEndScore < best.toEndScore)
        ) {
            best = node;
        }
    }
    return best;
};

const buildPath = (lastNode) => {
    const result = [];
    for (let node = lastNode; node !== null; node = node.previousNode) {
        result.push(node.yx);
    }
    return result.reverse();
};

export const aStar = ({ start, end, rows, cols, isWall }) => {
    const toVisit = new Map([[start, createNode(start, null, 0, end)]]);
    const closed = new Map();

    while (toVisit.size) {
        const current = pickBestNode(toVisit);
        toVisit.delete(current.yx);
        closed.set(current.yx, current);

        if (current.yx === end) {
            return { visited: closed, path: buildPath(current), reachedGoal: true };
        }

        for (const neighbourId of getNeighbours(current.yx, rows, cols)) {
            if (isWall(neighbourId) || closed.has(neighbourId)) {
                continue;
            }

            const gScore = current.gScore + 1;
            const existing = toVisit.get(neighbourId);

            if (!existing) {
                toVisit.set(neighbourId, createNode(neighbourId, current, gScore, end));
            } else if (gScore < existing.gScore) {
                existing.previousNode = current;
                existing.gScore = gScore;
                existing.score = gScore + existing.toEndScore;
            }
        }
    }

    return { visited: closed, path: [], reachedGoal: false };
};
