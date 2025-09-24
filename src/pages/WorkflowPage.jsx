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
import OnboardingOverlay from '../components/workflow/OnboardingOverlay.jsx';
import QuickStartTemplates from '../components/workflow/QuickStartTemplates.jsx';
import WorkflowHistory from '../components/workflow/WorkflowHistory.jsx';
import RunSummaryDrawer from '../components/workflow/RunSummaryDrawer.jsx';
import {
  createWorkflow,
  fetchWorkflowTools,
  fetchWorkflows,
  runWorkflow,
  updateWorkflow,
  fetchWorkflowTemplates,
  useWorkflowTemplate,
  fetchUserQuota,
} from '../lib/apiClient.js';

const TOOL_ICONS = {
  downloader: '⬇️',
  refinery: '✏️',
  voice: '🎧',
  copywriter: '📝',
  editor: '🎬',
  publisher: '🚀',
};

function createNodePayload(tool, position) {
  const id = `node-${crypto?.randomUUID?.() ?? Date.now()}`;
  return {
    id,
    position,
    data: {
      label: tool.label,
      toolType: tool.type,
      inputs: tool.inputs ?? [],
      outputs: tool.outputs ?? [],
      status: 'idle',
      highlight: [],
    },
  };
}

function WorkflowPageInner() {
  const { addToast } = useToast();
  const reactFlow = useReactFlow();

  const [tools, setTools] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowName, setWorkflowName] = useState('New Automation');
  const [notes, setNotes] = useState('');
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
        const [workflowResponse, templateResponse, quotaResponse] = await Promise.all([
          fetchWorkflows(),
          fetchWorkflowTemplates().catch((error) => {
            console.warn('Failed to load templates:', error);
            return { templates: [] };
          }),
          fetchUserQuota().catch((error) => {
            console.warn('Failed to load quota:', error);
            return null;
          }),
        ]);

        setWorkflows(workflowResponse.items ?? []);
        setTemplates(templateResponse.templates ?? []);
        if (quotaResponse) {
          setQuota(quotaResponse);
        }
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
    setWorkflowName('New Automation');
    setNotes('');
    animationActiveRef.current = false;
    setInvalidHandles({});
  }, [setEdges, setNodes]);

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
      const sourceType = connection.sourceHandle?.split('-')[1];
      const targetType = connection.targetHandle?.split('-')[1];
      if (sourceType && targetType && sourceType !== targetType) {
        addToast('Ports must share the same data type.', 'error');
        const highlights = {};
        if (connection.source && connection.sourceHandle) {
          highlights[connection.source] = [connection.sourceHandle];
        }
        if (connection.target && connection.targetHandle) {
          highlights[connection.target] = [connection.targetHandle];
        }
        setInvalidHandles(highlights);
        setTimeout(() => setInvalidHandles({}), 800);
        return;
      }
      const edge = {
        id: `edge-${crypto?.randomUUID?.() ?? Date.now()}`,
        ...connection,
        data: {
          dataType: sourceType ?? targetType ?? 'flow',
          active: false,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.7)' },
      };
      setInvalidHandles({});
      setEdges((eds) => addEdge(edge, eds));
    },
    [addToast, setEdges]
  );

  const extractWorkflowPayload = useCallback(() => {
    const formattedNodes = nodes.map((node) => ({
      id: node.id,
      type: node.data?.toolType,
      position: node.position,
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
    } catch (error) {
      addToast(error.message || 'Unable to save workflow.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [addToast, extractWorkflowPayload, nodes.length, selectedWorkflow, setWorkflows]);

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
          durationLabel: 'Moments ago',
          credits: response.credits_info?.consumed ?? null,
          summary: summaryPayload,
        },
        ...prev,
      ].slice(0, 16));
    } catch (error) {
      addToast(error.message || 'Unable to run workflow.', 'error');
      const runId = `${selectedWorkflow?.id ?? 'draft'}-${startedAt.getTime()}`;
      setRunHistory((prev) => [
        {
          id: runId,
          workflowId: selectedWorkflow?.id,
          workflowName: workflowName,
          status: 'failed',
          startedAt: startedAt.toISOString(),
          durationLabel: 'Failed immediately',
          credits: null,
          summary: { error: error.message },
        },
        ...prev,
      ].slice(0, 16));
    } finally {
      setIsRunning(false);
    }
  }, [addToast, extractWorkflowPayload, nodes.length, runAnimation, selectedWorkflow, workflowName]);

  const loadWorkflowDefinition = useCallback((wf) => {
    if (!wf) return;
    setSelectedWorkflow(wf);
    setWorkflowName(wf.name ?? 'Saved Workflow');
    setNotes(wf.notes ?? '');

    const newNodes = (wf.nodes ?? []).map((node, index) => {
      const toolMeta = tools.find((tool) => tool.type === node.type) ?? {};
      return {
        id: node.id,
        position: node.position ?? { x: 160 + index * 60, y: 140 + index * 45 },
        data: {
          label: toolMeta.label ?? node.data?.label ?? node.type,
          toolType: node.type,
          inputs: toolMeta.inputs ?? node.data?.inputs ?? [],
          outputs: toolMeta.outputs ?? node.data?.outputs ?? [],
          status: 'idle',
          highlight: [],
        },
      };
    });

    const newEdges = (wf.edges ?? []).map((edge, index) => ({
      id: edge.id ?? `edge-${index}`,
      source: edge.from,
      target: edge.to,
      sourceHandle: edge.source_handle,
      targetHandle: edge.target_handle,
      data: {
        dataType: edge.type,
        active: false,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.7)' },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
    setInvalidHandles({});
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
  const estimatedCostLabel = useMemo(() => {
    const remaining = quota?.quota?.credits_remaining?.workflow_runs;
    if (remaining !== undefined && remaining !== null) {
      return remaining > 0 ? `≈1 run credit • ${remaining} left` : 'No workflow credits remaining';
    }
    return '≈1 workflow credit';
  }, [quota]);
  const canRun = Boolean(selectedWorkflow?.id && nodes.length);
  const selectedWorkflowId = selectedWorkflow?.id ?? null;

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
        if (output?.url) {
          window.open(output.url, '_blank', 'noreferrer');
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

  const validateConnection = useCallback((connection) => {
    const sourceType = connection.sourceHandle?.split('-')[1];
    const targetType = connection.targetHandle?.split('-')[1];
    if (!sourceType || !targetType) return true;
    return sourceType === targetType;
  }, []);

  useEffect(() => {
    if (!pendingRunWorkflowId) return;
    if (isRunning) return;
    if (selectedWorkflowId === pendingRunWorkflowId) {
      handleRunWorkflow();
      setPendingRunWorkflowId(null);
    }
  }, [handleRunWorkflow, isRunning, pendingRunWorkflowId, selectedWorkflowId]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold theme-text-primary">Workflow Automator</h1>
          <p className="max-w-2xl text-sm theme-text-muted">
            Connect Growth OS tools into a reusable pipeline. Drag tools, branch outputs, and re-run with fresh inputs.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr),minmax(320px,0.65fr)]">
          <GlassCard
            title="Build Your Flow"
            subtitle="Drop tools onto the canvas, connect matching ports, and watch data pulse through the system."
            className="min-h-[520px]"
            allowOverflow
            interactive={false}
          >
            <div className="relative h-[520px]">
              <WorkflowCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={handleConnect}
                onDropTool={handleDropTool}
                invalidHandles={invalidHandles}
                validateConnection={validateConnection}
              />
              {canvasEmpty ? <OnboardingOverlay /> : null}
            </div>
          </GlassCard>

          <div className="flex flex-col gap-6">
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
            />

            <WorkflowPalette tools={paletteTools} onAdd={handlePaletteAdd} />

            <QuickStartTemplates
              templates={quickTemplates}
              onUse={handleUseTemplate}
              loadingId={templateLoadingId}
            />

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
            />

            <WorkflowHistory
              history={runHistory}
              onSelect={handleHistoryEntrySelect}
              onRerun={handleHistoryRerun}
              onOpenOutputs={handleHistoryOpenOutputs}
              onViewLogs={handleHistoryViewLogs}
            />
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
