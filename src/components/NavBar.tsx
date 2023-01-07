import { Link } from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface INavbarProps {}

const NavBar: React.FunctionComponent<INavbarProps> = (props) => {
  return (
    <nav>
      <Link className="nav-text" to="/">
        Play
      </Link>
      <Link className="nav-text" to="/rules">
        Rules
      </Link>
    </nav>
  );
};

export default NavBar;
