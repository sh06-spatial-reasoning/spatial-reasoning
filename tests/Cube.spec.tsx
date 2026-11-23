import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { Cube } from '../src/drawing/isometric/foreground/Cube'
import { DrawingProvider } from '../src/drawing/DrawingStore'
import { defaultDrawingDefinition } from '../src/Store'

async function renderCubeSvg() {
  const screen = await render(
    <DrawingProvider initialDefinition={defaultDrawingDefinition()}>
      <svg>
        <Cube cuboidIndex={0} x={0} y={0} z={0} spacing={4} cullFaces={[]} uncullLEdges={[]} cullObscured={[]} />
      </svg>
    </DrawingProvider>
  )
  return screen.asFragment().children[0]
}

test('renders 6 triangular faces', async () => {
  const svg = await renderCubeSvg()
  expect(svg.querySelectorAll('polygon')).toHaveLength(6)
})

test('renders 9 edges', async () => {
  const svg = await renderCubeSvg()
  expect(svg.querySelectorAll('path')).toHaveLength(9)
})

test('renders cube connectivity', async () => {
  const svg = await renderCubeSvg()
  const round = (n: number) => Math.round(n * 1000) / 1000

  // the "d" text of each edge, like "M 0,0 L 15,-8.66 "
  const pathDataList = Array.from(
    svg.querySelectorAll('path'),
    path => path.getAttribute('d') ?? ''
  )

  // [x1, y1, x2, y2] for each edge, rounded to avoid floating point differences
  const numbers = pathDataList.map(
    d => d.match(/-?\d+(?:\.\d+)?/g)?.map(Number).map(round) ?? []
  )

  // both end points of every edge as text, like "15,-8.66"
  const points = numbers.flatMap(
    n => [n.slice(0, 2), n.slice(2, 4)].map(p => p.join(','))
  )

  // how many edges touch each point
  const edgesAtPoint = new Map<string, number>()
  for (const point of points) {
    edgesAtPoint.set(point, (edgesAtPoint.get(point) ?? 0) + 1)
  }

  const pointCounts = Array.from(edgesAtPoint.values())

  // each edge is a straight line [x1, y1, x2, y2]
  expect(numbers.every(n => n.length === 4)).toBe(true)
  // 7 vertices
  expect(pointCounts).toHaveLength(7)
  // degrees of vertices for an isometric cube should always match this 
  expect(pointCounts.sort((a, b) => a - b)).toEqual([2, 2, 2, 3, 3, 3, 3])
})