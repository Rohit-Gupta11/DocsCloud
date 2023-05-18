import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useCallback, useEffect, useState } from 'react';
import './TextEditor.css';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { pdfExporter } from 'quill-to-pdf';
import { saveAs } from 'file-saver';
import * as quillToWord from 'quill-to-word';

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
];
const SAVE_INTERVAL_MS = 2000

export default function TextEditor() {
    const { id: documentId } = useParams();
    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();

    useEffect(() => {
        console.log(process.env.REACT_APP_SERVER_URL)
        const s = io(process.env.REACT_APP_SERVER_URL);
        setSocket(s);

        return () => {
            s.disconnect();
        }
    }, []);

    useEffect(() => {
        if (socket == null || quill == null) return;

        socket.once("load-document", document => {
            quill.setContents(document);
            quill.enable();
        })

        socket.emit("get-document", documentId)
    }, [socket, quill, documentId]);

    useEffect(() => {
        if (socket == null || quill == null) return;

        const handler = delta => {
            quill.updateContents(delta);
        }

        socket.on('receive-changes', handler);

        return () => {
            socket.off('receive-changes', handler);
        }
    }, [socket, quill]);

    useEffect(() => {
        if (socket == null || quill == null) return

        const interval = setInterval(() => {
            socket.emit("save-document", quill.getContents())
        }, SAVE_INTERVAL_MS)

        return () => {
            clearInterval(interval)
        }
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) return;

        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return;
            socket.emit('send-changes', delta);
        }

        quill.on('text-change', handler);

        return () => {
            quill.off('text-change', handler);
        }
    }, [socket, quill]);

    async function handleExportPdf() {
        let value = prompt("What will be name of this file?");
        if(value){
            let delta = await quill.getContents();
            let blob = await pdfExporter.generatePdf(delta);
            saveAs(blob, `${value}.pdf`);
        }
    }

    async function handleExportWord() {
        let value = prompt("What will be name of this file?");
        let quillToWordConfig = {
            exportAs: 'blob'
        };
        if(value){
            let delta = await quill.getContents();
            let blob = await quillToWord.generateWord(delta, quillToWordConfig);
            saveAs(blob, `${value}.docx`);
        }
    }

    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return;
        wrapper.innerHTML = '';

        const editor = document.createElement('div');
        wrapper.append(editor);

        const q = new Quill(editor, { theme: 'snow', modules: { toolbar: TOOLBAR_OPTIONS } });
        q.disable();
        q.setText('Please wait! Loading.....');

        setQuill(q);
    }, []);

    return (
        <>
            <div className='text-editor' ref={wrapperRef}></div>
            <div className='btn-container'>
                <button className="download-btn" onClick={handleExportPdf}>Download PDF</button>
                <button className="download-btn" onClick={handleExportWord}>Download Word</button>
            </div>
        </>
    )
}
