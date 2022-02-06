import React, { useRef, useState } from "react"
import { useNumber } from "react-use";

export const useDragHandleProps = <T extends HTMLElement>(): Partial<React.HTMLProps<T>> => {
    const handleRef= useRef<T>(null);

    const [width, setWidth] = useState<number>();

    return {
        ref: handleRef,
        onDragStart: ev => {
            console.log(ev.clientX)
        },
        onDragEnd: ev => {
            console.log(ev.clientX)
        },
        onClick: ev =>{
            console.log("CLICK")
        },
        onPointerDown: ev => {
            setWidth(ev.clientX)
            // console.log(ev.clientX)
        },
        onPointerUp: ev => {
            console.log(ev.clientX)
        },
        onPointerMove: ev => {
            console.log(ev.clientX)
            width && handleRef.current?.setAttribute('style', `transform:translateX(${ev.clientX - width}px)`)
        }
    }
}