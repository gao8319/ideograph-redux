import React, { useEffect, useState } from "react"
import { IOntologyModel } from "./ontology/OntologyModel";
import { PatternGraphEngine } from "./PatternGraphEngine";
import { EditMode } from "./visual/EditMode";
export const usePatternGraphEngine = (model: IOntologyModel, containerRef: React.RefObject<HTMLDivElement>) => {
    const [engine, setEngine] = useState<PatternGraphEngine>();

    useEffect(
        () => {
            if (containerRef.current) {
                const e = new PatternGraphEngine(
                    model,
                    containerRef.current
                );

                (window as any).engine = e;
                setEngine(e)
                return () => e.detach();
            }
        }, [containerRef.current]
    )

    const [editMode, _setEditMode] = useState<EditMode>(EditMode.CreatingNode);

    const setEditMode = (editMode: EditMode) => {
        _setEditMode(editMode);
        engine && (engine.editMode = editMode);
    }

    return { engine, editMode, setEditMode }
}