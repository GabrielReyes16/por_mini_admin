import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          Panel Admin
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav gap-2">
            <li className="nav-item">
              <Link className="nav-link" to="/buses">Buses</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/subidas">Subidas</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/bajadas">Bajadas</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/inicios">Inicios</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/destinos">Destinos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/rutas">Rutas</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
