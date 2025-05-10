// src/components/TaskModal.js
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import moment from "moment";
import "moment/locale/ru";
moment.locale("ru");

const TaskModal = ({ show, onHide, task, onSave, onArchive }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [assignedTo, setAssignedTo] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setDateTime(task.dueDate ? moment(task.dueDate).format("YYYY-MM-DDTHH:mm") : "");
      setUrgent(task.urgent || false);
      setAssignedTo(task.assignedTo || []);

      const fetchMembers = async () => {
        if (task.project) {
          try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/projects/${task.project}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const projectData = await res.json();
            setMembers(projectData.members || []);
          } catch (err) {
            console.error("Ошибка загрузки участников проекта:", err);
          }
        }
      };

      fetchMembers();
    }
  }, [task]);

  const handleSave = () => {
    onSave({
      ...task,
      title,
      description,
      dueDate: dateTime ? new Date(dateTime).toISOString() : null,
      urgent,
      assignedTo,
    });
    onHide();
  };

  const handleArchive = () => {
    onArchive();
    setTimeout(onHide, 100);
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    return moment(isoDate).calendar();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Редактировать задачу</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Название</Form.Label>
            <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Дата и время выполнения</Form.Label>
            <Form.Control
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Check
              type="checkbox"
              label="Срочно 🔥"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Назначенные участники</Form.Label>
            {assignedTo.length === 0 ? (
              <div className="text-muted">Никто не назначен</div>
            ) : (
              assignedTo.map((user) => (
                <div
                  key={user._id || user}
                  className="d-flex justify-content-between align-items-center mb-1"
                >
                <span>
                  <strong>
                    {user.name || members.find((m) => m._id === user)?.name || "Неизвестно"}
                  </strong>{" "}
                  (
                  {user.email ||
                    members.find((m) => m._id === user)?.email ||
                    "нет email"}
                  )
                </span>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() =>
                      setAssignedTo((prev) =>
                        prev.filter((id) =>
                          typeof id === "object" ? id._id !== (user._id || user) : id !== (user._id || user)
                        )
                      )
                    }
                  >
                    Удалить
                  </Button>
                </div>
              ))
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Доступные участники</Form.Label>
            {members
              .filter(
                (m) =>
                  !assignedTo.some((u) =>
                    typeof u === "object" ? u._id === m._id : u === m._id
                  )
              )
              .map((m) => (
                <div
                  key={m._id}
                  className="d-flex justify-content-between align-items-center mb-1"
                >
                  <span>
                    {m.name} <span className="text-muted">({m.email})</span>
                  </span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setAssignedTo((prev) => [...prev, m._id])}
                  >
                    Добавить
                  </Button>
                </div>
              ))}
          </Form.Group>

          {task && (
            <>
              <hr />
              <div className="text-muted small ps-3 pb-2">
                <div className="d-flex align-items-center mb-1">
                  <span className="me-1">🕒</span>
                  Последнее обновление:&nbsp;
                  <strong>{formatDate(task.updatedAt)}</strong>
                </div>
                <div className="d-flex align-items-center">
                  <span className="me-1">✏️</span>
                  Изменил:&nbsp;
                  {task.updatedBy ? (
                    <strong title={task.updatedBy.email}>{task.updatedBy.name}</strong>
                  ) : (
                    <strong>Неизвестно</strong>
                  )}
                </div>
              </div>
            </>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleArchive}>
          Завершить (в архив)
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskModal;
