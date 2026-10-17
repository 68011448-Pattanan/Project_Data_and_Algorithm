/* Experimental results and interactive demonstrations for the Algorithm lab page. */
function reportSection(number, title, content, id = "") {
  return `<section class="report-section" ${id ? `id="${id}"` : ""}><h2><span>${number}</span>${title}</h2>${content}</section>`;
}
function academicBenchmarkPanel() {
  const b = benchmarkResults;
  return reportSection(
    "01",
    "Experimental results",
    `<div class="report-experiment" data-report-interactive><div class="report-experiment-head"><h3>Configure an experiment</h3>${btn("Export results (.csv)", "report-csv", "chart", "secondary small")}</div><form class="benchmark-form" data-form="benchmark"><label class="field">Record count (n)<select id="benchmark-size" name="size">${[100, 500, 1100, 5000].map((n) => `<option value="${n}" ${n === benchmarkConfig.size ? "selected" : ""}>${num(n)}</option>`).join("")}</select></label><label class="field">Timed repetitions<select id="benchmark-repeats" name="repeats">${[3, 5, 7, 15].map((n) => `<option value="${n}" ${n === benchmarkConfig.repeats ? "selected" : ""}>${n}</option>`).join("")}</select></label><label class="field">Routing destination<select id="benchmark-destination" name="destination">${destinationsOptions(benchmarkConfig.destination)}</select></label>${btn(benchmarkRunning ? "Measuring…" : "Run experiment", "submit-benchmark", "play")}</form><p class="report-note">The report uses the completed experiment snapshot below. Changing these controls does not relabel previous results.</p></div>${benchmarkRunning ? '<p class="report-status" role="status">Warm-up and repeated measurements in progress. The previous completed experiment remains visible until a new result is received.</p>' : ""}${b ? reportMeasuredResults(b) + `<p><strong>Observed result.</strong> ${esc(reportObservations())}</p>` : '<div class="report-pending"><strong>No empirical results recorded.</strong><p>Run an experiment to populate the result tables, figure, environment details and the observation paragraph. No example timings are substituted for measurements.</p></div>'}`,
    "report-results",
  );
}
function reportMeasuredResults(b) {
  const env = b.environment || {},
    g = b.graph || {};
  return `<dl class="report-run-meta"><div><dt>Recorded (UTC)</dt><dd>${esc(b.measured_at || "Not recorded")}</dd></div><div><dt>Dataset / repetitions</dt><dd>n = ${num(b.size)} · r = ${b.repeats} · seed = ${b.seed}</dd></div><div><dt>Runtime environment</dt><dd>${esc(env.implementation || "Python")} ${esc(env.python || "not recorded")} · ${esc(env.system || "not recorded")} ${esc(env.machine || "")} · ${env.logical_cpus ?? "Unknown"} visible logical CPUs</dd></div><div><dt>Clock / graph</dt><dd>${esc(env.timer || "perf_counter_ns")} · reported resolution ${env.clock_resolution_ns !== undefined ? Number(env.clock_resolution_ns).toPrecision(3) + " ns" : "not recorded"} · ${num(g.vertices)} vertices / ${num(g.undirected_edges)} edges</dd></div></dl><p class="report-note">Environment details are reported by the backend process; Docker may expose a Linux guest and CPU count that differs from the host. This records visible CPUs, not a controlled allocation or CPU model.</p><div class="report-table-wrap"><table class="report-table"><caption>Table 1. Median elapsed time per task workload (ms) and relative runtime.</caption><thead><tr><th>Task / methods</th><th>Primary median (ms)</th><th>Baseline median (ms)</th><th>R = baseline / primary</th><th>Validation</th></tr></thead><tbody>${b.pairs.map((p) => `<tr><td><strong>${esc(p.task)}</strong><small>${esc(p.primary.name)} / ${esc(p.baseline.name)}</small></td><td class="numeric">${reportMs(p.primary.median_ms)}</td><td class="numeric">${reportMs(p.baseline.median_ms)}</td><td class="numeric">${p.speedup === null ? "Undefined" : p.speedup.toFixed(3)}</td><td>${p.verified ? "Matched" : "Mismatch"}</td></tr>`).join("")}</tbody></table></div><p class="report-note">Times are for one route search, a 100-query lookup batch, draining n queue items, or sorting n records. Six decimal places are a display convention, not a claim of measurement accuracy.</p><figure class="report-runtime-figure">${reportRuntimeFigure(b)}<figcaption>Figure 1. Median runtime by method. Each task panel uses its own linear scale starting at zero; bar lengths cannot be compared across panels. Values are milliseconds.</figcaption></figure><div class="report-table-wrap"><table class="report-table"><caption>Table 2. Descriptive timing statistics and derived per-operation averages (ms).</caption><thead><tr><th>Task / method</th><th>Mean</th><th>Minimum</th><th>Maximum</th><th>Operations / run</th><th>Median / operation</th></tr></thead><tbody>${b.pairs.flatMap((p) => [p.primary, p.baseline].map((m) => `<tr><td><strong>${esc(m.name)}</strong><small>${esc(p.task)}</small></td><td class="numeric">${reportMs(m.mean_ms)}</td><td class="numeric">${reportMs(m.min_ms)}</td><td class="numeric">${reportMs(m.max_ms)}</td><td class="numeric">${num(m.operation_count)}</td><td class="numeric">${reportMs(m.per_operation_ms)}</td></tr>`)).join("")}</tbody></table></div><div class="report-table-wrap"><table class="report-table"><caption>Table 3. Work counts obtained separately from runtime measurement.</caption><thead><tr><th>Task</th><th>Primary work</th><th>Baseline work</th></tr></thead><tbody>${b.pairs.map((p) => `<tr><td>${esc(p.task)}</td><td>${num(p.primary.work)} ${esc(p.primary.work_label)}</td><td>${num(p.baseline.work)} ${esc(p.baseline.work_label)}</td></tr>`).join("")}</tbody></table></div><p class="report-note">Queue reference shifts are theoretical: n(n − 1)/2 for a complete list-front drain. Dictionary lookups count calls, not collision probes. Routing counts expanded vertices; sorting counts key comparisons. Counts of different operations are not a shared unit of work.</p><p class="report-route-note">Routing snapshot: entrance (${(g.start || []).join(", ")}) → bay ${esc(b.pairs[0].slot)}, distance ${b.pairs[0].distance} m. ${b.pairs[0].assignment_available ? "Target selected from current eligible bays." : "No assignable bay was available; this comparison routes to a physical bay without assigning it."}</p><details class="report-samples"><summary>Inspect raw measurements (ms)</summary><div class="report-table-wrap"><table class="report-table"><caption>Appendix data. Individual timed samples; the warm-up is excluded.</caption><thead><tr><th>Method</th><th>Samples (ms)</th></tr></thead><tbody>${b.pairs.flatMap((p) => [p.primary, p.baseline].map((m) => `<tr><td>${esc(m.name)}</td><td>${m.samples_ms.map(reportMs).join(", ")}</td></tr>`)).join("")}</tbody></table></div></details>`;
}
function reportMs(value) {
  return Number(value).toFixed(6);
}
function reportRuntimeFigure(b) {
  return `<svg viewBox="0 0 760 340" role="img" aria-label="Four independently scaled panels comparing median runtime in milliseconds"><title>Median runtime for equivalent tasks</title>${b.pairs
    .map((p, i) => {
      const x = 22 + (i % 2) * 382,
        y = 20 + Math.floor(i / 2) * 170,
        max = Math.max(
          p.primary.median_ms,
          p.baseline.median_ms,
          Number.EPSILON,
        ),
        w = 325;
      return `<g transform="translate(${x} ${y})"><text class="figure-task" x="0" y="12">${esc(p.task)}</text>${[p.primary, p.baseline].map((m, j) => `<text class="figure-label" x="0" y="${37 + j * 49}">${esc(m.name)}</text><text class="figure-value" x="${w}" y="${37 + j * 49}" text-anchor="end">${reportMs(m.median_ms)}</text><rect x="0" y="${44 + j * 49}" width="${w}" height="13" fill="#edf0f2"/><rect x="0" y="${44 + j * 49}" width="${(m.median_ms / max) * w}" height="13" fill="${j ? "#9caeb8" : "#254b62"}"/>`).join("")}<text class="figure-axis" x="0" y="131">0</text><text class="figure-axis" x="${w}" y="131" text-anchor="end">${reportMs(max)} ms</text></g>`;
    })
    .join("")}</svg>`;
}
function reportObservations() {
  if (!benchmarkResults)
    return "No measured result is available. The complexity analysis describes expected growth; an empirical conclusion requires a completed experiment.";
  return benchmarkResults.pairs
    .map((p) => {
      if (!p.verified)
        return `${p.task}: outputs did not match; this pair cannot support a performance conclusion.`;
      const a = p.primary,
        b = p.baseline,
        ratio = p.speedup;
      if (ratio === null)
        return `${p.task}: a relative runtime could not be calculated.`;
      const lower = ratio >= 1 ? a : b,
        higher = ratio >= 1 ? b : a;
      return `${p.task}: ${lower.name} had the lower median (${reportMs(lower.median_ms)} ms versus ${reportMs(higher.median_ms)} ms), a ${(ratio >= 1 ? ratio : 1 / ratio).toFixed(3)}× runtime ratio in this experiment. Outputs matched the task-specific validation criterion.`;
    })
    .join(" ");
}
function academicDemonstrations() {
  return `<div class="report-demo-grid"><section class="panel"><div class="panel-head"><h3>Plate dictionary</h3></div><div class="panel-body"><div class="codebox">${
    state.vehicles
      .slice(0, 4)
      .map(
        (v) =>
          `${esc(v.plate)} → ${esc(v.slot || "waiting")} (${esc(v.status)})`,
      )
      .join("<br>") || "Registry is empty"
  }</div><div class="result-actions">${btn("Insert visit", "arrival", "plus", "secondary small")}${btn("Search plate", "nav", "search", "secondary small", 'data-page="find"')}${btn("Update / remove", "nav", "people", "secondary small", 'data-page="vehicles"')}</div></div></section><section class="panel"><div class="panel-head"><h3>FIFO service order</h3></div><div class="panel-body"><div class="codebox">FRONT → ${
    state.queue
      .slice(0, 4)
      .map((v) => esc(v.plate))
      .join(" → ") || "empty"
  } → REAR<br>front(): ${esc(state.queue[0]?.plate || "null")}<br>is_empty(): ${state.waiting_count === 0}</div><div class="result-actions">${btn("Enqueue demo vehicles", "simulate", "plus", "secondary small", 'data-sim="queue"')}${btn("Release bay / dequeue", "simulate", "exit", "secondary small", 'data-sim="exit"')}</div></div></section><section class="panel"><div class="panel-head"><h3>A* route inspection</h3></div><div class="panel-body"><label class="field">Destination<select id="lab-destination">${destinationsOptions(draft.destination)}</select></label><div class="result-actions">${btn("Run recommendation", "run-astar", "play", "secondary small")}${btn("Animate search", "animate-astar", "play", "small")}${btn("Compare A* vs Dijkstra", "compare", "chart", "secondary small")}</div><div id="astar-metrics">${astarMetrics()}</div><div id="compare-output" style="display:none"></div></div></section><section class="panel merge-panel"><div class="panel-head"><h3>Merge Sort tree</h3></div><div class="panel-body"><div id="merge-trace">${mergeTreeView()}</div>${btn("Animate Merge Sort", "animate-merge", "play", "secondary small")}</div></section></div>${mapPanel("Route and expanded-vertex visualization", false)}`;
}
function downloadReportFile(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
function reportFileStem() {
  return (
    "Parkside-algorithm-report" +
    (benchmarkResults
      ? "-" + benchmarkResults.measured_at.replace(/[:.]/g, "-")
      : "")
  );
}
function reportCsv() {
  const b = benchmarkResults;
  const header = [
    "recorded_utc",
    "record_count",
    "repetitions",
    "seed",
    "capacity",
    "floors",
    "task",
    "method",
    "role",
    "median_ms",
    "mean_ms",
    "min_ms",
    "max_ms",
    "operations_per_run",
    "median_per_operation_ms",
    "work_count",
    "work_unit",
    "outputs_matched",
    "samples_ms",
    "python",
    "implementation",
    "system",
    "machine",
    "visible_logical_cpus",
    "clock_resolution_ns",
    "graph_vertices",
    "graph_edges",
    "runtime_release",
    "clock_monotonic",
    "routing_destination",
    "route_target_bay",
    "route_distance_m",
    "assignable_bay_available",
    "graph_start",
    "graph_goal",
  ];
  const rows = b.pairs.flatMap((p) =>
    ["primary", "baseline"].map((role) => {
      const m = p[role],
        env = b.environment || {},
        g = b.graph || {};
      return [
        b.measured_at,
        b.size,
        b.repeats,
        b.seed,
        b.capacity,
        b.floors,
        p.task,
        m.name,
        role,
        m.median_ms,
        m.mean_ms,
        m.min_ms,
        m.max_ms,
        m.operation_count,
        m.per_operation_ms,
        m.work,
        m.work_label,
        p.verified,
        JSON.stringify(m.samples_ms),
        env.python,
        env.implementation,
        env.system,
        env.machine,
        env.logical_cpus,
        env.clock_resolution_ns,
        g.vertices,
        g.undirected_edges,
        env.release,
        env.clock_monotonic,
        b.destination,
        b.pairs[0].slot,
        b.pairs[0].distance,
        b.pairs[0].assignment_available,
        JSON.stringify(g.start),
        JSON.stringify(g.goal),
      ];
    }),
  );
  return [header, ...rows]
    .map((row) =>
      row.map((v) => '"' + String(v ?? "").replace(/"/g, '""') + '"').join(","),
    )
    .join("\r\n");
}
async function handleAcademicAction(el) {
  const action = el.dataset.action;
  if (action === "report-csv") {
    if (!benchmarkResults) {
      toast("Run an experiment before exporting measured results.", true);
      return true;
    }
    downloadReportFile(
      reportFileStem() + ".csv",
      reportCsv(),
      "text/csv;charset=utf-8",
    );
    return true;
  }
  return false;
}
