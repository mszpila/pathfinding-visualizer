export const cellId = (y, x) => `${y}-${x}`;

export const parseId = (id) => id.split('-').map(Number);

export const getNeighbours = (id, rows, cols) => {
    const [y, x] = parseId(id);
    return [[y, x + 1], [y, x - 1], [y + 1, x], [y - 1, x]]
        .filter(([ny, nx]) => ny >= 0 && ny < rows && nx >= 0 && nx < cols)
        .map(([ny, nx]) => cellId(ny, nx));
};
