import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks"
import { leftPanelWidthSelector, LEFT_MAX, LEFT_MIN, rightPanelWidthSelector, RIGHT_DEFAULT, RIGHT_MAX, RIGHT_MIN, setLeftPanelWidth, setRightPanelWidth } from "../../../store/slice/modelSlicer"
import './PropertyPanel.css'
import Draggable from 'react-draggable';
import { PropertyPanelContent } from "./PropertyPanelContent";

interface IPropertyPanelProps {

}

const resizeBound = { left: RIGHT_DEFAULT - RIGHT_MAX, right: RIGHT_DEFAULT - RIGHT_MIN }

export const PropertyPanel = (props: IPropertyPanelProps) => {
    const width = useAppSelector(rightPanelWidthSelector);
    const dispatch = useAppDispatch();
    const rootRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        if (dragging) document.body.className = "cursor-ew";
        else document.body.className = "";
    }, [dragging])

    const content = useMemo(
        () => {
            return <PropertyPanelContent />
        }, [])

    return <div className="property-panel-root panel" ref={rootRef} style={{ width: width }}>
        {content}
        <Draggable axis="x"
            onDrag={(ev, d) => {
                dispatch(setRightPanelWidth(width - d.x))
            }}
            onStart={() => {
                setDragging(true);
            }}
            onStop={(ev, d) => {
                setDragging(false);
                // dispatch(setRightPanelWidth(width - d.x))
            }}
            position={{ x: -2, y: 0 }}
        >
            <div className={"property-panel-handler"}
                style={{ backgroundColor: dragging ? "var(--primary)" : undefined }}
            />
        </Draggable>
    </div >
}