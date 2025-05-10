// src/App.js
import React, { useEffect } from "react";
import axios from "axios";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";

import Projects   from "./pages/Projects";
import NewProject from "./pages/NewProject";
import Board      from "./pages/Board";
import Archive    from "./pages/Archive";
import Deleted    from "./pages/Deleted";
import Login      from "./pages/Login";
import Register   from "./pages/Register";

const App = () => {
  // подтягиваем токен один раз
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete axios.defaults.headers.common["Authorization"];
  }, []);

  const isLoggedIn = !!localStorage.getItem("token");

  // Получаем текущий projectId из URL, чтобы показывать «Архив» и «Корзину»
  const location = useLocation();
  // ищем совпадение /board/:id, /archive/:id или /deleted/:id
  const match = location.pathname.match(/^\/(?:board|archive|deleted)\/([^/]+)/);
  const currentProjectId = match?.[1];

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Tasker</Navbar.Brand>
          <Nav className="me-auto">
            {isLoggedIn && <Nav.Link as={Link} to="/projects">Проекты</Nav.Link>}

            {currentProjectId && (
  <>
              {(location.pathname.includes("/archive/") || location.pathname.includes("/deleted/")) && (
                <Nav.Link as={Link} to={`/board/${currentProjectId}`}>Моя доска</Nav.Link>
              )}
              <Nav.Link as={Link} to={`/archive/${currentProjectId}`}>Архив</Nav.Link>
              <Nav.Link as={Link} to={`/deleted/${currentProjectId}`}>Корзина</Nav.Link>
            </>
)}
          </Nav>

          <Nav>
            {isLoggedIn ? (
              <Nav.Link onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}>
                Выход
              </Nav.Link>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Вход</Nav.Link>
                <Nav.Link as={Link} to="/register">Регистрация</Nav.Link>
              </>
            )}
          </Nav>
        </Container>
      </Navbar>

      <Container fluid className="mt-3">
        <Routes>
          <Route path="/" element={
            isLoggedIn ? <Navigate to="/projects" replace /> : <Navigate to="/login" replace />
          }/>

          {isLoggedIn && (
            <>
              <Route path="/projects"           element={<Projects />} />
              <Route path="/projects/new"       element={<NewProject />} />
              <Route path="/board/:projectId"   element={<Board />} />
              <Route path="/archive/:projectId" element={<Archive />} />
              <Route path="/deleted/:projectId" element={<Deleted />} />
            </>
          )}

          <Route path="/login"    element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to="/" replace /> : <Register />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </>
  );
};

export default App;
