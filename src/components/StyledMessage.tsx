import { styled } from "@mui/material";
import React from "react";
import { RaiseMessageCallback, RaiseMessageType } from "../engine/PatternGraphEngine";

const AlertBody = styled("div")(t => ({
    backgroundColor: '#fff',
    height: 48,
    alignItems: 'center',
    padding: '0 16px',
}))

// type LabelsOfTuple<T extends any[]> = T extends LabeledTuple<T, infer L> ? L : never
// type TupleToObject<T extends any[]> = {
//   [K in keyof T & number as LabelsOfTuple<T>[K]]: T[K]
// }

export const Alert = (props: { messageConfigs?: Parameters<RaiseMessageCallback> }) => {
    if(!props.messageConfigs) {
        return <div>
            
        </div>
    }
    const [message, type, asInnerHtml] = props.messageConfigs;
    if (asInnerHtml)
        return <AlertBody dangerouslySetInnerHTML={{ __html: message }} />
    return <AlertBody>
        {message}
    </AlertBody>

}