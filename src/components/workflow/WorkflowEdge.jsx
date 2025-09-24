import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

function WorkflowEdge({ id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, data }) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const active = data?.active;
  const label = data?.dataType;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        className={`stroke-[3px] ${active ? 'stroke-[url(#wf-edge-active)] animate-dash' : 'stroke-white/40'}`}
      />
      {label ? (
        <EdgeLabelRenderer>
          <span
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
            }}
            className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-white/80 backdrop-blur"
          >
            {label}
          </span>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export default memo(WorkflowEdge);
