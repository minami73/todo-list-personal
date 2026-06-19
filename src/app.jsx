import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Sidebar from "./sidebar.jsx";
import TaskPanel from "./tasks.jsx";

const STORAGE_KEY = "om_todo_state_v1";
const THEME_KEY = "om_todo_theme_v1";

const uid = () =>
    (crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);

/* ------------------------------------------------------------------
   Seed data — used only on first run
------------------------------------------------------------------ */
function makeSeed() {
    const l1 = uid();
    const l2 = uid();
    const l3 = uid();
    return {
        lists: [
            { id: l1, name: "Hoy" },
            { id: l2, name: "Trabajo" },
            { id: l3, name: "Personal" },
        ],
        tasksByList: {
            [l1]: [
                { id: uid(), title: "Revisar correo de la mañana", done: false, priority: "medium" },
                { id: uid(), title: "Llamada de 1:1 con María", done: false, priority: "high" },
                { id: uid(), title: "Comprar café", done: true, priority: "low" },
                { id: uid(), title: "Salir a caminar 20 min", done: false, priority: "none" },
            ],
            [l2]: [
                { id: uid(), title: "Cerrar specs del nuevo onboarding", done: false, priority: "high" },
                { id: uid(), title: "Revisar PRs pendientes", done: false, priority: "medium" },
                { id: uid(), title: "Preparar notas para la review", done: false, priority: "low" },
            ],
            [l3]: [
                { id: uid(), title: "Reservar mesa para el sábado", done: false, priority: "medium" },
                { id: uid(), title: "Pagar renta", done: true, priority: "high" },
                { id: uid(), title: "Recoger ropa de la tintorería", done: false, priority: "low" },
            ],
        },
        activeId: l1,
    };
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (_) { }
    return makeSeed();
}

function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { }
}

function loadTheme() {
    try {
        const t = localStorage.getItem(THEME_KEY);
        if (t === "light" || t === "dark") return t;
    } catch (_) { }
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
}

/* ------------------------------------------------------------------
   Reorder helper (above/below semantics)
------------------------------------------------------------------ */
function reorderArr(arr, fromId, toId, position) {
    const fromIdx = arr.findIndex((x) => x.id === fromId);
    const toIdx = arr.findIndex((x) => x.id === toId);
    if (fromIdx < 0 || toIdx < 0) return arr;
    const next = arr.slice();
    const [moved] = next.splice(fromIdx, 1);
    let insertAt = next.findIndex((x) => x.id === toId);
    if (position === "below") insertAt += 1;
    next.splice(insertAt, 0, moved);
    return next;
}

/* ------------------------------------------------------------------
   App
------------------------------------------------------------------ */
function App() {
    const [state, setState] = useState(loadState);
    const [theme, setTheme] = useState(loadTheme);
    const [toast, setToast] = useState(null); // { msg, onUndo, timeoutId }
    const toastTimeoutRef = useRef(null);

    /* ----- persistence ----- */
    useEffect(() => { saveState(state); }, [state]);
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        try { localStorage.setItem(THEME_KEY, theme); } catch (_) { }
    }, [theme]);

    /* ----- derived ----- */
    const activeList = useMemo(
        () => state.lists.find((l) => l.id === state.activeId) || state.lists[0],
        [state.lists, state.activeId]
    );

    const activeTasks = activeList ? (state.tasksByList[activeList.id] || []) : [];

    const taskCounts = useMemo(() => {
        const out = {};
        for (const l of state.lists) {
            const ts = state.tasksByList[l.id] || [];
            out[l.id] = ts.filter((t) => !t.done).length;
        }
        return out;
    }, [state.lists, state.tasksByList]);

    /* ----- toast ----- */
    const showToast = useCallback((msg, onUndo) => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast({ msg, onUndo });
        toastTimeoutRef.current = setTimeout(() => setToast(null), 5000);
    }, []);

    const dismissToast = () => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast(null);
    };

    /* ----- list actions ----- */
    const handleSelectList = (id) => setState((s) => ({ ...s, activeId: id }));

    const handleCreateList = () => {
        const id = uid();
        setState((s) => ({
            ...s,
            lists: [...s.lists, { id, name: "Nueva lista" }],
            tasksByList: { ...s.tasksByList, [id]: [] },
            activeId: id,
        }));
        return id;
    };

    const handleRenameList = (id, name) => {
        setState((s) => ({
            ...s,
            lists: s.lists.map((l) => (l.id === id ? { ...l, name } : l)),
        }));
    };

    const handleDeleteList = (id) => {
        setState((s) => {
            const idx = s.lists.findIndex((l) => l.id === id);
            if (idx < 0) return s;
            const removed = { list: s.lists[idx], tasks: s.tasksByList[id] || [], idx };
            const nextLists = s.lists.filter((l) => l.id !== id);
            const nextTbl = { ...s.tasksByList };
            delete nextTbl[id];
            const nextActive =
                s.activeId === id
                    ? (nextLists[idx] || nextLists[idx - 1] || nextLists[0])?.id
                    : s.activeId;

            // schedule toast after state commit
            setTimeout(() => {
                showToast(`"${removed.list.name}" eliminada`, () => {
                    setState((cur) => {
                        const lists = cur.lists.slice();
                        lists.splice(Math.min(removed.idx, lists.length), 0, removed.list);
                        return {
                            ...cur,
                            lists,
                            tasksByList: { ...cur.tasksByList, [removed.list.id]: removed.tasks },
                            activeId: removed.list.id,
                        };
                    });
                    dismissToast();
                });
            }, 0);

            return { ...s, lists: nextLists, tasksByList: nextTbl, activeId: nextActive };
        });
    };

    const handleReorderLists = (fromId, toId, position) => {
        setState((s) => ({ ...s, lists: reorderArr(s.lists, fromId, toId, position) }));
    };

    /* ----- task actions ----- */
    const handleAddTask = (listId, title) => {
        const task = { id: uid(), title, done: false, priority: "none" };
        setState((s) => ({
            ...s,
            tasksByList: {
                ...s.tasksByList,
                [listId]: [...(s.tasksByList[listId] || []), task],
            },
        }));
    };

    const handleUpdateTask = (listId, taskId, patch) => {
        setState((s) => ({
            ...s,
            tasksByList: {
                ...s.tasksByList,
                [listId]: (s.tasksByList[listId] || []).map((t) =>
                    t.id === taskId ? { ...t, ...patch } : t
                ),
            },
        }));
    };

    const handleToggleTask = (listId, taskId) => {
        setState((s) => ({
            ...s,
            tasksByList: {
                ...s.tasksByList,
                [listId]: (s.tasksByList[listId] || []).map((t) =>
                    t.id === taskId ? { ...t, done: !t.done } : t
                ),
            },
        }));
    };

    const handleDeleteTask = (listId, taskId, opts = {}) => {
        setState((s) => {
            const arr = s.tasksByList[listId] || [];
            const idx = arr.findIndex((t) => t.id === taskId);
            if (idx < 0) return s;
            const removed = arr[idx];
            const next = arr.slice();
            next.splice(idx, 1);

            if (!opts.silent) {
                setTimeout(() => {
                    showToast(`"${removed.title}" eliminada`, () => {
                        setState((cur) => {
                            const a = (cur.tasksByList[listId] || []).slice();
                            a.splice(Math.min(idx, a.length), 0, removed);
                            return { ...cur, tasksByList: { ...cur.tasksByList, [listId]: a } };
                        });
                        dismissToast();
                    });
                }, 0);
            }

            return {
                ...s,
                tasksByList: { ...s.tasksByList, [listId]: next },
            };
        });
    };

    const handleReorderTasks = (listId, fromId, toId, position) => {
        setState((s) => ({
            ...s,
            tasksByList: {
                ...s.tasksByList,
                [listId]: reorderArr(s.tasksByList[listId] || [], fromId, toId, position),
            },
        }));
    };

    const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

    return (
        <div className="app">
            <Sidebar
                lists={state.lists}
                activeId={activeList?.id}
                onSelect={handleSelectList}
                onCreate={handleCreateList}
                onRename={handleRenameList}
                onDelete={handleDeleteList}
                onReorder={handleReorderLists}
                theme={theme}
                onToggleTheme={toggleTheme}
                taskCounts={taskCounts}
            />

            {activeList ? (
                <TaskPanel
                    list={activeList}
                    tasks={activeTasks}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onReorderTasks={handleReorderTasks}
                    onRenameList={handleRenameList}
                    onDeleteList={handleDeleteList}
                />
            ) : (
                <main className="main">
                    <div className="main-empty">
                        <h2>No tienes ninguna lista</h2>
                        <p>Crea tu primera lista para empezar a organizar tus tareas.</p>
                        <button onClick={handleCreateList}>Crear lista</button>
                    </div>
                </main>
            )}

            {toast && (
                <div className="toast-wrap">
                    <div className="toast">
                        <span className="toast-msg">{toast.msg}</span>
                        <button className="toast-undo" onClick={toast.onUndo}>Deshacer</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
