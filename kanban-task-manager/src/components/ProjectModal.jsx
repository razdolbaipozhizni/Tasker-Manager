// src/components/ProjectModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import moment from "moment";
import "moment/locale/ru";
moment.locale("ru");

const ProjectModal = ({ show, onHide, project, onSave, onDelete }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setMembers(project.members || []);
    }
  }, [project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...project, name, description });
  };

  const handleDelete = async () => {
    if (window.confirm("Вы уверены, что хотите удалить проект? Это действие нельзя отменить!")) {
      try {
        await onDelete(project._id);
        onHide();
      } catch (err) {
        console.error("Ошибка удаления проекта", err);
      }
    }
  };

  const handleAddMember = async () => {
    const email = newMemberEmail.trim();
    if (!email) return;
    try {
      const res = await axios.put(`/api/projects/${project._id}/share`, { email });
      setMembers(res.data.members);
      setNewMemberEmail("");
    } catch (err) {
      alert(err.response?.data?.message || "Ошибка при добавлении участника");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Удалить участника из проекта?")) return;
    try {
      const res = await axios.put(`/api/projects/${project._id}/unshare`, { userId });
      setMembers(res.data.members);
    } catch (err) {
      alert(err.response?.data?.message || "Ошибка при удалении участника");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Редактировать проект</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Название проекта</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <hr />
          <Form.Group className="mb-3">
            <Form.Label>Участники проекта</Form.Label>
            {members.map((m) => (
              <div key={m._id} className="d-flex justify-content-between align-items-center mb-1">
                <div>
                  <strong>{m.name}</strong> <span className="text-muted">({m.email})</span>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveMember(m._id)}
                >
                  Удалить
                </Button>
              </div>
            ))}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Добавить участника</Form.Label>
            <div className="d-flex">
              <Form.Control
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="email@example.com"
              />
              <Button onClick={handleAddMember} className="ms-2">
                Добавить
              </Button>
            </div>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="danger" onClick={handleDelete}>
            Удалить проект
          </Button>
          <div>
            <Button variant="secondary" onClick={onHide} className="me-2">
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              Сохранить
            </Button>
          </div>
        </Modal.Footer>
      </Form>

      {project && (
        <>
          <hr />
          <div className="text-muted small ps-3 pb-2">
            <div className="d-flex align-items-center mb-1">
              <span className="me-1">📅</span>
              Последнее обновление:&nbsp;
              <strong>{moment(project.updatedAt).calendar()}</strong>
            </div>
            <div className="d-flex align-items-center">
              <span className="me-1">✏️</span>
              Изменил:&nbsp;
              {project.lastEditedBy ? (
                <strong title={project.lastEditedBy.email}>
                  {project.lastEditedBy.name}
                </strong>
              ) : (
                <strong>Неизвестно</strong>
              )}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};

export default ProjectModal;
