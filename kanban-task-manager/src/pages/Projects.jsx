// src/pages/Projects.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ListGroup,
  Button,
  Spinner,
  Alert,
  Container,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ProjectModal from "../components/ProjectModal";
import ProjectReadOnlyModal from "../components/ProjectReadOnlyModal";
import moment from "moment";
import "moment/locale/ru";
moment.locale("ru");

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReadOnlyModal, setShowReadOnlyModal] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await axios.get("/api/projects");
      setProjects(res.data);
    } catch {
      setError("Не удалось загрузить проекты");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (updatedProject) => {
    try {
      await axios.put(`/api/projects/${updatedProject._id}`, {
        name: updatedProject.name,
        description: updatedProject.description,
      });
      await loadProjects();
      setShowModal(false);
    } catch (err) {
      console.error("Ошибка сохранения проекта", err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`/api/projects/${projectId}`);
      setShowModal(false);
      await loadProjects();
    } catch (err) {
      console.error("Ошибка удаления проекта", err);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const isMatch = (p) => {
    const q = search.trim().toLowerCase();
    return (
      q !== "" &&
      (p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q))
    );
  };

  return (
    <Container className="mt-4">
      <h3>Ваши проекты</h3>

      <Form.Control
        type="text"
        placeholder="Поиск проектов..."
        className="mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ListGroup className="mt-3">
        {projects.map((p) => {
          const match = isMatch(p);
          return (
            <ListGroup.Item
              key={p._id}
              className="d-flex justify-content-between align-items-start"
              style={{
                cursor: "pointer",
                backgroundColor: match ? "#fff3cd" : undefined,
                transition: "background-color 0.3s ease",
              }}
              onClick={() => {
                const currentUserId = localStorage.getItem("userId")?.trim();
                const ownerId = p.owner?._id?.toString();

                  console.log("userId:", currentUserId);
                  console.log("ownerId:", ownerId);

                if (ownerId === currentUserId) {
                  setEditingProject(p);
                  setShowModal(true);
                } else {
                  setEditingProject(p);
                  setShowReadOnlyModal(true);
                }
              }}
            >
              <div className="flex-grow-1">
                <strong>{p.name}</strong>
                {p.description && (
                  <div className="text-muted small mt-1">
                    {p.description}
                  </div>
                )}
                <div className="text-muted small mt-1">
                  👤 Автор: {p.owner?.name || "Неизвестно"}
                </div>
                <div className="text-muted small">
                  📅 Создан: {moment(p.createdAt).calendar()}
                </div>
              </div>
              <Button
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/board/${p._id}`);
                }}
              >
                Открыть
              </Button>
            </ListGroup.Item>
          );
        })}
      </ListGroup>

      <Row className="mt-4">
        <Col className="text-end">
          <Button onClick={() => navigate("/projects/new")}>+ Новый проект</Button>
        </Col>
      </Row>

      <ProjectModal
        show={showModal}
        onHide={() => setShowModal(false)}
        project={editingProject}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
      />

      <ProjectReadOnlyModal
        show={showReadOnlyModal}
        onHide={() => setShowReadOnlyModal(false)}
        project={editingProject}
      />
    </Container>
  );
};

export default Projects;