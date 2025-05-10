// src/components/ProjectReadOnlyModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import moment from "moment";
import "moment/locale/ru";
moment.locale("ru");

const ProjectReadOnlyModal = ({ show, onHide, project }) => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (project) {
      setMembers(project.members || []);
    }
  }, [project]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Просмотр проекта</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-3">
          <h5 className="mb-1">Название проекта</h5>
          <p className="mb-2"><strong>{project?.name || "-"}</strong></p>

          <h6 className="mb-1">Описание</h6>
          <p>{project?.description || "Нет описания"}</p>
        </div>

        <hr />

        <div className="mb-3">
          <h6 className="mb-2">Участники проекта</h6>
          {members.length > 0 ? (
            members.map((m) => (
              <div key={m._id} className="mb-1">
                <strong>{m.name}</strong> <span className="text-muted">({m.email})</span>
              </div>
            ))
          ) : (
            <p className="text-muted">Нет участников</p>
          )}
        </div>

        {project && (
          <>
            <hr />
            <div className="text-muted small">
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
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Закрыть
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProjectReadOnlyModal;
