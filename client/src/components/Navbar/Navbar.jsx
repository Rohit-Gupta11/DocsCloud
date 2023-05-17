import './Navbar.css';
import { v4 as uuidV4 } from "uuid";
import {useHistory} from 'react-router-dom';

export default function Navbar() {
    const history = useHistory();

    return (
        <nav className="navbar">
            <h1 className="logo">DocsCloud</h1>
            <button className="green-btn" onClick={() => history.push(`/documents/${uuidV4()}`)}> + New</button>
        </nav>
    )
}
