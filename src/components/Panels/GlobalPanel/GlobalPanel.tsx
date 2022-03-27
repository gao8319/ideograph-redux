import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks"
import { bottomPanelHeightSelector, BOTTOM_DEFAULT, BOTTOM_MAX, BOTTOM_MIN, leftPanelWidthSelector, LEFT_MAX, LEFT_MIN, rightPanelWidthSelector, RIGHT_DEFAULT, RIGHT_MAX, RIGHT_MIN, setBottomPanelHeight, setLeftPanelWidth, setRightPanelWidth } from "../../../store/slice/modelSlicer"
import './GlobalPanel.css'
import Draggable from 'react-draggable';

interface IGlobalPanelProps {
    children: React.ReactNode
}

const resizeBound = { top: BOTTOM_DEFAULT - BOTTOM_MAX, right: BOTTOM_DEFAULT - BOTTOM_MIN }

export const GlobalPanel = (props: IGlobalPanelProps) => {
    const dispatch = useAppDispatch();

    const height = useAppSelector(bottomPanelHeightSelector);
    const left = useAppSelector(leftPanelWidthSelector);
    const right = useAppSelector(rightPanelWidthSelector);
    const rootRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        if (dragging) document.body.className = "cursor-ns";
        else document.body.className = "";
    }, [dragging])

    // const content = useMemo(
    //     () => {
    //         return <props.children/>
    //     }, [])

    return <div className="global-panel-root panel"
        ref={rootRef}
        style={{ height: height, left: left, width: `calc(100% - ${right + left}px)` }}>
        {props.children}
        <Draggable axis="y"
            onDrag={(ev, d) => {
                dispatch(setBottomPanelHeight(height - d.y))
            }}
            onStart={() => {
                setDragging(true);
            }}
            onStop={(ev, d) => {
                setDragging(false);
                // dispatch(setBottomPanelHeight(height - d.x))
            }}
            position={{ x: 0, y: 0 }}
            bounds={resizeBound}
        >
            <div className={"global-panel-handler"}
                style={{ backgroundColor: dragging ? "var(--primary)" : undefined }}
            />
        </Draggable>
    </div >
}