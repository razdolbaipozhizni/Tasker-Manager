// src/pages/Archive.js
import React, { useEffect, useState, useCallback } from "react";
import { useParams} from "react-router-dom";
import axios from "axios";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { FaTrash, FaUndo } from "react-icons/fa";
import moment from "moment";
import "moment/locale/ru";
moment.locale("ru");

// Словарь для перевода статусов
const STATUS_LABELS = {
  planned: "Запланировано",
  inProgress: "В работе",
  done: "Выполнено",
};

const Archive = () => {
  const { projectId } = useParams();
  const token = localStorage.getItem("token");

  const [archived, setArchived] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState(null);
  const [messageVariant, setMessageVariant] = useState("info");
  const [project, setProject] = useState(null);
  const [userId, setUserId] = useState(null);

  const loadArchivedTasks = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `/api/tasks/archived/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setArchived(data);
    } catch (err) {
      console.error(err);
    }
  }, [projectId, token]);

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

  useEffect(() => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUserId(payload.id);
  }, [token]);

  useEffect(() => {
    loadArchivedTasks();
    loadProject();
  }, [loadArchivedTasks, loadProject]);

  const isAdmin = project && project.owner && project.owner._id === userId;

  const showMessage = (text, variant = "info") => {
    setMessage(text);
    setMessageVariant(variant);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRestoreTask = async (task) => {
    try {
      await axios.put(`/api/tasks/${task._id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage("Задача восстановлена!", "success");
      loadArchivedTasks();
    } catch {
      showMessage("Ошибка восстановления!", "danger");
    }
  };

  const handleDeleteTask = async (task) => {
    if (!isAdmin) return alert("Это действие может совершать только администратор!");
    try {
      await axios.delete(`/api/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage("Задача удалена!", "danger");
      loadArchivedTasks();
    } catch {
      showMessage("Ошибка удаления!", "danger");
    }
  };

  const handleDeleteAll = async () => {
    if (!isAdmin) return alert("Это действие может совершать только администратор!");
    if (!window.confirm("Удалить все архивированные задачи?")) return;
    try {
      await Promise.all(
        archived.map(t =>
          axios.delete(`/api/tasks/${t._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      showMessage("Все задачи удалены!", "danger");
      loadArchivedTasks();
    } catch {
      showMessage("Ошибка удаления всех!", "danger");
    }
  };

  const filtered = archived.filter(task =>
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.description.toLowerCase().includes(search.toLowerCase())
  );

  const isSearching = search.trim().length > 0;

  return (
    <Container className="mt-4">
      <h3 className="text-center mb-3">
        📁 Архив выполненных задач <span className="text-muted">({filtered.length})</span>
      </h3>

      <Form.Control
        type="text"
        placeholder="Поиск по названию или описанию..."
        className="mb-4"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {message && (
        <Alert variant={messageVariant} className="text-center py-1 mb-3">
          {message}
        </Alert>
      )}

      {filtered.length > 0 && (
        <div className="text-center mb-4">
          <Button variant="danger" onClick={handleDeleteAll}>
            <FaTrash className="me-2" /> Удалить все задачи
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-muted">
          Архив пуст или ничего не найдено.
        </p>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4}>
          {filtered.map(task => (
            <Col key={task._id} className="mb-3">
              <Card
                className={`p-2 shadow-sm ${
                  isSearching ? "border-warning" : "border-light"
                }`}
                style={{
                  backgroundColor: isSearching ? "#fff3cd" : undefined,
                  transition: "background-color 0.3s, border-color 0.3s"
                }}
              >
                <div>
                  <strong>{task.title}</strong>
                  <div className="text-muted small">{task.description}</div>
                  {task.dueDate && (
                    <div className="text-muted small mt-1">
                      📅 Выполнить до: {moment(task.dueDate).calendar()}
                    </div>
                  )}
                  <div className="text-muted small">
                    🕒 Создана: {moment(task.createdAt).calendar()}
                  </div>
                  <div className="text-muted small">
                    👤 Автор: <strong title={task.createdBy?.email}>{task.createdBy?.name || "Неизвестно"}</strong>
                  </div>
                  <div className="text-muted small mt-1">
                    🖍️ Статус при архивировании: <strong>{STATUS_LABELS[task.previousStatus]}</strong>
                  </div>
                  <div className="text-muted small">
                    🗄️ Архивировал: <strong>{task.updatedBy?.name || "Неизвестно"}</strong>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-3 mt-2">
                  <FaUndo
                    className="text-success"
                    title="Вернуть"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleRestoreTask(task)}
                  />
                  <FaTrash
                    className="text-danger"
                    title="Удалить"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDeleteTask(task)}
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Archive;