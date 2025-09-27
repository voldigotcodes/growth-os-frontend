import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';
import { glassWorkflow } from '../../utils/glassUI.js';

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
      {/* Main edge path */}
      <BaseEdge
        id={id}
        path={path}
        className={active ? 'stroke-fuchsia-400 stroke-[3px]' : glassWorkflow.edge}
        style={{
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
      />

      {/* Label */}
      {label && (
        <EdgeLabelRenderer>
          <span
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
            }}
            className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-white"
          >
            {label}
          </span>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(WorkflowEdge);