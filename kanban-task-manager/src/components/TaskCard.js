// src/components/TaskCard.js
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Card } from "react-bootstrap";
import moment from "moment";
import "moment/locale/ru";
moment.locale("ru");

const TaskCard = ({ task, index, highlight }) => {
  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    return moment(isoDate).calendar();
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided) => (
        <Card
          className="mb-2"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card.Body>
            <Card.Title>{highlight(task.title)}</Card.Title>
            <Card.Text>{highlight(task.description)}</Card.Text>

            <div className="text-muted small mt-2">
              📅 Выполнить до:{" "}
              {task.dueDate ? formatDate(task.dueDate) : "Не указана"}
            </div>
            <div className="text-muted small">
              👤 Автор: {task.createdBy?.name || "Неизвестно"}
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
              🕒 Создана: {task.createdAt ? formatDate(task.createdAt) : "Неизвестно"}
            </div>
          </Card.Body>
        </Card>
      )}
    </Draggable>
  );
};

export default TaskCard;
