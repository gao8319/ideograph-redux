import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks"
import { leftPanelWidthSelector, LEFT_MAX, LEFT_MIN, setLeftPanelWidth } from "../../../store/slice/modelSlicer"
import './ConceptPanel.css'
import '../common/PanelCommon.css'
import Draggable from 'react-draggable';
import { ConceptPanelContent } from "./ConceptPanelContent";
import { CommonModel } from "../../../utils/common/model";
import { ConceptTreePanel } from "./ConceptTreePanel";

interface IConceptPanelProps {
    
}

const resizeBound = { left: LEFT_MIN, right: LEFT_MAX }

export const ConceptPanel = (props: IConceptPanelProps) => {
    const width = useAppSelector(leftPanelWidthSelector);
    const dispatch = useAppDispatch();
    const rootRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);


    useEffect(() => {
        if (dragging) document.body.className = "cursor-ew";
        else document.body.className = "";
    }, [dragging])

    const content = useMemo(
        () => {
            return <ConceptTreePanel />
        }, [])

    return <div className="concept-panel-root panel" ref={rootRef} style={{ width }}>
        {content}
        <Draggable axis="x"
            onDrag={(ev, d) => {
                dispatch(setLeftPanelWidth(d.x))
            }}
            onStart={() => {
                setDragging(true);
            }}
            onStop={(ev, d) => {
                setDragging(false);
                // dispatch(setLeftPanelWidth(d.x))
            }}
            bounds={resizeBound}
            position={{ x: width, y: 0 }}
        >
            <div className={"concept-panel-handler"}
                style={{ backgroundColor: dragging ? "var(--primary)" : undefined }}
            />
        </Draggable>
    </div >
}