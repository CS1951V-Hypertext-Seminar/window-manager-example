import React from 'react';
import { MosaicWindow, MosaicBranch } from 'react-mosaic-component';
import { INode } from 'hypertext-interfaces';
import { NonIdealState } from '@blueprintjs/core';
import NodeTriage from '../containers/NodeTriage'

interface NodeWindowProps {
    path: MosaicBranch[]
    node: INode
    anchorId: string
}

export default function NodeWindow(props: NodeWindowProps) {

    const { node, path, anchorId } = props
    
    if (node) {
        return (
            <MosaicWindow<string> path={path} title={node.label} >
                <NodeTriage node={node} anchorId={anchorId}/>
            </MosaicWindow>)
    } else {
        return <MosaicWindow<string> path={path} title={"Title"}>
            <NonIdealState 
                title="No Node Found"
                icon='issue'
            />
        </MosaicWindow>
    }
}