import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Container, Form, Button, Alert, Card, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      const { data } = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      navigate("/projects");
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка регистрации");
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <Container className="d-flex justify-content-center">
      <Card style={{ width: 400 }}>
        <Card.Body>
          <h3 className="mb-4 text-center">Регистрация</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Пароль</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required />
                <Button
                  variant="outline-secondary"
                  onClick={toggleShowPassword}
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Подтвердите пароль</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required />
                <Button
                  variant="outline-secondary"
                  onClick={toggleShowConfirmPassword}
                  aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              Зарегистрироваться
            </Button>
          </Form>
          <div className="mt-3 text-center">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;