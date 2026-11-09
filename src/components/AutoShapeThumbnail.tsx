import React, { useMemo } from 'react';
import type { AutoShapeDefinition, BezierNode } from '../types/editor';
import { evaluateAutoShape } from '../engine/autoshapes';

export interface AutoShapeThumbnailProps {
  shape: AutoShapeDefinition;
  width?: number;
  height?: number;
  className?: string;
}

function bezierNodesToSvgD(nodes: BezierNode[], closed: boolean, padX = 0, padY = 0): string {
  if (!nodes || nodes.length === 0) return '';
  const cmds: string[] = [
    `M ${(nodes[0].x + padX).toFixed(1)} ${(nodes[0].y + padY).toFixed(1)}`,
  ];

  for (let i = 0; i < nodes.length - 1; i++) {
    const curr = nodes[i];
    const next = nodes[i + 1];
    cmds.push(
      `C ${(curr.cp2x + padX).toFixed(1)} ${(curr.cp2y + padY).toFixed(1)}, ${(next.cp1x + padX).toFixed(1)} ${(next.cp1y + padY).toFixed(1)}, ${(next.x + padX).toFixed(1)} ${(next.y + padY).toFixed(1)}`
    );
  }

  if (closed && nodes.length > 1) {
    const last = nodes[nodes.length - 1];
    const first = nodes[0];
    cmds.push(
      `C ${(last.cp2x + padX).toFixed(1)} ${(last.cp2y + padY).toFixed(1)}, ${(first.cp1x + padX).toFixed(1)} ${(first.cp1y + padY).toFixed(1)}, ${(first.x + padX).toFixed(1)} ${(first.y + padY).toFixed(1)} Z`
    );
  }

  return cmds.join(' ');
}

interface CachedPreviewData {
  pathEntries: Array<{ d: string; closed: boolean; isOuter: boolean }>;
  controlPts: Array<{ x: number; y: number }>;
  viewW: number;
  viewH: number;
}

const thumbnailPreviewCache = new Map<string, CachedPreviewData>();

export const AutoShapeThumbnail: React.FC<AutoShapeThumbnailProps> = ({
  shape,
  width = 56,
  height = 38,
  className = '',
}) => {
  // Evaluate AutoShapes at a canonical reference coordinate space so multi-part
  // menu, dropdown, navbar, and layout sub-containers never crush or overlap inside small thumbnails.
  const pad = 14;
  const refW = 200;
  const refH = Math.max(110, Math.round((height / Math.max(1, width)) * refW));

  const previewData = useMemo(() => {
    const cacheKey = shape.isBuiltIn ? `${shape.id}:${refW}:${refH}` : '';
    if (cacheKey) {
      const hit = thumbnailPreviewCache.get(cacheKey);
      if (hit) return hit;
    }
    try {
      const evaluated = evaluateAutoShape(shape, refW, refH, shape.defaultParams);
      let minX = 0;
      let minY = 0;
      let maxX = refW;
      let maxY = refH;

      evaluated.paths.forEach((p) => {
        p.nodes.forEach((n) => {
          minX = Math.min(minX, n.x, n.cp1x, n.cp2x);
          minY = Math.min(minY, n.y, n.cp1y, n.cp2y);
          maxX = Math.max(maxX, n.x, n.cp1x, n.cp2x);
          maxY = Math.max(maxY, n.y, n.cp1y, n.cp2y);
        });
      });

      (evaluated.controlPoints || []).slice(0, 4).forEach((cp) => {
        minX = Math.min(minX, cp.x - 4);
        minY = Math.min(minY, cp.y - 4);
        maxX = Math.max(maxX, cp.x + 4);
        maxY = Math.max(maxY, cp.y + 4);
      });

      const offsetX = pad - minX;
      const offsetY = pad - minY;
      const viewW = Math.max(refW + pad * 2, Math.ceil(maxX - minX + pad * 2));
      const viewH = Math.max(refH + pad * 2, Math.ceil(maxY - minY + pad * 2));

      const pathEntries = evaluated.paths.map((p, idx) => ({
        d: bezierNodesToSvgD(p.nodes, p.closed, offsetX, offsetY),
        closed: p.closed,
        isOuter: idx === 0 && evaluated.paths.length > 1,
      }));
      const controlPts = (evaluated.controlPoints || []).slice(0, 4).map((cp) => ({
        x: Math.max(6, Math.min(viewW - 6, cp.x + offsetX)),
        y: Math.max(6, Math.min(viewH - 6, cp.y + offsetY)),
      }));
      const computed: CachedPreviewData = { pathEntries, controlPts, viewW, viewH };
      if (cacheKey) {
        thumbnailPreviewCache.set(cacheKey, computed);
      }
      return computed;
    } catch {
      return {
        pathEntries: [],
        controlPts: [],
        viewW: refW + pad * 2,
        viewH: refH + pad * 2,
      };
    }
  }, [shape, refW, refH]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${previewData.viewW} ${previewData.viewH}`}
      preserveAspectRatio="xMidYMid meet"
      className={`shrink-0 bg-[#0d0d0d] border border-[#292929] rounded-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {previewData.pathEntries.map((entry, idx) => (
        <path
          key={idx}
          d={entry.d}
          fill={
            entry.closed
              ? entry.isOuter
                ? 'rgba(229, 229, 229, 0.10)'
                : 'rgba(229, 229, 229, 0.22)'
              : 'none'
          }
          stroke="#e5e5e5"
          strokeWidth={4.5}
          strokeLinejoin="miter"
          strokeLinecap="square"
        />
      ))}
      {previewData.controlPts.map((pt, idx) => (
        <rect
          key={idx}
          x={pt.x - 5.5}
          y={pt.y - 5.5}
          width={11}
          height={11}
          fill="#ffffff"
          stroke="#0a0a0a"
          strokeWidth={2.2}
          transform={`rotate(45 ${pt.x} ${pt.y})`}
        />
      ))}
    </svg>
  );
};
