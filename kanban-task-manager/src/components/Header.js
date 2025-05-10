import React from "react";
import { Navbar, Form, FormControl, Container, Nav, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

const Header = ({ setSearchQuery, statusFilter, setStatusFilter }) => {
  const statusLabels = {
    all: "Все",
    planned: "Запланировано",
    inprogress: "В работе",
    done: "Выполнено"
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Kanban</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Доска</Nav.Link>
          <Nav.Link as={Link} to="/archive">Архив</Nav.Link>
          <Nav.Link as={Link} to="/deleted">Корзина</Nav.Link>
        </Nav>

        <Form className="d-flex align-items-center ms-auto gap-2">
          <FormControl
            type="search"
            placeholder="Поиск задач..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Dropdown>
            <Dropdown.Toggle variant="secondary" size="sm">
              {statusLabels[statusFilter]}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setStatusFilter("all")}>
                Все
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter("planned")}>
                Запланировано
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter("inprogress")}>
                В работе
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter("done")}>
                Выполнено
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Form>
      </Container>
    </Navbar>
  );
};

export default Header;
