import React, { ReactNode, useEffect, useState } from 'react';
import {
    createBalancedTreeFromLeaves,
    getLeaves,
    Mosaic,
    MosaicNode
} from 'react-mosaic-component';
import '../../App.css'
import { queryCache, useMutation, useQuery } from 'react-query';
import { INode, newFilePath, ROOT_ID } from 'hypertext-interfaces';
import { Button, Spinner } from '@blueprintjs/core';
import NodeGateway from '../../Gateways/NodeGateway';
import { useNavigate, useParams } from 'react-router';
import NodeWindow from '../components/NodeWindow';
import { addNode } from '../helpers/windowHelpers';
import FileSystemContainer from './FileSystemContainer';
import HypertextSdk from '../../HypertextSdk';
import { getNode } from '../../helpers';

async function fetchNode(nodeId: string) {
    if (nodeId === ROOT_ID) {
      return await NodeGateway.getNodeByPath(newFilePath([]))
    } else if (nodeId) {
      return await NodeGateway.getNode(nodeId)
    }
}
  

export default function NodeWindowManagerContainer(props: { setLoading: (loading: boolean) => void }) {
    const { setLoading } = props

    const { nodeId, anchorId } = useParams()

    const currentNodeId = nodeId || ROOT_ID

    // fetch node data based on currentNodeId
    const { isLoading, data } = useQuery(currentNodeId, fetchNode)

    // currently selected node (blue row in UI)
    const [selectedNode, setSelectedNode]: [INode, any] = useState(null)

    // set of nodes with windows open, used to avoid having multiple windows with the same id
    const [nodes, setNodes]: [{[nodeId: string]: INode}, any] = useState(null)

    // current state of window manager
    const [currentMosaicNode, setCurrentMosaicNode]: [MosaicNode<string>, (node: MosaicNode<string>) => void] = useState(null)

    // function for adding a new node to the windows
    const addNodeWindow = (node: INode) => {
        const newNodes = {...nodes}
        if (!newNodes[node.nodeId]) {
            newNodes[node.nodeId] = node
            setNodes(newNodes)
            setCurrentMosaicNode(createBalancedTreeFromLeaves([addNode(currentMosaicNode, node.nodeId)]))
        }
    }

    const navigate = useNavigate()

    useEffect(() => {
        setLoading(isLoading)
    }, [isLoading, setLoading])

    // when node is deleted, invalidate current node
    const [deleteNode] = useMutation(HypertextSdk.deleteNode, {
        onSuccess: (data, node) => {
        if (node.nodeId === selectedNode.nodeId) {
            setSelectedNode(null)
        }
        queryCache.invalidateQueries(currentNodeId)
        }
    })

    // when new node is updated, invalidate current node
    const [updateNode] = useMutation(NodeGateway.updateNode, {
        onSuccess: () => queryCache.invalidateQueries(currentNodeId) 
    })

    // when node is moved, invalidate current node
    const [moveNode] = useMutation(HypertextSdk.moveNode, {
        onSuccess: () => queryCache.invalidateQueries(currentNodeId) 
    })

    // when new node is created, invalidate current node
    const [createNode] = useMutation(NodeGateway.createNode, {
        onSuccess: () => queryCache.invalidateQueries(currentNodeId) 
    })

    const actionButtons: ReactNode[] = [
            selectedNode && <Button
                key="navigate" 
                minimal
                intent="primary"
                text="Navigate to Node" 
                onClick={() => {
                    setSelectedNode(null)
                    navigate(`/nodes/${selectedNode.nodeId}`)
                }} />,
            selectedNode && <Button
                key="open" 
                minimal
                intent="primary"
                text="Open Window"
                onClick={() => addNodeWindow(selectedNode)} />
    ]
    
    if (isLoading) return <Spinner />

    if (data.success) {
        return (
            <div // must have id set to window
                id="window">

                <FileSystemContainer 
                    selectedNode={selectedNode}
                    rootNode={data.payload}
                    onNodeDoubleClick={addNodeWindow}
                    onNodeClick={setSelectedNode} 
                    onDeleteNode={deleteNode}
                    onCreateNode={createNode}
                    onMoveNode={(moveFrom, moveTo) => moveNode({ moveFrom, moveTo })}
                    onUpdateNode={updateNode}
                    getNode={getNode}
                    onNodePathClick={id => navigate(`/nodes/${id}`)}
                    actionButtons={actionButtons} />

                {/* Window Manager Component */}
                <Mosaic<string>
                    renderTile={(id, path) => <NodeWindow anchorId={anchorId} node={nodes[id]} path={path}/>}
                    value={currentMosaicNode}
                    onChange={node => {
                        // if node is removed on change, remove it from nodes state so it can be added back later
                        const leaves = new Set(getLeaves(node))
                        const removed = Object.keys(nodes).filter(n => !leaves.has(n))
                        if (removed[0]) {
                            const newNodes = { ...nodes }
                            delete newNodes[removed[0]]
                            setNodes(newNodes)
                        }
                        setCurrentMosaicNode(node)
                    }} />
            </div>
        )
    } else {
        // if data request not successful then show error message
        return <p> {data.message} </p>
  }
}