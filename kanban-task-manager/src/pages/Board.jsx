// src/pages/Board.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import axios from "axios";
import Column from "../components/Column";
import { DragDropContext } from "react-beautiful-dnd";
import { Container, Row, Button, Spinner, Alert } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

const Board = () => {
  const { projectId } = useParams();
  const token = localStorage.getItem("token");

  const [tasksByStatus, setTasksByStatus] = useState({
    planned: [],
    inProgress: [],
    done: []
  });
  const [loading, setLoading] = useState(true);
  const [boardMessage, setBoardMessage] = useState(null);
  const [boardMessageVariant, setBoardMessageVariant] = useState("info");
  const [search, setSearch] = useState("");
  const [newTaskId, setNewTaskId] = useState(null);
  const [project, setProject] = useState(null);
  const [userId, setUserId] = useState(null);

  // Получаем ID текущего пользователя из токена
  useEffect(() => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUserId(payload.id);
  }, [token]);

  const loadProject = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(data);
    } catch (err) {
      console.error("Ошибка загрузки проекта:", err);
    }
  }, [projectId, token]);

  const isAdmin = project && project.owner && project.owner._id === userId;

  const showBoardMessage = (text, variant = "info") => {
    setBoardMessage(text);
    setBoardMessageVariant(variant);
    setTimeout(() => setBoardMessage(null), 3000);
  };

  const loadTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/tasks/projects/${projectId}/tasks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const live = data.filter((t) => !t.isDeleted && !t.isArchived);
      const grouped = { planned: [], inProgress: [], done: [] };
      live.forEach((t) => {
        if (grouped[t.status]) grouped[t.status].push(t);
      });
      setTasksByStatus(grouped);
    } catch (err) {
      console.error("Ошибка загрузки задач:", err);
      showBoardMessage("Ошибка загрузки задач!", "danger");
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    loadProject();
    loadTasks();
  }, [loadProject, loadTasks]);

  if (!projectId) return <Navigate to="/projects" replace />;

  const handleAddTask = async (title, description, dueDate, status = "planned", urgent = false) => {
    try {
      const { data } = await axios.post(
        "/api/tasks",
        { projectId, title, description, dueDate, status, urgent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTaskId(data._id);
      await loadTasks();
      setTimeout(() => setNewTaskId(null), 3000);
    } catch (err) {
      console.error("Ошибка создания задачи:", err);
      showBoardMessage("Ошибка добавления задачи!", "danger");
    }
  };

  const handleResetTasks = async () => {
    if (!isAdmin) {
      alert("Это действие может совершать только администратор!");
      return;
    }
    if (!window.confirm("Удалить все задачи проекта?")) return;
    const all = [
      ...tasksByStatus.planned,
      ...tasksByStatus.inProgress,
      ...tasksByStatus.done,
    ];
    await Promise.all(
      all.map((t) =>
        axios.delete(`/api/tasks/${t._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
    await loadTasks();
    showBoardMessage("Все задачи удалены!", "danger");
  };

  const statuses = ["planned", "inProgress", "done"];
  const columnTitles = {
    planned: "Запланировано",
    inProgress: "В работе",
    done: "Выполнено"
  };

  const filtered = {
    planned: tasksByStatus.planned.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    ),
    inProgress: tasksByStatus.inProgress.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    ),
    done: tasksByStatus.done.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    ),
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

    const newTasks = { ...tasksByStatus };
    const sourceList = Array.from(newTasks[source.droppableId]);
    const [moved] = sourceList.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceList.splice(destination.index, 0, moved);
      newTasks[source.droppableId] = sourceList;
    } else {
      const destList = Array.from(newTasks[destination.droppableId]);
      destList.splice(destination.index, 0, { ...moved, status: destination.droppableId });
      newTasks[source.droppableId] = sourceList;
      newTasks[destination.droppableId] = destList;
    }

    setTasksByStatus(newTasks);

    if (source.droppableId !== destination.droppableId) {
      try {
        await axios.put(
          `/api/tasks/${draggableId}`,
          { status: destination.droppableId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showBoardMessage("Статус задачи обновлён!", "success");
      } catch (err) {
        console.error("Ошибка обновления статуса:", err);
        showBoardMessage("Ошибка обновления статуса!", "danger");
        loadTasks();
      }
    }
  };

  return (
    <Container fluid className="mt-3">
      {boardMessage && (
        <Alert variant={boardMessageVariant} className="text-center py-2">
          {boardMessage}
        </Alert>
      )}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-2">
        <Button
          variant="danger"
          onClick={handleResetTasks}
          className="mb-2 mb-md-0"
        >
          Сбросить все задачи
        </Button>

        <div className="position-relative" style={{ maxWidth: 300, width: "100%" }}>
          <FaSearch className="position-absolute" style={{ top: "50%", left: 10, transform: "translateY(-50%)", color: "#6c757d" }} />
          <input
            type="text"
            className="form-control ps-5"
            placeholder="Поиск задач..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="text-center mb-3">
          <Spinner animation="border" />
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Row xs={1} sm={1} md={3} className="g-3">
          {statuses.map((columnId) => (
            <Column
              key={columnId}
              title={columnTitles[columnId]}
              columnId={columnId}
              tasks={loading ? [] : filtered[columnId]}
              searchQuery={search}
              onAddTask={handleAddTask}
              refreshTasks={loadTasks}
              newTaskId={newTaskId}
            />
          ))}
        </Row>
      </DragDropContext>
    </Container>
  );
};

export default Board;
