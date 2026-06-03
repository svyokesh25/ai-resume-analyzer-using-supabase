import { Link } from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="resumind-logo">RESUMIND</p>
            </Link>
            <Link to="/upload" className="primary-button">
                Upload Resume
            </Link>
        </nav>
    );
};

export default Navbar;