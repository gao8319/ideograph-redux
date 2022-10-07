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
import { FileManagementView } from "./views/OpeningView";
import * as monaco from 'monaco-editor';


const App = () => {
    return <MemoryRouter>
        <Routes>

            {/* 历史查询、新建页面 */}
            <Route path="/" element={<FileManagementView />} />

            {/* 编辑图的页面 */}
            <Route path="file" element={<EditView />} />

            
        </Routes>
    </MemoryRouter>
};

export default App;