import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/cn';

interface ForwardExplosionProps {
  /** Jump sizes that fan out from each step. Defaults to [3, 5]. */
  jumpSizes?: number[];
  /** How many times the paths branch forward. Defaults to 3. */
  depth?: number;
  /** Caption shown beneath the diagram. */
  caption?: string;
}

interface TreeNode {
  id: string;
  value: number;
  depth: number;
  /** Center coordinates within the SVG. */
  cx: number;
  cy: number;
}

interface TreeEdge {
  id: string;
  from: TreeNode;
  to: TreeNode;
  depth: number;
}

const NODE_W = 34;
const NODE_H = 26;
const COL_GAP = 120;
const ROW_GAP = 22;
const X_START = 28;
const Y_PAD = 22;

// Build the forward "what can I reach next?" tree: from every step, draw a branch
// for each jump size. The point isn't the numbers — it's that the count of paths
// doubles at every level, exploding far faster than the staircase itself grows.
function buildTree(jumpSizes: number[], depth: number) {
  const nodes: TreeNode[] = [];
  const edges: TreeEdge[] = [];
  let leafSlot = 0;

  function build(value: number, d: number, id: string): TreeNode {
    const cx = X_START + d * COL_GAP + NODE_W / 2;
    if (d === depth) {
      const cy = Y_PAD + leafSlot * ROW_GAP + NODE_H / 2;
      leafSlot += 1;
      const leaf: TreeNode = { id, value, depth: d, cx, cy };
      nodes.push(leaf);
      return leaf;
    }
    const children = jumpSizes.map((j, k) => build(value + j, d + 1, `${id}.${k}`));
    const cy = (children[0].cy + children[children.length - 1].cy) / 2;
    const node: TreeNode = { id, value, depth: d, cx, cy };
    nodes.push(node);
    children.forEach((child) =>
      edges.push({ id: `${node.id}>${child.id}`, from: node, to: child, depth: d }),
    );
    return node;
  }

  build(0, 0, 'r');

  const leaves = nodes.filter((n) => n.depth === depth);
  const width = X_START + depth * COL_GAP + NODE_W + 84;
  const height = Y_PAD * 2 + (leaves.length - 1) * ROW_GAP + NODE_H;
  return { nodes, edges, leaves, width, height };
}

export function ForwardExplosion({
  jumpSizes = [3, 5],
  depth = 3,
  caption,
}: ForwardExplosionProps) {
  const reduceMotion = useReducedMotion();
  const { nodes, edges, leaves, width, height } = buildTree(jumpSizes, depth);

  // A cursor walks the levels left→right, revealing one generation of branches at
  // a time so the explosion is something you watch happen, then it holds on the
  // full tangle and replays. Reduced-motion users just get the finished picture.
  const lastLevel = depth - 1;
  const [cursor, setCursor] = useState(reduceMotion ? lastLevel : -1);

  useEffect(() => {
    if (reduceMotion) {
      setCursor(lastLevel);
      return;
    }
    const atEnd = cursor >= lastLevel;
    const delay = atEnd ? 1800 : cursor < 0 ? 500 : 620;
    const id = window.setTimeout(
      () => setCursor((c) => (c >= lastLevel ? -1 : c + 1)),
      delay,
    );
    return () => window.clearTimeout(id);
  }, [reduceMotion, cursor, lastLevel]);

  const pathFor = (e: TreeEdge) => {
    const sx = e.from.cx + NODE_W / 2;
    const sy = e.from.cy;
    const ex = e.to.cx - NODE_W / 2;
    const ey = e.to.cy;
    const mx = (sx + ex) / 2;
    return `M ${sx} ${sy} C ${mx} ${sy} ${mx} ${ey} ${ex - 5} ${ey}`;
  };

  return (
    <figure className="mx-auto w-full max-w-lg">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label="A tree of forward jumps that doubles at every level, fanning out into far more paths than can be counted."
          className="mx-auto block h-auto max-w-full"
        >
          <defs>
            <marker
              id="fe-arrowhead"
              markerWidth="7"
              markerHeight="7"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" className="fill-flame" />
            </marker>
            <linearGradient id="fe-fade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" className="[stop-color:var(--color-flame)]" stopOpacity="0.5" />
              <stop offset="100%" className="[stop-color:var(--color-flame)]" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Faded stubs leaving every leaf: the branching never actually stops. */}
          {cursor >= lastLevel &&
            leaves.flatMap((leaf, i) =>
              jumpSizes.map((_, k) => {
                const sx = leaf.cx + NODE_W / 2;
                const sy = leaf.cy;
                const ex = sx + 56;
                const ey = sy + (k - (jumpSizes.length - 1) / 2) * 9;
                return (
                  <path
                    key={`stub-${i}-${k}`}
                    d={`M ${sx} ${sy} C ${sx + 28} ${sy} ${sx + 28} ${ey} ${ex} ${ey}`}
                    stroke="url(#fe-fade)"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                  />
                );
              }),
            )}

          {edges
            .filter((e) => e.depth <= cursor)
            .map((e) => (
              <path
                key={e.id}
                pathLength={1}
                d={pathFor(e)}
                className={cn('fill-none stroke-flame', !reduceMotion && 'draw-arrow')}
                strokeWidth={2}
                strokeLinecap="round"
                markerEnd="url(#fe-arrowhead)"
              />
            ))}

          {nodes
            .filter((n) => n.depth <= cursor + 1)
            .map((n) => {
              const isRoot = n.depth === 0;
              return (
                <g
                  key={n.id}
                  className={cn(!reduceMotion && 'animate-pop-in')}
                  style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
                >
                  <rect
                    x={n.cx - NODE_W / 2}
                    y={n.cy - NODE_H / 2}
                    width={NODE_W}
                    height={NODE_H}
                    rx={7}
                    className={cn(
                      'fill-surface',
                      isRoot ? 'stroke-flame' : 'stroke-line',
                    )}
                    strokeWidth={isRoot ? 2.5 : 1.5}
                  />
                  <text
                    x={n.cx}
                    y={n.cy + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={cn(
                      'text-[11px] font-semibold tabular-nums',
                      isRoot ? 'fill-flame' : 'fill-ink-soft',
                    )}
                  >
                    {n.value}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-muted">{caption}</figcaption>
      )}
    </figure>
  );
}
