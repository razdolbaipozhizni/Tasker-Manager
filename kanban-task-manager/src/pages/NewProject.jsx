// src/pages/NewProject.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";

const NewProject = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await axios.post("/api/projects", {
        name,
        description,
      });
      navigate(`/board/${data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Ошибка создания проекта");
    }
  };

  return (
    <Container className="d-flex justify-content-center">
      <Card style={{ width: 500 }}>
        <Card.Body>
          <h3 className="mb-4 text-center">Новый проект</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleCreate}>
            <Form.Group className="mb-3">
              <Form.Label>Название проекта</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Моя первая доска"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Описание проекта</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Кратко опишите цель проекта"
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              Создать
            </Button>
          </Form>

          <div className="mt-3 text-center">
            <Link to="/projects">Отмена</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NewProject;
