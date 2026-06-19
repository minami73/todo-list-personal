import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Icon, PRIORITY, PRIORITY_ORDER } from "./icons.jsx";

/* ------------------------------------------------------------------
   Priority menu (positioned popover)
------------------------------------------------------------------ */
function PriorityMenu({ anchor, current, onSelect, onClose }) {
    const ref = useRef(null);
    const [style, setStyle] = useState({ top: -9999, left: -9999 });

    useLayoutEffect(() => {
        if (!anchor || !ref.current) return;
        const a = anchor.getBoundingClientRect();
        const m = ref.current.getBoundingClientRect();
        let top = a.bottom + 6;
        let left = a.right - m.width;
        if (top + m.height > window.innerHeight - 8) top = a.top - m.height - 6;
        if (left < 8) left = 8;
        setStyle({ top, left });
    }, [anchor]);

    useEffect(() => {
        const handle = (e) => {
            if (ref.current && !ref.current.contains(e.target) && !anchor.contains(e.target)) onClose();
        };
        const esc = (e) => e.key === "Escape" && onClose();
        document.addEventListener("mousedown", handle);
        document.addEventListener("keydown", esc);
        return () => {
            document.removeEventListener("mousedown", handle);
            document.removeEventListener("keydown", esc);
        };
    }, [anchor, onClose]);

    return (
        <div ref={ref} className="priority-menu" style={style} role="menu">
            {PRIORITY_ORDER.slice().reverse().map((key) => {
                const p = PRIORITY[key];
                const Ico = p.Icon;
                return (
                    <button
                        key={key}
                        className={`priority-menu-item ${current === key ? "is-selected" : ""}`}
                        onClick={() => { onSelect(key); onClose(); }}
                        role="menuitem"
                    >
                        <span className="priority-menu-icon"><Ico /></span>
                        <span>{p.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

/* ------------------------------------------------------------------
   Task row
------------------------------------------------------------------ */
function TaskRow({
    task,
    isEditing,
    onStartEdit,
    onCommitEdit,
    onCancelEdit,
    onToggle,
    onChangePriority,
    onDelete,
    onDragStart,
    onDragOver,
    onDragEnd,
    isDragging,
    dropPosition,
}) {
    const [value, setValue] = useState(task.title);
    const [priorityAnchor, setPriorityAnchor] = useState(null);

    useEffect(() => {
        if (isEditing) setValue(task.title);
    }, [isEditing, task.title]);

    const commit = () => {
        const v = value.trim();
        if (!v) onDelete(task.id, { silent: true });
        else onCommitEdit(task.id, v);
    };

    const p = PRIORITY[task.priority || "none"];
    const Ico = p.Icon;

    return (
        <div
            className={[
                "task-row",
                isDragging && "is-dragging",
                dropPosition === "above" && "is-drop-target",
                dropPosition === "below" && "is-drop-target-below",
            ].filter(Boolean).join(" ")}
            draggable={!isEditing}
            onDragStart={(e) => onDragStart(e, task.id)}
            onDragOver={(e) => onDragOver(e, task.id)}
            onDragEnd={onDragEnd}
        >
            <span className="task-handle" aria-hidden><Icon.Grip /></span>

            <button
                className={`task-checkbox ${task.done ? "is-checked" : ""}`}
                onClick={() => onToggle(task.id)}
                aria-label={task.done ? "Marcar como pendiente" : "Marcar como completada"}
                aria-pressed={task.done}
            >
                {task.done && <Icon.Check />}
            </button>

            {isEditing ? (
                <input
                    className="task-title-input"
                    value={value}
                    autoFocus
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") commit();
                        if (e.key === "Escape") { onCancelEdit(); }
                    }}
                    placeholder="Título de la tarea"
                />
            ) : (
                <span
                    className={`task-title ${task.done ? "is-checked" : ""}`}
                    onClick={() => onStartEdit(task.id)}
                >
                    {task.title}
                </span>
            )}

            <button
                className={`task-priority priority-${task.priority || "none"}`}
                onClick={(e) => setPriorityAnchor(e.currentTarget)}
                title="Prioridad"
            >
                <span className="task-priority-icon"><Ico /></span>
                <span>{p.short}</span>
            </button>

            {priorityAnchor && (
                <PriorityMenu
                    anchor={priorityAnchor}
                    current={task.priority || "none"}
                    onSelect={(k) => onChangePriority(task.id, k)}
                    onClose={() => setPriorityAnchor(null)}
                />
            )}

            <span className="task-actions">
                <button
                    className="task-action-btn"
                    onClick={() => onStartEdit(task.id)}
                    title="Editar"
                    aria-label="Editar tarea"
                >
                    <Icon.Pencil />
                </button>
                <button
                    className="task-action-btn is-danger"
                    onClick={() => onDelete(task.id)}
                    title="Eliminar"
                    aria-label="Eliminar tarea"
                >
                    <Icon.Trash />
                </button>
            </span>
        </div>
    );
}

/* ------------------------------------------------------------------
   Main panel — task list for active list
------------------------------------------------------------------ */
function TaskPanel({
    list,
    tasks,
    onAddTask,
    onUpdateTask,
    onToggleTask,
    onDeleteTask,
    onReorderTasks,
    onRenameList,
    onDeleteList,
}) {
    const [editingListName, setEditingListName] = useState(false);
    const [listNameValue, setListNameValue] = useState(list.name);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [newTaskValue, setNewTaskValue] = useState("");
    const [composing, setComposing] = useState(false);

    const [dragTaskId, setDragTaskId] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);

    const newInputRef = useRef(null);

    useEffect(() => {
        setListNameValue(list.name);
        setEditingListName(false);
        setEditingTaskId(null);
        setComposing(false);
        setNewTaskValue("");
    }, [list.id]);

    const commitListName = () => {
        const v = listNameValue.trim();
        onRenameList(list.id, v || "Sin título");
        setEditingListName(false);
    };

    const startCompose = () => {
        setComposing(true);
        setTimeout(() => newInputRef.current?.focus(), 0);
    };

    const commitNew = () => {
        const v = newTaskValue.trim();
        if (v) onAddTask(list.id, v);
        setNewTaskValue("");
        // keep composing for rapid entry — Esc or blur to leave
        setTimeout(() => newInputRef.current?.focus(), 0);
    };

    const cancelNew = () => {
        setComposing(false);
        setNewTaskValue("");
    };

    /* ----- DnD for tasks ----- */
    const handleDragStart = (e, id) => {
        setDragTaskId(id);
        e.dataTransfer.effectAllowed = "move";
        try { e.dataTransfer.setData("text/plain", id); } catch (_) { }
    };

    const handleDragOver = (e, id) => {
        if (!dragTaskId || dragTaskId === id) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const position = e.clientY < rect.top + rect.height / 2 ? "above" : "below";
        setDropTarget({ id, position });
    };

    const handleDragEnd = () => {
        if (dragTaskId && dropTarget && dragTaskId !== dropTarget.id) {
            onReorderTasks(list.id, dragTaskId, dropTarget.id, dropTarget.position);
        }
        setDragTaskId(null);
        setDropTarget(null);
    };

    const counts = {
        total: tasks.length,
        done: tasks.filter((t) => t.done).length,
    };
    const pending = counts.total - counts.done;

    return (
        <main className="main">
            <header className="main-header">
                <div className="main-title-row">
                    {editingListName ? (
                        <input
                            className="main-title-input"
                            value={listNameValue}
                            autoFocus
                            onChange={(e) => setListNameValue(e.target.value)}
                            onBlur={commitListName}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") commitListName();
                                if (e.key === "Escape") { setListNameValue(list.name); setEditingListName(false); }
                            }}
                        />
                    ) : (
                        <h1 className="main-title" onClick={() => setEditingListName(true)}>
                            {list.name}
                        </h1>
                    )}

                    <div className="main-title-actions">
                        <button
                            className="title-action-btn"
                            onClick={startCompose}
                            title="Añadir tarea"
                            aria-label="Añadir tarea"
                        >
                            <Icon.Plus />
                        </button>
                        <button
                            className="title-action-btn"
                            onClick={() => setEditingListName(true)}
                            title="Renombrar lista"
                            aria-label="Renombrar lista"
                        >
                            <Icon.Pencil />
                        </button>
                        <button
                            className="title-action-btn is-danger"
                            onClick={() => onDeleteList(list.id)}
                            title="Eliminar lista"
                            aria-label="Eliminar lista"
                        >
                            <Icon.Trash />
                        </button>
                    </div>
                </div>

                <div className="main-meta">
                    <span>{pending} {pending === 1 ? "pendiente" : "pendientes"}</span>
                    <span className="main-meta-dot" />
                    <span>{counts.done} {counts.done === 1 ? "completada" : "completadas"}</span>
                    <span className="main-meta-dot" />
                    <span>{counts.total} {counts.total === 1 ? "total" : "totales"}</span>
                </div>
            </header>

            <div className="main-body">
                <div className="task-list">
                    {tasks.map((task) => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            isEditing={editingTaskId === task.id}
                            onStartEdit={(id) => setEditingTaskId(id)}
                            onCommitEdit={(id, title) => {
                                onUpdateTask(list.id, id, { title });
                                setEditingTaskId(null);
                            }}
                            onCancelEdit={() => setEditingTaskId(null)}
                            onToggle={(id) => onToggleTask(list.id, id)}
                            onChangePriority={(id, priority) => onUpdateTask(list.id, id, { priority })}
                            onDelete={(id, opts) => onDeleteTask(list.id, id, opts)}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                            isDragging={dragTaskId === task.id}
                            dropPosition={
                                dropTarget?.id === task.id ? dropTarget.position : null
                            }
                        />
                    ))}

                    {composing ? (
                        <div className="task-new-row">
                            <span className="task-new-spacer" />
                            <span className="task-checkbox" aria-hidden />
                            <input
                                ref={newInputRef}
                                className="task-new-input"
                                value={newTaskValue}
                                onChange={(e) => setNewTaskValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") commitNew();
                                    if (e.key === "Escape") cancelNew();
                                }}
                                onBlur={() => {
                                    if (newTaskValue.trim()) commitNew();
                                    else cancelNew();
                                }}
                                placeholder="Nueva tarea — Enter para guardar, Esc para cancelar"
                            />
                        </div>
                    ) : (
                        <button className="task-add-trigger" onClick={startCompose}>
                            <Icon.Plus />
                            <span>Añadir tarea</span>
                        </button>
                    )}

                    {tasks.length === 0 && !composing && (
                        <div className="tasks-empty">
                            Sin tareas todavía. Añade una arriba para empezar.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default TaskPanel;
