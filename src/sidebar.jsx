import { useState } from "react";
import { Icon } from "./icons.jsx";

/* ------------------------------------------------------------------
   Sidebar — lists CRUD + drag-reorder
------------------------------------------------------------------ */
function Sidebar({
    lists,
    activeId,
    onSelect,
    onCreate,
    onRename,
    onDelete,
    onReorder,
    theme,
    onToggleTheme,
    taskCounts,
    isOpen,
    onClose,
}) {
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [dragId, setDragId] = useState(null);
    const [dropTarget, setDropTarget] = useState(null); // { id, position: 'above'|'below' }

    const startEdit = (list) => {
        setEditingId(list.id);
        setEditValue(list.name);
    };

    const commitEdit = () => {
        if (editingId) {
            const v = editValue.trim();
            onRename(editingId, v || "Sin título");
        }
        setEditingId(null);
        setEditValue("");
    };

    const handleCreate = () => {
        const id = onCreate();
        setEditingId(id);
        setEditValue("");
    };

    /* ----- DnD ----- */
    const handleDragStart = (e, id) => {
        setDragId(id);
        e.dataTransfer.effectAllowed = "move";
        try { e.dataTransfer.setData("text/plain", id); } catch (_) { }
    };

    const handleDragOver = (e, id) => {
        if (!dragId || dragId === id) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const position = e.clientY < rect.top + rect.height / 2 ? "above" : "below";
        setDropTarget({ id, position });
    };

    const handleDragLeave = (e) => {
        // Only clear if we're truly leaving the row
        if (!e.currentTarget.contains(e.relatedTarget)) {
            // don't clear — let next dragover overwrite
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (dragId && dropTarget && dragId !== dropTarget.id) {
            onReorder(dragId, dropTarget.id, dropTarget.position);
        }
        setDragId(null);
        setDropTarget(null);
    };

    const handleDragEnd = () => {
        setDragId(null);
        setDropTarget(null);
    };

    return (
        <>
            <div
                className={`sidebar-backdrop ${isOpen ? "is-visible" : ""}`}
                onClick={onClose}
                aria-hidden
            />
            <aside className={`sidebar ${isOpen ? "is-open" : ""}`}>
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-mark">T</div>
                    <span>To-do</span>
                </div>
                <button
                    className="theme-toggle"
                    onClick={onToggleTheme}
                    title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
                    aria-label="Cambiar tema"
                >
                    {theme === "dark" ? <Icon.Sun /> : <Icon.Moon />}
                </button>
            </div>

            <div className="sidebar-section-label">
                <span>Listas</span>
                <button
                    className="sidebar-add"
                    onClick={handleCreate}
                    title="Nueva lista"
                    aria-label="Crear lista"
                >
                    <Icon.Plus />
                </button>
            </div>

            <div className="sidebar-lists" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                {lists.length === 0 && (
                    <div className="sidebar-empty">
                        Aún no tienes listas. Crea una con el botón <strong>+</strong>.
                    </div>
                )}

                {lists.map((list) => {
                    const count = taskCounts[list.id] || 0;
                    const isActive = list.id === activeId;
                    const isEditing = editingId === list.id;
                    const isDragging = dragId === list.id;
                    const isDropAbove = dropTarget?.id === list.id && dropTarget.position === "above";
                    const isDropBelow = dropTarget?.id === list.id && dropTarget.position === "below";

                    return (
                        <div
                            key={list.id}
                            className={[
                                "list-row",
                                isActive && "is-active",
                                isDragging && "is-dragging",
                                isDropAbove && "is-drop-target",
                                isDropBelow && "is-drop-target-below",
                            ].filter(Boolean).join(" ")}
                            draggable={!isEditing}
                            onDragStart={(e) => handleDragStart(e, list.id)}
                            onDragOver={(e) => handleDragOver(e, list.id)}
                            onDragLeave={handleDragLeave}
                            onDragEnd={handleDragEnd}
                            onClick={() => !isEditing && onSelect(list.id)}
                            onDoubleClick={() => startEdit(list)}
                        >
                            <span className="list-handle" aria-hidden>
                                <Icon.Grip />
                            </span>
                            <span className="list-icon" aria-hidden>
                                <Icon.List />
                            </span>

                            {isEditing ? (
                                <input
                                    className="list-name-input"
                                    value={editValue}
                                    autoFocus
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={commitEdit}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") commitEdit();
                                        if (e.key === "Escape") { setEditingId(null); setEditValue(""); }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="Nombre de la lista"
                                />
                            ) : (
                                <span className="list-name">{list.name}</span>
                            )}

                            {!isEditing && (
                                <>
                                    <span className="list-count" title={`${count} tareas pendientes`}>
                                        {count > 0 ? count : ""}
                                    </span>
                                    <span className="list-actions">
                                        <button
                                            className="list-action-btn"
                                            onClick={(e) => { e.stopPropagation(); startEdit(list); }}
                                            title="Renombrar"
                                            aria-label="Renombrar lista"
                                        >
                                            <Icon.Pencil />
                                        </button>
                                        <button
                                            className="list-action-btn is-danger"
                                            onClick={(e) => { e.stopPropagation(); onDelete(list.id); }}
                                            title="Eliminar"
                                            aria-label="Eliminar lista"
                                        >
                                            <Icon.Trash />
                                        </button>
                                    </span>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="sidebar-footer">
                <span>{lists.length} {lists.length === 1 ? "lista" : "listas"}</span>
                <span>⇧⌘N nueva</span>
            </div>
            </aside>
        </>
    );
}

export default Sidebar;
