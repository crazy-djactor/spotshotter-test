export function makeSpiral(sourceMatrix) {
  const M = sourceMatrix.length;
  if (M === 0) {
    return [];
  }
  const N = sourceMatrix[0].length;
  let dr = [ 0, 1, 0, -1 ];
  let dc = [ 1, 0, -1, 0 ];
  let r = 0, c = 0, di = 0;

  let matrix = JSON.parse(JSON.stringify(sourceMatrix))
  let res = []
  for (let i = 0; i < M * N; i++) {
    res.push(matrix[r][c]);
    matrix[r][c] = -1;
    let cr = r + dr[di];
    let cc = c + dc[di];

    if (0 <= cr && cr < M && 0 <= cc && cc < N && matrix[cr][cc] !== -1) {
      r = cr;
      c = cc;
    }
    else {
      di = (di + 1) % 4;
      r += dr[di];
      c += dc[di];
    }
  }
  return res;
}