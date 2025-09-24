import { memo, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
} from 'reactflow';
import WorkflowNode from './WorkflowNode.jsx';
import WorkflowEdge from './WorkflowEdge.jsx';

const nodeTypes = { workflowNode: WorkflowNode };
const edgeTypes = { workflowEdge: WorkflowEdge };

function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDropTool,
  invalidHandles,
  validateConnection,
}) {
  const reactFlow = useReactFlow();

  const decoratedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        type: 'workflowNode',
        data: {
          ...node.data,
          highlight: invalidHandles?.[node.id] ?? [],
          validateConnection,
        },
      })),
    [invalidHandles, nodes, validateConnection]
  );

  const decoratedEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: 'workflowEdge',
      })),
    [edges]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData('application/reactflow');
      if (!raw) return;
      const tool = JSON.parse(raw);
      const position = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      onDropTool?.({ tool, position });
    },
    [onDropTool, reactFlow]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <ReactFlow
      nodes={decoratedNodes}
      edges={decoratedEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      fitView
      className="workbench-flow"
      proOptions={{ hideAttribution: true }}
    >
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="wf-edge-active" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(59,130,246,0.9)" />
            <stop offset="50%" stopColor="rgba(99,102,241,0.9)" />
            <stop offset="100%" stopColor="rgba(244,114,182,0.9)" />
          </linearGradient>
        </defs>
      </svg>
      <Background gap={32} size={1} className="opacity-40" />
      <MiniMap pannable zoomable className="!bg-white/10 !backdrop-blur" />
      <Controls className="!bg-white/10 !backdrop-blur" />
    </ReactFlow>
  );
}

export default memo(WorkflowCanvas);
