import type { Coordinates } from '@/drawing/isometric/foreground/IsometricStructure.tsx'


/**
 * Calculates where edges should be displayed from coordinates of a cube and a bitfield that represents neighbors.
 * @param coordinates - Coordinates of the cube.
 * @param inner - Bitfield for neighbors, from MSb to LSb: +z, +y, +x, -z, -y, -x. The bit zero if there is a neighbor.
 * @returns A generator that generates edges to be displayed, represents as a tuple of coordinates for start and end points.
 */
function* calculateCubeEdges(coordinates: Coordinates, inner: number): Generator<[Coordinates, Coordinates], void, number|undefined> {
  // if there are no neighbors surrounding an edge, the faces are not obscured, include the edge
  // if there are two neighbors surrounding an edge, this is the corner cube of an L-edge, include the edge
  // if there is just one neighbor, exclude the edge
  const { x, y, z } = coordinates

  const nearestCorner = { x: x + 0.5, y: y + 0.5, z: z + 0.5 }
  // render front prongs
  if ((inner & 0b011000) === 0b011000 || (inner & 0b011000) === 0) yield [nearestCorner, { x: x + 0.5, y: y + 0.5, z: z - 0.5 }]
  if ((inner & 0b101000) === 0b101000 || (inner & 0b101000) === 0) yield [nearestCorner, { x: x + 0.5, y: y - 0.5, z: z + 0.5 }]
  if ((inner & 0b110000) === 0b110000 || (inner & 0b110000) === 0) yield [nearestCorner, { x: x - 0.5, y: y + 0.5, z: z + 0.5 }]

  // render back prongs
  const farthestCorner = { x: x - 0.5, y: y - 0.5, z: z - 0.5 }
  if ((inner & 0b101) === 0b101 || (inner & 0b101) === 0) yield [farthestCorner, { x: x - 0.5, y: y + 0.5, z: z - 0.5 }]
  if ((inner & 0b011) === 0b011 || (inner & 0b011) === 0) yield [farthestCorner, { x: x - 0.5, y: y - 0.5, z: z + 0.5 }]
  if ((inner & 0b110) === 0b110 || (inner & 0b110) === 0) yield [farthestCorner, { x: x + 0.5, y: y - 0.5, z: z - 0.5 }]

  // render outlines
  if ((inner & 0b001100) === 0b001100 || (inner & 0b001100) === 0) yield [{ x: x + 0.5, y: y - 0.5, z: z - 0.5 }, { x: x + 0.5, y: y + 0.5, z: z - 0.5 }]
  if ((inner & 0b001010) === 0b001010 || (inner & 0b001010) === 0) yield [{ x: x + 0.5, y: y - 0.5, z: z - 0.5 }, { x: x + 0.5, y: y - 0.5, z: z + 0.5 }]
  if ((inner & 0b010100) === 0b010100 || (inner & 0b010100) === 0) yield [{ x: x - 0.5, y: y + 0.5, z: z - 0.5 }, { x: x + 0.5, y: y + 0.5, z: z - 0.5 }]
  if ((inner & 0b010001) === 0b010001 || (inner & 0b010001) === 0) yield [{ x: x - 0.5, y: y + 0.5, z: z - 0.5 }, { x: x - 0.5, y: y + 0.5, z: z + 0.5 }]
  if ((inner & 0b100001) === 0b100001 || (inner & 0b100001) === 0) yield [{ x: x - 0.5, y: y - 0.5, z: z + 0.5 }, { x: x - 0.5, y: y + 0.5, z: z + 0.5 }]
  if ((inner & 0b100010) === 0b100010 || (inner & 0b100010) === 0) yield [{ x: x - 0.5, y: y - 0.5, z: z + 0.5 }, { x: x + 0.5, y: y - 0.5, z: z + 0.5 }]
}

/**
 * Calculates edges for every cube individually, so touching cubes still show their borders.
 * Edges shared by two neighbouring cubes are only yielded once.
 * @param coordinates - List of cube coordinates.
 * @returns A generator that generates edges to be displayed, edges are represented as tuples of coordinates for start and end points.
 */
function* calculateEdgesAll(coordinates: Array<Coordinates>): Generator<[Coordinates, Coordinates], void, number|undefined> {
  const map = new Map<string, [Coordinates, Coordinates]>()

  // loop over all cubes, and store each of their 12 edges in the map
  for (const cube of coordinates) {
    for (const [start, end] of calculateCubeEdges(cube, 0b111111)) {
      // the key is the two end points, sorted so that start-to-end and end-to-start give the same key
      const key = [`${start.x} ${start.y} ${start.z}`, `${end.x} ${end.y} ${end.z}`].sort().join('|')
      map.set(key, [start, end])
    }
  }

  // loop again to hand out every edge that was stored
  for (const edge of map.values()) yield edge
}

export { calculateEdgesAll }