import './Navbar.css';
import { v4 as uuidV4 } from "uuid";
import {useHistory} from 'react-router-dom';

export default function Navbar() {
    const history = useHistory();

    function handleCreateNeaw() {
        let value = window.confirm("Do you want to continue?");
        if(value) history.push(`/documents/${uuidV4()}`);
    }

    return (
        <nav className="navbar">
            <h1 className="logo">DocsCloud</h1>
            <button className="green-btn" onClick={handleCreateNeaw}> + New</button>
        </nav>
    )
}
