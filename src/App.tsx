import { useEffect } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    MemoryRouter,
    
} from "react-router-dom";
import { prepareCypherSyntaxHighlights } from "./utils/CypherTextmate";
import { wireTmGrammars } from "./utils/editor-wire";
import { EditView } from "./views/EditView";
import { OpeningView } from "./views/OpeningView";
import * as monaco from 'monaco-editor';


const App = () => {
    // useEffect(() => {
    //     prepareCypherSyntaxHighlights()
    //         .then(cypherTmLangSupport => {
    //             wireTmGrammars(monaco, cypherTmLangSupport.registry, cypherTmLangSupport.grammars);
    //         })
    // }, [])
    return <MemoryRouter>
        <Routes>
            <Route path="/" element={<OpeningView />} />
            <Route path="file" element={<EditView />} />
        </Routes>
    </MemoryRouter>
};

export default App;