import React, {useEffect, useState} from "react";
import { ITreeNode } from "@blueprintjs/core";
import { INode } from 'hypertext-interfaces'
import FileExplorer from "./FileSystem";
import { createTreeNodes, setNodeExpand } from "../helpers/treeNodeHelpers";

interface FileExplorerProps {
    onNodeClick: (node: INode) => void
    onNodeDoubleClick: (node: INode) => void
    onDelete?: (node: INode) => void
    onMove?: (doc: INode) => void
    onRename?: (doc: INode) => void
    node: INode
    contextMenu: boolean
}


export default function FileExplorerWrapper(props: FileExplorerProps): JSX.Element {
    
    const [treeNodes, setTreeNodes]: [ITreeNode<INode>[], any] = useState([])
    const [selectedNode, setSelectedNode]: [INode, any] = useState(null)

    useEffect(() => {
        setTreeNodes(createTreeNodes(props.node, selectedNode?.nodeId))
      }, [props.node, selectedNode])
      
    return <FileExplorer {...props}
        onNodeClick={node => {
            setSelectedNode(node.nodeData)
            props.onNodeClick(node.nodeData)
        }}
        onNodeDoubleClick={node => props.onNodeDoubleClick(node.nodeData)}
        nodes={treeNodes} 
        setNodeExpand={(nodes, nodePath, expanded) => setTreeNodes(setNodeExpand(treeNodes, nodes, nodePath, expanded))} />
}