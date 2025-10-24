'use client';

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

type TestStatus = "Not Started" | "In Progress" | "Pass" | "Fail" | "Blocked";
type TestPriority = "P0" | "P1" | "P2" | "P3";

type TestCase = {
  id: string;
  name: string;
  feature: string;
  description: string;
  steps: string;
  expected: string;
  actual: string;
  owner: string;
  priority: TestPriority;
  status: TestStatus;
  tags: string[];
  lastRun: string;
  notes: string;
};

type Activity = {
  id: string;
  title: string;
  timestamp: string;
  status: TestStatus;
  details: string;
};

const defaultCases: TestCase[] = [
  {
    id: "case-1",
    name: "Checkout happy path",
    feature: "Payments",
    description: "Validate full checkout flow with credit card and order confirmation.",
    steps:
      "1. Add two items to cart\n2. Apply 10% coupon\n3. Pay via credit card\n4. Verify confirmation email",
    expected:
      "Order completes with correct totals, coupon applied, confirmation email received.",
    actual: "",
    owner: "Alex",
    priority: "P0",
    status: "Pass",
    tags: ["Regression", "Smoke"],
    lastRun: "2024-05-09T13:30:00.000Z",
    notes: "Validated on production-like dataset.",
  },
  {
    id: "case-2",
    name: "Checkout address validation",
    feature: "Payments",
    description: "Verify inline validation for invalid shipping address.",
    steps:
      "1. Add item to cart\n2. Enter invalid postal code\n3. Attempt to continue",
    expected: "Inline validation appears and checkout blocks submission.",
    actual: "Validation not triggered for postal code `00000`.",
    owner: "Jamie",
    priority: "P1",
    status: "Fail",
    tags: ["Accessibility"],
    lastRun: "2024-05-08T16:45:00.000Z",
    notes: "Logs show validation schema bypass when shipping_region = EU.",
  },
  {
    id: "case-3",
    name: "Profile photo upload",
    feature: "Profile",
    description: "Ensure 5MB image uploads succeed and preview renders.",
    steps: "1. Navigate to profile\n2. Upload 4MB jpeg\n3. Save changes",
    expected: "Preview updates and save succeeds with success toast.",
    actual: "",
    owner: "Priya",
    priority: "P2",
    status: "In Progress",
    tags: ["Regression"],
    lastRun: "2024-05-07T09:15:00.000Z",
    notes: "Waiting on CDN logging to verify propagation time.",
  },
];

const initialActivity: Activity[] = [
  {
    id: "activity-1",
    title: "Checkout happy path passed",
    timestamp: "2024-05-09T13:34:00.000Z",
    status: "Pass",
    details: "Execution on build 1.3.7",
  },
  {
    id: "activity-2",
    title: "Address validation failed",
    timestamp: "2024-05-08T17:00:00.000Z",
    status: "Fail",
    details: "Tracking bug PAY-212 escalated",
  },
  {
    id: "activity-3",
    title: "Added new profile photo scenario",
    timestamp: "2024-05-07T09:45:00.000Z",
    status: "In Progress",
    details: "Awaiting QA sign-off",
  },
];

const statusPalette: Record<TestStatus, string> = {
  "Not Started": "bg-slate-500 text-white",
  "In Progress": "bg-sky-500 text-white",
  Pass: "bg-emerald-500 text-white",
  Fail: "bg-rose-500 text-white",
  Blocked: "bg-amber-500 text-white",
};

const priorityColor: Record<TestPriority, string> = {
  P0: "bg-rose-100 text-rose-700",
  P1: "bg-amber-100 text-amber-700",
  P2: "bg-sky-100 text-sky-700",
  P3: "bg-slate-100 text-slate-600",
};

const statusActions: TestStatus[] = ["Pass", "Fail", "Blocked", "In Progress"];

export default function Home() {
  const [testCases, setTestCases] = useState<TestCase[]>(defaultCases);
  const [activity, setActivity] = useState<Activity[]>(initialActivity);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TestStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<TestPriority | "All">("All");

  const [form, setForm] = useState<Omit<TestCase, "id">>({
    name: "",
    feature: "",
    description: "",
    steps: "",
    expected: "",
    actual: "",
    owner: "",
    priority: "P2",
    status: "Not Started",
    tags: [],
    lastRun: new Date().toISOString(),
    notes: "",
  });

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();
    return testCases.filter((testCase) => {
      const matchesQuery =
        !query ||
        [testCase.name, testCase.feature, testCase.description, ...testCase.tags]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        statusFilter === "All" || testCase.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || testCase.priority === priorityFilter;

      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [priorityFilter, search, statusFilter, testCases]);

  const metrics = useMemo(() => {
    const total = testCases.length;
    const pass = testCases.filter((t) => t.status === "Pass").length;
    const fail = testCases.filter((t) => t.status === "Fail").length;
    const blocked = testCases.filter((t) => t.status === "Blocked").length;
    const progress = testCases.filter((t) => t.status === "In Progress").length;
    const completion = total === 0 ? 0 : Math.round((pass / total) * 100);
    return { total, pass, fail, blocked, progress, completion };
  }, [testCases]);

  const updateStatus = (id: string, status: TestStatus) => {
    const timestamp = new Date().toISOString();
    const target = testCases.find((testCase) => testCase.id === id);
    setTestCases((prev) =>
      prev.map((testCase) =>
        testCase.id === id ? { ...testCase, status, lastRun: timestamp } : testCase,
      ),
    );
    setActivity((prev) => [
      {
        id: `activity-${crypto.randomUUID()}`,
        title: `${target?.name ?? "Test case"} marked ${status}`,
        timestamp,
        status,
        details: `${target?.owner || "Unassigned"} • ${status}`,
      },
      ...prev.slice(0, 9),
    ]);
  };

  const resetForm = () =>
    setForm({
      name: "",
      feature: "",
      description: "",
      steps: "",
      expected: "",
      actual: "",
      owner: "",
      priority: "P2",
      status: "Not Started",
      tags: [],
      lastRun: new Date().toISOString(),
      notes: "",
    });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      return;
    }

    const timestamp = new Date().toISOString();
    const newCase: TestCase = {
      id: crypto.randomUUID(),
      ...form,
      tags: form.tags.map((tag) => tag.trim()).filter(Boolean),
      lastRun: new Date(form.lastRun).toISOString(),
    };

    setTestCases((prev) => [newCase, ...prev]);
    setActivity((prev) => [
      {
        id: `activity-${crypto.randomUUID()}`,
        title: `New test: ${newCase.name}`,
        timestamp,
        status: newCase.status,
        details: `${newCase.owner || "Unassigned"} • ${newCase.priority}`,
      },
      ...prev.slice(0, 9),
    ]);

    resetForm();
  };

  const chip = (label: string, className: string) => (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-950 py-16 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                QA Command Center
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                Real-time test lab for product launch readiness
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
                Track manual regression packs, spot risk trends, and close the loop
                on broken flows before they reach customers.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-right">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Release confidence
              </p>
              <p className="text-3xl font-semibold text-emerald-400">
                {metrics.completion}%
              </p>
              <p className="text-xs text-slate-500">
                {metrics.pass} / {metrics.total} regression checks passing
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Suite size</p>
            <p className="mt-2 text-2xl font-semibold">{metrics.total}</p>
            <p className="mt-4 h-2 rounded-full bg-slate-800">
              <span
                className="block h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.max(metrics.completion, metrics.total > 0 ? 6 : 0)}%` }}
              />
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Completion rate reflects passing scenarios.
            </p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Passing</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              {metrics.pass}
            </p>
            <p className="mt-2 text-xs text-emerald-300">
              Burn-down pacing is on target.
            </p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Failing</p>
            <p className="mt-2 text-2xl font-semibold text-rose-400">
              {metrics.fail}
            </p>
            <p className="mt-2 text-xs text-rose-300">
              {metrics.fail === 0 ? "No blockers in the funnel." : "Escalate to owning squad ASAP."}
            </p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">In progress</p>
            <p className="mt-2 text-2xl font-semibold text-sky-400">
              {metrics.progress}
            </p>
            <p className="mt-2 text-xs text-sky-300">
              Sync in daily QA stand-up to unblock.
            </p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                <h2 className="col-span-full text-lg font-semibold text-white">
                  Fast add
                </h2>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Name
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                    placeholder="Critical path scenario"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Feature
                  <input
                    value={form.feature}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, feature: event.target.value }))
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                    placeholder="Subsystem or epic"
                  />
                </label>
                <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-300">
                  Description
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    className="min-h-[80px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                    placeholder="Why does this scenario exist?"
                  />
                </label>
                <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-300">
                  Steps
                  <textarea
                    value={form.steps}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, steps: event.target.value }))
                    }
                    className="min-h-[80px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                    placeholder="Numbered or bullet steps"
                  />
                </label>
                <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-300">
                  Expected result
                  <textarea
                    value={form.expected}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, expected: event.target.value }))
                    }
                    className="min-h-[80px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                    placeholder="What should happen?"
                  />
                </label>
                <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-300">
                  Actual result (optional)
                  <textarea
                    value={form.actual}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, actual: event.target.value }))
                    }
                    className="min-h-[60px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                    placeholder="Current observed outcome"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Owner
                  <input
                    value={form.owner}
                    onChange={(event) => setForm((prev) => ({ ...prev, owner: event.target.value }))}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                    placeholder="Assignee"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Priority
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, priority: event.target.value as TestPriority }))
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                  >
                    <option value="P0">P0 - must pass</option>
                    <option value="P1">P1 - critical</option>
                    <option value="P2">P2 - high</option>
                    <option value="P3">P3 - nice to have</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, status: event.target.value as TestStatus }))
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                  >
                    <option value="Not Started">Not started</option>
                    <option value="In Progress">In progress</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Tags
                  <input
                    value={form.tags.join(", ")}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        tags: event.target.value.split(",").map((tag) => tag.trim()),
                      }))
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                    placeholder="Comma separated labels"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Last run
                  <input
                    type="datetime-local"
                    value={form.lastRun.slice(0, 16)}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        lastRun: event.target.value
                          ? new Date(event.target.value).toISOString()
                          : new Date().toISOString(),
                      }))
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                  />
                </label>
                <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-300">
                  Notes
                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, notes: event.target.value }))
                    }
                    className="min-h-[60px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                    placeholder="Share context or follow-up actions"
                  />
                </label>
                <div className="col-span-full flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-sky-400"
                  >
                    Add test case
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold text-white">Test catalog</h2>
                <div className="flex flex-1 items-center gap-2">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, feature, tags..."
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                >
                  <option value="All">All statuses</option>
                  <option value="Not Started">Not started</option>
                  <option value="In Progress">In progress</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="Blocked">Blocked</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(event) =>
                    setPriorityFilter(event.target.value as typeof priorityFilter)
                  }
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                >
                  <option value="All">All priorities</option>
                  <option value="P0">P0</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                </select>
              </div>
              <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                  <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Test case</th>
                      <th className="px-4 py-3 font-medium">Owner</th>
                      <th className="px-4 py-3 font-medium">Priority</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Last run</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                    {filteredCases.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                          No test cases match the current filters.
                        </td>
                      </tr>
                    )}
                    {filteredCases.map((testCase) => (
                      <tr key={testCase.id} className="align-top">
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-white">{testCase.name}</p>
                              {testCase.tags.map((tag) => (
                                <span
                                  key={`${testCase.id}-${tag}`}
                                  className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-slate-400">{testCase.description}</p>
                            <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300">
                              <p className="font-semibold text-slate-200">Steps</p>
                              <pre className="mt-1 whitespace-pre-wrap font-mono text-xs text-slate-400">
                                {testCase.steps || "—"}
                              </pre>
                              <p className="mt-3 font-semibold text-slate-200">Expected</p>
                              <p className="text-slate-300">{testCase.expected || "—"}</p>
                              {testCase.actual && (
                                <>
                                  <p className="mt-3 font-semibold text-slate-200">Actual</p>
                                  <p className="text-slate-300">{testCase.actual}</p>
                                </>
                              )}
                              {testCase.notes && (
                                <>
                                  <p className="mt-3 font-semibold text-slate-200">Notes</p>
                                  <p className="text-slate-300">{testCase.notes}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-300">
                          {testCase.owner || "—"}
                        </td>
                        <td className="px-4 py-4">
                          {chip(testCase.priority, priorityColor[testCase.priority])}
                        </td>
                        <td className="px-4 py-4">
                          {chip(testCase.status, statusPalette[testCase.status])}
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-400">
                          {new Date(testCase.lastRun).toLocaleString()}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2 text-xs text-slate-200">
                            {statusActions.map((state) => (
                              <button
                                key={state}
                                type="button"
                                onClick={() => updateStatus(testCase.id, state)}
                                className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 transition hover:border-sky-500 hover:text-sky-300"
                              >
                                Mark {state}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-white">Signals</h2>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Failure density
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    {metrics.fail > 0
                      ? "Investigate Payments squad regression from last build."
                      : "No failing tests. Ship checklist is green."}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Coverage note
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Add localization checks for EU purchase flow before code freeze.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Activity feed</h2>
                <span className="text-xs text-slate-500">Last 10 updates</span>
              </div>
              <div className="mt-4 space-y-4">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 p-4"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-500/80 via-sky-500/80 to-rose-500/80" />
                    <div className="pl-4">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                        {chip(item.status, statusPalette[item.status])}
                      </div>
                      <p className="mt-2 text-sm font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
