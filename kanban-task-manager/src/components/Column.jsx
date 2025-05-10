// src/components/Column.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Button, Form, Alert } from "react-bootstrap";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { FaTrash, FaArchive } from "react-icons/fa";
import TaskModal from "./TaskModal";

import moment from "moment";
import "moment/locale/ru";
moment.locale("ru");

const Column = ({
  title,
  columnId,
  tasks = [],
  onAddTask,
  refreshTasks,
  searchQuery = "",
  newTaskId,
}) => {
  const token = localStorage.getItem("token");

  const [taskInput, setTaskInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [messageVariant, setMessageVariant] = useState("info");

  const showTempMessage = (text, variant = "info") => {
    setActionMessage(text);
    setMessageVariant(variant);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleAdd = async () => {
    if (!taskInput.trim()) return;
    try {
      await onAddTask(taskInput, descInput, dateInput, columnId /* без urgent */);
      setTaskInput("");
      setDescInput("");
      setDateInput("");
      showTempMessage("Задача добавлена!", "success");
    } catch {
      console.error("Ошибка при добавлении задачи");
      showTempMessage("Ошибка добавления задачи!", "danger");
    }
  };

  const formatDate = (iso) => (iso ? moment(iso).calendar() : "");

  const [highlighted, setHighlighted] = useState(null);
  useEffect(() => {
    if (newTaskId) {
      setHighlighted(newTaskId);
      const t = setTimeout(() => setHighlighted(null), 3000);
      return () => clearTimeout(t);
    }
  }, [newTaskId]);

  return (
    <Card className="p-2 mb-3 h-100 shadow-sm">
      <h5 className="text-center">
        {title} <span className="text-muted">({tasks.length})</span>
      </h5>

      {actionMessage && (
        <Alert variant={messageVariant} className="py-1 text-center my-2">
          {actionMessage}
        </Alert>
      )}

      <Form className="mb-3">
        <Form.Control
          type="text"
          placeholder="Название задачи"
          className="mb-2"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
        <Form.Control
          as="textarea"
          placeholder="Описание"
          className="mb-2"
          rows={2}
          value={descInput}
          onChange={(e) => setDescInput(e.target.value)}
        />
        <Form.Control
          type="datetime-local"
          className="mb-2"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
        />
        <Button variant="primary" onClick={handleAdd} className="w-100">
          Добавить
        </Button>
      </Form>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`d-flex flex-column gap-2 ${
              snapshot.isDraggingOver ? "bg-light" : ""
            }`}
            style={{ minHeight: 100 }}
          >
            {tasks.map((task, idx) => {
              const matchesSearch =
                searchQuery &&
                (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  task.description.toLowerCase().includes(searchQuery.toLowerCase()));
              const isNew = task._id === highlighted;
              

              return (
                <Draggable key={task._id} draggableId={task._id} index={idx}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-2 ${snapshot.isDragging ? "shadow" : ""} ${
                        isNew ? "border border-warning" : ""
                      }`}
                      style={{
                        backgroundColor: isNew
                          ? "#fff9db"
                          : matchesSearch
                          ? "#fff3cd"
                          : undefined,
                        transition: "background-color 0.3s ease, border 0.3s ease",
                        ...provided.draggableProps.style,
                      }}
                    >
                      <div className="d-flex justify-content-between">
                        <div style={{ flexGrow: 1 }}>
                          <div
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectedTask(task);
                              setShowModal(true);
                            }}
                          >
                            <strong>
                              {task.urgent && <span style={{ color: "red" }}>🔥 </span>}
                              {task.title}
                            </strong>
                          </div>
                          <div
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectedTask(task);
                              setShowModal(true);
                            }}
                            className="text-muted small"
                          >
                            {task.description || "Без описания"}
                          </div>
                          {task.dueDate && (
                            <div className="text-muted small">
                              📅 Выполнить до: {formatDate(task.dueDate)}
                            </div>
                          )}
                          <div className="text-muted small">
                            👤 Автор:{" "}
                            {task.createdBy ? (
                              <strong title={task.createdBy.email}>
                                {task.createdBy.name}
                              </strong>
                            ) : (
                              <strong>Неизвестно</strong>
                            )}
                          </div>
                          {task.assignedTo?.length > 0 && (
                            <div className="text-muted small">
                              👥 Исполнители:{" "}
                              {task.assignedTo.map((user, index) => (
                                <span key={user._id}>
                                  {user.name}
                                  {index < task.assignedTo.length - 1 && ", "}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="text-muted small">
                            🕒 Создана: {formatDate(task.createdAt)}
                          </div>
                        </div>
                        <div className="d-flex flex-column align-items-end ms-2">
                          <FaArchive
                            title="Архивировать"
                            className="text-warning mb-2"
                            style={{ cursor: "pointer" }}
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await axios.put(
                                  `/api/tasks/${task._id}/archive`,
                                  {},
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  }
                                );
                                refreshTasks();
                                showTempMessage("Задача архивирована!", "warning");
                              } catch (err) {
                                console.error(err);
                                showTempMessage("Ошибка архивации!", "danger");
                              }
                            }}
                          />
                          <FaTrash
                            title="Удалить"
                            className="text-danger"
                            style={{ cursor: "pointer" }}
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await axios.put(
                                  `/api/tasks/${task._id}/delete`,
                                  {},
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  }
                                );
                                refreshTasks();
                                showTempMessage("Задача удалена!", "danger");
                              } catch (err) {
                                console.error(err);
                                showTempMessage("Ошибка удаления!", "danger");
                              }
                            }}
                          />
                        </div>
                      </div>
                    </Card>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {selectedTask && (
        <TaskModal
          show={showModal}
          onHide={() => setShowModal(false)}
          task={selectedTask}
          onSave={async (upd) => {
            console.log("Сохраняем задачу:", upd);

            try {
              await axios.put(
                `/api/tasks/${upd._id}`,
                {
                  title: upd.title,
                  description: upd.description,
                  dueDate: upd.dueDate,
                  urgent: upd.urgent,
                  assignedTo: upd.assignedTo || [],
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              refreshTasks();
              setShowModal(false);
              showTempMessage("Задача сохранена!", "success");
            } catch (err) {
              console.error(err);
              showTempMessage("Ошибка сохранения!", "danger");
            }
          }}
          onArchive={async () => {
            try {
              await axios.put(
                `/api/tasks/${selectedTask._id}/archive`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              refreshTasks();
              setShowModal(false);
              showTempMessage("Задача архивирована!", "warning");
            } catch (err) {
              console.error(err);
              showTempMessage("Ошибка архивации!", "danger");
            }
          }}
        />
      )}
    </Card>
  );
};

export default Column;