import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlowProvider,
  addEdge,
  MarkerType,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import GlassCard from '../components/GlassCard.jsx';
import { useToast } from '../components/ToastContext.jsx';
import WorkflowCanvas from '../components/workflow/WorkflowCanvas.jsx';
import WorkflowPalette from '../components/workflow/WorkflowPalette.jsx';
import WorkflowLibrary from '../components/workflow/WorkflowLibrary.jsx';
import WorkflowToolbar from '../components/workflow/WorkflowToolbar.jsx';
import WorkflowNodeConfigPanel from '../components/workflow/WorkflowNodeConfigPanel.jsx';
import OnboardingOverlay from '../components/workflow/OnboardingOverlay.jsx';
import QuickStartTemplates from '../components/workflow/QuickStartTemplates.jsx';
import WorkflowHistory from '../components/workflow/WorkflowHistory.jsx';
import RunSummaryDrawer from '../components/workflow/RunSummaryDrawer.jsx';
import useSmartDefaults from '../hooks/useSmartDefaults.js';
import { useFeatureFlags } from '../context/FeatureFlagContext.jsx';
import { useStatus, useStatusContext } from '../context/StatusContext.jsx';
import {
  createWorkflow,
  fetchWorkflowTools,
  fetchWorkflows,
  runWorkflow,
  updateWorkflow,
  fetchWorkflowTemplates,
  useWorkflowTemplate,
  fetchUserQuota,
  fetchWorkflowRuns,
  deleteWorkflow,
  clearWorkflows,
  deleteWorkflowRun,
  clearWorkflowRuns,
} from '../lib/apiClient.js';

const TOOL_ICONS = {
  downloader: '⬇️',
  refinery: '✏️',
  voice: '🎧',
  copywriter: '📝',
  editor: '🎬',
  publisher: '🚀',
};

function generateId(prefix) {
  let uuid = null;
  try {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      uuid = window.crypto.randomUUID();
    } else if (typeof self !== 'undefined' && self.crypto?.randomUUID) {
      uuid = self.crypto.randomUUID();
    } else if (typeof global !== 'undefined' && global.crypto?.randomUUID) {
      uuid = global.crypto.randomUUID();
    }
  } catch (error) {
    // ignore and fall back
  }
  if (uuid) return `${prefix}-${uuid}`;
  const fallback = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  return `${prefix}-${fallback}`;
}

function createNodePayload(tool, position) {
  const id = generateId('node');
  const inputPorts = tool.ports?.inputs ?? [];
  const outputPorts = tool.ports?.outputs ?? [];
  const defaults = tool.defaults ? JSON.parse(JSON.stringify(tool.defaults)) : {};
  return {
    id,
    position,
    data: {
      label: tool.label,
      toolType: tool.type,
      description: tool.description,
      inputs: inputPorts,
      outputs: outputPorts,
      configSchema: tool.config_schema ?? {},
      config: defaults,
      defaults,
      icon: tool.icon,
      status: 'idle',
      highlight: [],
    },
  };
}

function normalizePorts(portList, fallbackList, direction) {
  if (!Array.isArray(portList)) {
    return Array.isArray(fallbackList) ? fallbackList : [];
  }
  const metaById = new Map();
  const metaByType = new Map();
  (fallbackList ?? []).forEach((port) => {
    if (port?.id) metaById.set(port.id, port);
    if (port?.type) metaByType.set(port.type, port);
  });

  return portList.map((port, index) => {
    if (typeof port === 'string') {
      const meta = metaById.get(port) || metaByType.get(port);
      if (meta) return meta;
      return {
        id: `${direction}-${port}-${index}`,
        label: port,
        type: port,
        direction,
      };
    }
    if (port && typeof port === 'object') {
      const meta = port.id ? metaById.get(port.id) : metaByType.get(port.type);
      const base = meta || {};
      return {
        ...base,
        ...port,
        id: port.id ?? base.id ?? `${direction}-${port.type ?? `p${index}`}-${index}`,
        direction: port.direction ?? base.direction ?? direction,
      };
    }
    return null;
  }).filter(Boolean);
}

function formatDurationLabel(startIso, endIso) {
  try {
    const start = new Date(startIso);
    const end = endIso ? new Date(endIso) : new Date();
    const diffMs = end.getTime() - start.getTime();
    if (!Number.isFinite(diffMs) || diffMs < 0) return '—';
    const seconds = Math.max(1, Math.round(diffMs / 1000));
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.round(minutes / 60);
    return `${hours}h`;
  } catch (error) {
    console.warn('Unable to format duration:', error);
    return '—';
  }
}

function WorkflowPageInner() {
  const { addToast } = useToast();
  const reactFlow = useReactFlow();
  const { flags } = useFeatureFlags();
  const { applyDefaults, remember } = useSmartDefaults('workflow');
  const [, setSaveStatus] = useStatus('workflow:save');
  const [, setRunStatus] = useStatus('workflow:run');

  const [tools, setTools] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const defaultForm = applyDefaults({ name: 'New Automation', notes: '' });
  const [workflowName, setWorkflowName] = useState(defaultForm.name);
  const [notes, setNotes] = useState(defaultForm.notes);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [invalidHandles, setInvalidHandles] = useState({});
  const [runHistory, setRunHistory] = useState([]);
  const [runSummary, setRunSummary] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [templateLoadingId, setTemplateLoadingId] = useState(null);
  const [quota, setQuota] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [pendingRunWorkflowId, setPendingRunWorkflowId] = useState(null);

  const animationActiveRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const toolResponse = await fetchWorkflowTools();
        const normalized = (toolResponse.tools ?? []).map((tool) => ({
          ...tool,
          icon: TOOL_ICONS[tool.type] ?? '✨',
        }));
        setTools(normalized);
      } catch (error) {
        addToast(error.message || 'Unable to load workflow tools.', 'error');
      }

      try {
        const [workflowResponse, templateResponse, quotaResponse, runsResponse] = await Promise.all([
          fetchWorkflows(),
          fetchWorkflowTemplates().catch((error) => {
            console.warn('Failed to load templates:', error);
            return { templates: [] };
          }),
          fetchUserQuota().catch((error) => {
            console.warn('Failed to load quota:', error);
            return null;
          }),
          fetchWorkflowRuns().catch((error) => {
            console.warn('Failed to load workflow runs:', error);
            return { items: [] };
          }),
        ]);

        setWorkflows(workflowResponse.items ?? []);
        setTemplates(templateResponse.templates ?? []);
        if (quotaResponse) {
          setQuota(quotaResponse);
        }
        const formattedRuns = (runsResponse.items ?? []).map((run) => {
          const creditsValue = typeof run.credits_consumed === 'number'
            ? run.credits_consumed
            : typeof run.credits_consumed === 'string'
              ? Number.parseFloat(run.credits_consumed)
              : null;
          return {
          id: run.id,
          workflowId: run.workflow_id,
          workflowName: run.workflow_name,
          status: run.status,
          startedAt: run.started_at,
          durationLabel: formatDurationLabel(run.started_at, run.finished_at),
          credits: Number.isFinite(creditsValue) ? creditsValue : null,
          summary: run.result ? {
            workflow: { id: run.workflow_id, name: run.workflow_name },
            node_trace: run.result.node_trace ?? [],
            edge_trace: run.result.edge_trace ?? [],
            outputs: run.result.outputs ?? [],
            startedAt: run.started_at,
            finishedAt: run.finished_at,
            error: run.error,
          } : { error: run.error },
        };
        });
        setRunHistory(formattedRuns);
      } catch (error) {
        addToast(error.message || 'Unable to load workflow data.', 'error');
      }
    };
    load();
  }, [addToast]);

  useEffect(() => {
    setHasSelection(
      nodes.some((node) => node.selected) || edges.some((edge) => edge.selected)
    );
  }, [nodes, edges]);

  useEffect(() => {
    if (selectedNodeId && !nodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(null);
    }
  }, [nodes, selectedNodeId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') {
        return;
      }
      const target = event.target;
      if (!target) return;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      event.preventDefault();
      handleDeleteSelection();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  const handleDeleteSelection = useCallback(() => {
    const selectedNodes = reactFlow.getNodes().filter((node) => node.selected);
    const selectedEdges = reactFlow.getEdges().filter((edge) => edge.selected);
    if (!selectedNodes.length && !selectedEdges.length) {
      addToast('Select a node or connection to delete.', 'error');
      return;
    }
    reactFlow.deleteElements({ nodes: selectedNodes, edges: selectedEdges });
  }, [addToast, reactFlow]);

  const handleClearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedWorkflow(null);
    const defaults = applyDefaults({ name: 'New Automation', notes: '' });
    setWorkflowName(defaults.name);
    setNotes(defaults.notes);
    animationActiveRef.current = false;
    setInvalidHandles({});
    setSelectedNodeId(null);
  }, [applyDefaults, setEdges, setNodes]);

  const handleDropTool = useCallback(
    ({ tool, position }) => {
      const newNode = createNodePayload(tool, position);
      setNodes((prev) => [...prev, newNode]);
    },
    [setNodes]
  );

  const handlePaletteAdd = useCallback(
    (tool) => {
      const fallback = { x: 120 + nodes.length * 48, y: 160 + nodes.length * 48 };
      const project = reactFlow.project;
      let center = fallback;
      if (typeof project === 'function') {
        const pane = reactFlow.getPane?.();
        if (pane) {
          const rect = pane.getBoundingClientRect();
          center = project({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        }
      }
      handleDropTool({ tool, position: center });
    },
    [handleDropTool, nodes.length, reactFlow]
  );

  const handleConnect = useCallback(
    (connection) => {
      const getPort = (nodeId, handleId, direction) => {
        if (!nodeId || !handleId) return null;
        const node = reactFlow.getNode(nodeId);
        if (!node?.data) return null;
        const collection = direction === 'output' ? node.data.outputs : node.data.inputs;
        if (!Array.isArray(collection)) return null;
        return collection.find((port) => port.id === handleId) ?? null;
      };

      const sourcePort = getPort(connection.source, connection.sourceHandle, 'output');
      const targetPort = getPort(connection.target, connection.targetHandle, 'input');
      const sourceType = sourcePort?.type ?? sourcePort?.data_type ?? sourcePort?.dataType;
      const targetType = targetPort?.type ?? targetPort?.data_type ?? targetPort?.dataType;

      if (!sourcePort || !targetPort || !connection.sourceHandle || !connection.targetHandle) {
        addToast('Connect matching ports on valid tools.', 'error');
        return false;
      }

      if (sourceType && targetType && sourceType !== targetType) {
        addToast('Ports must share the same data type.', 'error');
        const highlights = {
          [connection.source]: [connection.sourceHandle],
          [connection.target]: [connection.targetHandle],
        };
        setInvalidHandles(highlights);
        setTimeout(() => setInvalidHandles({}), 900);
        return false;
      }

      const labelType = sourceType ?? targetType ?? 'flow';
      const edge = {
        id: generateId('edge'),
        ...connection,
        data: {
          dataType: labelType,
          active: false,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.7)' },
      };
      setInvalidHandles({});
      setEdges((eds) => addEdge(edge, eds));
      return true;
    },
    [addToast, reactFlow, setEdges]
  );

  const extractWorkflowPayload = useCallback(() => {
    const formattedNodes = nodes.map((node) => ({
      id: node.id,
      type: node.data?.toolType,
      position: node.position,
      data: {
        label: node.data?.label,
        description: node.data?.description,
        config: node.data?.config ?? {},
      },
    }));
    const formattedEdges = edges.map((edge) => ({
      from: edge.source,
      to: edge.target,
      type: edge.data?.dataType,
      source_handle: edge.sourceHandle,
      target_handle: edge.targetHandle,
    }));
    return {
      name: workflowName,
      notes,
      nodes: formattedNodes,
      edges: formattedEdges,
      layout: {
        viewport: reactFlow.getViewport?.(),
      },
    };
  }, [edges, nodes, notes, reactFlow, workflowName]);

  const handleSaveWorkflow = useCallback(async () => {
    if (!nodes.length) {
      addToast('Add at least one tool before saving.', 'error');
      return;
    }
    const payload = extractWorkflowPayload();
    setIsSaving(true);
    setSaveStatus('loading');
    try {
      let response;
      if (selectedWorkflow?.id) {
        response = await updateWorkflow({ id: selectedWorkflow.id, ...payload });
        setWorkflows((list) => list.map((wf) => (wf.id === response.id ? response : wf)));
        addToast('Workflow updated.');
      } else {
        response = await createWorkflow(payload);
        setWorkflows((list) => [response, ...list]);
        addToast('Workflow saved.');
      }
      setSelectedWorkflow(response);
      remember({ name: workflowName, notes });
      setSaveStatus('success');
    } catch (error) {
      addToast(error.message || 'Unable to save workflow.', 'error');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [addToast, extractWorkflowPayload, nodes.length, notes, remember, selectedWorkflow, setSaveStatus, setWorkflows, workflowName]);

  const runAnimation = useCallback(
    async (trace) => {
      animationActiveRef.current = true;
      setNodes((prev) => prev.map((node) => ({ ...node, data: { ...node.data, status: 'idle' } })));
      setEdges((prev) => prev.map((edge) => ({ ...edge, data: { ...edge.data, active: false } })));

      for (const step of trace.node_trace ?? []) {
        if (!animationActiveRef.current) break;
        setNodes((prev) =>
          prev.map((node) =>
            node.id === step.node_id
              ? { ...node, data: { ...node.data, status: 'active' } }
              : node
          )
        );
        const activeEdges = new Set(
          (trace.edge_trace ?? [])
            .filter((edge) => edge.from === step.node_id)
            .map((edge) => `${edge.from}-${edge.to}-${edge.type}`)
        );
        setEdges((prev) =>
          prev.map((edge) => ({
            ...edge,
            data: { ...edge.data, active: activeEdges.has(`${edge.source}-${edge.target}-${edge.data?.dataType}`) },
          }))
        );
        await new Promise((resolve) => setTimeout(resolve, 850));
        setEdges((prev) =>
          prev.map((edge) => ({ ...edge, data: { ...edge.data, active: false } }))
        );
        setNodes((prev) =>
          prev.map((node) =>
            node.id === step.node_id
              ? { ...node, data: { ...node.data, status: 'completed' } }
              : node
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      animationActiveRef.current = false;
    },
    [setEdges, setNodes]
  );

  const handleRunWorkflow = useCallback(async () => {
    if (!selectedWorkflow?.id) {
      addToast('Save the workflow before running it.', 'error');
      return;
    }
    if (!nodes.length) {
      addToast('Add tools to the canvas before running.', 'error');
      return;
    }
    const payload = extractWorkflowPayload();
    const startedAt = new Date();
    setIsRunning(true);
    setRunStatus('loading');
    try {
      const response = await runWorkflow({ id: selectedWorkflow.id, payload });
      addToast('Workflow running — watch the glow.');
      await runAnimation(response.result ?? {});

      const summaryPayload = {
        workflow: response.workflow,
        result: response.result,
        credits_info: response.credits_info,
        startedAt: startedAt.toISOString(),
        node_trace: response.result?.node_trace ?? [],
        edge_trace: response.result?.edge_trace ?? [],
        outputs: response.result?.outputs ?? [],
      };
      summaryPayload.finishedAt = new Date().toISOString();
      const runId = `${response.workflow?.id ?? selectedWorkflow.id}-${startedAt.getTime()}`;
      setRunSummary(summaryPayload);
      setSummaryOpen(true);
      setRunHistory((prev) => [
        {
          id: runId,
          workflowId: response.workflow?.id ?? selectedWorkflow.id,
          workflowName: response.workflow?.name ?? workflowName,
          status: 'completed',
          startedAt: summaryPayload.startedAt,
          durationLabel: formatDurationLabel(summaryPayload.startedAt, summaryPayload.finishedAt),
          credits: Number.isFinite(response.credits_info?.consumed)
            ? response.credits_info?.consumed
            : null,
          summary: summaryPayload,
        },
        ...prev,
      ].slice(0, 16));
      setRunStatus('success');
    } catch (error) {
      addToast(error.message || 'Unable to run workflow.', 'error');
      const runId = `${selectedWorkflow?.id ?? 'draft'}-${startedAt.getTime()}`;
      const finishedAt = new Date().toISOString();
      setRunHistory((prev) => [
        {
          id: runId,
          workflowId: selectedWorkflow?.id,
          workflowName: workflowName,
          status: 'failed',
          startedAt: startedAt.toISOString(),
          durationLabel: formatDurationLabel(startedAt.toISOString(), finishedAt),
          credits: null,
          summary: { error: error.message },
        },
        ...prev,
      ].slice(0, 16));
      setRunStatus('error');
    } finally {
      setIsRunning(false);
    }
  }, [addToast, extractWorkflowPayload, nodes.length, runAnimation, selectedWorkflow, setRunStatus, workflowName]);

  const loadWorkflowDefinition = useCallback((wf) => {
    if (!wf) return;
    setSelectedWorkflow(wf);
    setWorkflowName(wf.name ?? 'Saved Workflow');
    setNotes(wf.notes ?? '');

    const newNodes = (wf.nodes ?? []).map((node, index) => {
      const toolMeta = tools.find((tool) => tool.type === node.type) ?? {};
      const savedData = node.data ?? {};
      const inputs = normalizePorts(savedData.inputs, toolMeta.ports?.inputs, 'input');
      const outputs = normalizePorts(savedData.outputs, toolMeta.ports?.outputs, 'output');
      const configSchema = savedData.configSchema ?? toolMeta.config_schema ?? {};
      const defaults = savedData.defaults ?? toolMeta.defaults ?? {};
      const mergedConfig = { ...defaults, ...(savedData.config ?? {}) };
      return {
        id: node.id,
        position: node.position ?? { x: 160 + index * 60, y: 140 + index * 45 },
        data: {
          label: savedData.label ?? toolMeta.label ?? node.type,
          toolType: node.type,
          description: savedData.description ?? toolMeta.description,
          inputs,
          outputs,
          configSchema,
          defaults,
          config: mergedConfig,
          icon: toolMeta.icon,
          status: 'idle',
          highlight: [],
        },
      };
    });

    const nodeLookup = new Map(newNodes.map((node) => [node.id, node]));
    const newEdges = (wf.edges ?? []).map((edge, index) => {
      const sourceNode = nodeLookup.get(edge.from);
      const targetNode = nodeLookup.get(edge.to);
      const fallbackSource = sourceNode?.data?.outputs?.find((port) => port.type === edge.type)?.id;
      const fallbackTarget = targetNode?.data?.inputs?.find((port) => port.type === edge.type)?.id;

      return {
        id: edge.id ?? `edge-${index}`,
        source: edge.from,
        target: edge.to,
        sourceHandle: edge.source_handle ?? fallbackSource,
        targetHandle: edge.target_handle ?? fallbackTarget,
        data: {
          dataType: edge.type,
          active: false,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.7)' },
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
    setInvalidHandles({});
    setSelectedNodeId(null);
  }, [setEdges, setNodes, tools]);

  const handleSelectWorkflow = useCallback(
    (id) => {
      const wf = workflows.find((item) => item.id === id);
      if (!wf) return;
      loadWorkflowDefinition(wf);
    },
    [loadWorkflowDefinition, workflows]
  );

  const handleUseTemplate = useCallback(
    async (template) => {
      setTemplateLoadingId(template.id);
      try {
        const response = await useWorkflowTemplate(template.id, template.name);
        addToast(`Template “${template.name}” loaded.`);
        setWorkflows((prev) => [response, ...prev]);
        loadWorkflowDefinition(response);
      } catch (error) {
        addToast(error.message || 'Unable to load template.', 'error');
      } finally {
        setTemplateLoadingId(null);
      }
    },
    [addToast, loadWorkflowDefinition]
  );

  const canvasEmpty = nodes.length === 0 && edges.length === 0;

  const paletteTools = useMemo(() => tools ?? [], [tools]);
  const quickTemplates = useMemo(() => templates.slice(0, 6), [templates]);
  const showQuickStartTemplates = flags.progressiveDisclosure !== false;
  const estimatedCostLabel = useMemo(() => {
    const remaining = quota?.quota?.credits_remaining?.workflow_runs;
    if (remaining !== undefined && remaining !== null) {
      return remaining > 0 ? `≈1 run credit • ${remaining} left` : 'No workflow credits remaining';
    }
    return '≈1 workflow credit';
  }, [quota]);
  const configReady = useMemo(() =>
    nodes.every((node) => {
      const schema = node.data?.configSchema;
      const required = schema?.required ?? [];
      if (!required.length) return true;
      return required.every((key) => {
        const value = node.data?.config?.[key];
        return value !== undefined && value !== '' && value !== null;
      });
    }),
  [nodes]);
  const canRun = Boolean(selectedWorkflow?.id && nodes.length && configReady);
  const selectedWorkflowId = selectedWorkflow?.id ?? null;
  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );
  const { status: statusMap } = useStatusContext();
  const workflowSaveState = statusMap['workflow:save'];
  const workflowRunState = statusMap['workflow:run'];

  const handleHistoryEntrySelect = useCallback((entry) => {
    if (!entry?.summary) {
      addToast('No run details available yet.', 'error');
      return;
    }
    setRunSummary(entry.summary);
    setSummaryOpen(true);
  }, [addToast]);

  const handleHistoryViewLogs = useCallback(
    (entry) => {
      handleHistoryEntrySelect(entry);
    },
    [handleHistoryEntrySelect]
  );

  const handleHistoryOpenOutputs = useCallback(
    (entry) => {
      const outputs = entry?.summary?.outputs;
      if (!outputs?.length) {
        addToast('This run did not produce downloadable outputs.', 'error');
        return;
      }
      if (typeof window === 'undefined') {
        handleHistoryEntrySelect(entry);
        return;
      }
      outputs.forEach((output) => {
        const url = output?.url ?? output?.value?.url;
        if (url) {
          window.open(url, '_blank', 'noreferrer');
        }
      });
    },
    [addToast, handleHistoryEntrySelect]
  );

  const handleHistoryRerun = useCallback(
    (entry) => {
      if (!entry?.workflowId) {
        addToast('Workflow definition unavailable for rerun.', 'error');
        return;
      }
      const workflowRecord = workflows.find((wf) => wf.id === entry.workflowId);
      if (!workflowRecord) {
        addToast('Workflow no longer exists. Restore it from templates or save again.', 'error');
        return;
      }
      setPendingRunWorkflowId(entry.workflowId);
      if (selectedWorkflowId !== entry.workflowId) {
        loadWorkflowDefinition(workflowRecord);
      }
    },
    [addToast, loadWorkflowDefinition, selectedWorkflowId, workflows]
  );

  const validateConnection = useCallback(
    (connection) => {
      if (!(connection?.source && connection?.target)) return false;
      const sourceNode = reactFlow.getNode(connection.source);
      const targetNode = reactFlow.getNode(connection.target);
      const getPort = (node, handle, dir) => {
        if (!node?.data) return null;
        const ports = dir === 'output' ? node.data.outputs : node.data.inputs;
        if (!Array.isArray(ports)) return null;
        return ports.find((port) => port.id === handle) ?? null;
      };
      const sourcePort = getPort(sourceNode, connection.sourceHandle, 'output');
      const targetPort = getPort(targetNode, connection.targetHandle, 'input');
      if (!sourcePort || !targetPort) return false;
      const sourceType = sourcePort.type ?? sourcePort.data_type ?? sourcePort.dataType;
      const targetType = targetPort.type ?? targetPort.data_type ?? targetPort.dataType;
      return !sourceType || !targetType || sourceType === targetType;
    },
    [reactFlow]
  );

  useEffect(() => {
    if (!pendingRunWorkflowId) return;
    if (isRunning) return;
    if (selectedWorkflowId === pendingRunWorkflowId) {
      handleRunWorkflow();
      setPendingRunWorkflowId(null);
    }
  }, [handleRunWorkflow, isRunning, pendingRunWorkflowId, selectedWorkflowId]);

  useEffect(() => {
    const listener = () => {
      if (!isRunning) {
        handleRunWorkflow();
      }
    };
    window.addEventListener('workflow:run', listener);
    return () => window.removeEventListener('workflow:run', listener);
  }, [handleRunWorkflow, isRunning]);

  useEffect(() => {
    const shortcutListener = (event) => {
      const isCmd = event.metaKey || event.ctrlKey;
      if (isCmd && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleSaveWorkflow();
      }
      if (isCmd && event.key === 'Enter') {
        event.preventDefault();
        handleRunWorkflow();
      }
    };
    window.addEventListener('keydown', shortcutListener);
    return () => window.removeEventListener('keydown', shortcutListener);
  }, [handleRunWorkflow, handleSaveWorkflow]);

  const handleSelectionChange = useCallback((selection) => {
    const firstNode = selection?.nodes?.[0];
    setSelectedNodeId(firstNode?.id ?? null);
  }, []);

  const handleConfigUpdate = useCallback(
    (nodeId, updatedConfig) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? {
              ...node,
              data: {
                ...node.data,
                config: { ...node.data?.config, ...updatedConfig },
              },
            }
            : node
        )
      );
    },
    [setNodes]
  );

  const handleDeleteWorkflowSaved = useCallback(
    async (id) => {
      try {
        await deleteWorkflow(id);
        setWorkflows((prev) => prev.filter((workflow) => workflow.id !== id));
        if (selectedWorkflowId === id) {
          handleClearCanvas();
        }
        addToast('Automation deleted.');
      } catch (error) {
        addToast(error.message || 'Unable to delete workflow.', 'error');
      }
    },
    [addToast, handleClearCanvas, selectedWorkflowId]
  );

  const handleClearWorkflowsList = useCallback(async () => {
    try {
      await clearWorkflows();
      setWorkflows([]);
      handleClearCanvas();
      addToast('All automations cleared.');
    } catch (error) {
      addToast(error.message || 'Unable to clear workflows.', 'error');
    }
  }, [addToast, handleClearCanvas]);

  const handleDeleteRunEntry = useCallback(
    async (entry) => {
      try {
        await deleteWorkflowRun(entry.id);
        setRunHistory((prev) => prev.filter((item) => item.id !== entry.id));
        if (runSummary && summaryOpen) {
          if (runSummary === entry.summary || runSummary.workflow?.id === entry.workflowId) {
            setSummaryOpen(false);
          }
        }
        addToast('Run removed from history.');
      } catch (error) {
        addToast(error.message || 'Unable to delete run.', 'error');
      }
    },
    [addToast, runSummary, summaryOpen]
  );

  const handleClearRunHistory = useCallback(async () => {
    try {
      await clearWorkflowRuns();
      setRunHistory([]);
      setSummaryOpen(false);
      setRunSummary(null);
      addToast('Run history cleared.');
    } catch (error) {
      addToast(error.message || 'Unable to clear run history.', 'error');
    }
  }, [addToast]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold theme-text-primary">Workflow Automator</h1>
          <p className="max-w-2xl text-sm theme-text-muted">
            Connect Growth OS tools into a reusable pipeline. Drag tools, branch outputs, and re-run with fresh inputs.
          </p>
        </header>

        <WorkflowToolbar
          onSave={handleSaveWorkflow}
          onRun={handleRunWorkflow}
          onDeleteSelection={handleDeleteSelection}
          onClear={handleClearCanvas}
          running={isRunning}
          saving={isSaving}
          canRun={canRun}
          estimatedCost={estimatedCostLabel}
          hasSelection={hasSelection}
          showDelete={!flags.consolidatedActions}
          showClear={!flags.consolidatedActions}
        />
        {(workflowSaveState || workflowRunState) && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.3em] text-white/60">
            {workflowSaveState === 'loading' && <span>Saving workflow… </span>}
            {workflowSaveState === 'success' && <span className="text-emerald-200">Saved</span>}
            {workflowSaveState === 'error' && <span className="text-rose-200">Save failed</span>}
            {workflowRunState === 'loading' && <span className="ml-4">Running workflow…</span>}
            {workflowRunState === 'success' && <span className="ml-4 text-emerald-200">Run complete</span>}
            {workflowRunState === 'error' && <span className="ml-4 text-rose-200">Run failed</span>}
          </div>
        )}

        <section className="grid gap-8 xl:grid-cols-[340px,minmax(0,1fr)]">
          <div className="order-2 flex flex-col gap-6 xl:order-1">
            <WorkflowNodeConfigPanel node={selectedNode} onChange={handleConfigUpdate} />

            <GlassCard title="Active Workflow" subtitle="Update the title and leave notes for collaborators.">
              <div className="space-y-4 text-sm">
                <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] theme-text-muted">
                  Name
                  <input
                    type="text"
                    value={workflowName}
                    onChange={(event) => setWorkflowName(event.target.value)}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60"
                    placeholder="Glass Pipeline"
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] theme-text-muted">
                  Notes
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="min-h-[120px] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                    placeholder="Inputs required, deliverables, or review reminders."
                  />
                </label>
                {quota?.quota?.credits_remaining?.workflow_runs !== undefined ? (
                  <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                    Credits remaining · {quota.quota.credits_remaining.workflow_runs}
                  </p>
                ) : null}
              </div>
            </GlassCard>

            <WorkflowLibrary
              workflows={workflows}
              activeId={selectedWorkflow?.id}
              onSelect={handleSelectWorkflow}
              onDelete={handleDeleteWorkflowSaved}
              onDeleteAll={handleClearWorkflowsList}
            />

            <WorkflowHistory
              history={runHistory}
              onSelect={handleHistoryEntrySelect}
              onRerun={handleHistoryRerun}
              onOpenOutputs={handleHistoryOpenOutputs}
              onViewLogs={handleHistoryViewLogs}
              onDelete={handleDeleteRunEntry}
              onDeleteAll={handleClearRunHistory}
            />
          </div>

          <div className="order-1 flex flex-col gap-6 xl:order-2">
            <GlassCard
              title="Build Your Flow"
              subtitle="Drop tools onto the canvas, connect matching ports, and watch data pulse through the system."
              className="min-h-0"
              allowOverflow
              interactive={false}
            >
              <div className="space-y-5">
                <div className="relative h-[460px]">
                  <WorkflowCanvas
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={handleConnect}
                    onDropTool={handleDropTool}
                    invalidHandles={invalidHandles}
                    validateConnection={validateConnection}
                    onSelectionChange={handleSelectionChange}
                  />
                  {canvasEmpty ? <OnboardingOverlay /> : null}
                </div>

                <WorkflowPalette tools={paletteTools} onAdd={handlePaletteAdd} orientation="horizontal" />
              </div>
            </GlassCard>

            {showQuickStartTemplates ? (
              <QuickStartTemplates
                templates={quickTemplates}
                onUse={handleUseTemplate}
                loadingId={templateLoadingId}
              />
            ) : null}
          </div>
        </section>
      </div>

      <RunSummaryDrawer open={summaryOpen} onClose={() => setSummaryOpen(false)} summary={runSummary} />
    </>
  );
}

export default function WorkflowPage() {
  return (
    <ReactFlowProvider>
      <WorkflowPageInner />
    </ReactFlowProvider>
  );
}
