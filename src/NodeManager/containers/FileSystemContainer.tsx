import React, { useState, useEffect, ReactNode } from 'react';
import FileSystem from '../components/FileSystem'
import { ITreeNode, Divider, Button, ButtonGroup } from '@blueprintjs/core';
import NewNodeModal from '../components/modals/NewNodeModal';
import MoveNodeModal from '../components/modals/MoveNodeModal';
import {INode, IFilePath, newFilePath, ALL_NODE_TYPES, NodeType, IServiceResponse} from 'hypertext-interfaces'
import FileLocation from '../components/FileLocation';
import RenameNodeModal from '../components/modals/RenameNodeModal';
import { createTreeNodes, setNodeExpand } from '../helpers/treeNodeHelpers';
import { generateNodeId } from '../helpers/generateNodeId';
import { rootNodeId } from '../../constants';

interface NodeManagerProps {
  selectedNode: INode
  rootNode: INode
  actionButtons: ReactNode[]
  onDeleteNode: (node: INode) => void
  onNodeClick: (node: INode) => void
  onNodeDoubleClick: (node: INode) => void
  onNodePathClick: (id: string) => void
  onCreateNode: (newNode: INode) => void
  onMoveNode: (fromLocaiton: IFilePath, toLocation: IFilePath) => void
  onUpdateNode: (newNode: INode) => void
  getNode: (nid: string) => IServiceResponse<INode>
}

function FileSystemContainer(props: NodeManagerProps) {
  const { rootNode, selectedNode, actionButtons, onNodeClick, onCreateNode, onDeleteNode, onMoveNode, onUpdateNode, onNodeDoubleClick, getNode, onNodePathClick } = props
  const [newNodeModal, setNewNodeModal]: [boolean, any] = useState(false)
  const [moveNodeModal, setMoveNodeModal]: [boolean, any] = useState(false)
  const [renameModal, setRenameModal]: [boolean, any] = useState(false)
  const [contextNode, setContextNode]: [INode, any] = useState(null)
  const [treeNodes, setTreeNodes]: [ITreeNode<INode>[], any] = useState([])
  
  // when root node or selected node changes, update tree nodes
  useEffect(() => {
    setTreeNodes(createTreeNodes(rootNode, selectedNode?.nodeId, rootNode?.nodeId === '/'))
  }, [rootNode, selectedNode])

  return (
    <>
      <ButtonGroup minimal={true} style={{padding: '5px'}}>
        {/* Add New Node */}
        <Button key="add" icon="add" intent="primary" text="Add Node" onClick={() => setNewNodeModal(true)}/>
        {selectedNode && <Button key="edit" icon="edit" intent="primary" text="Rename" onClick={() => {setContextNode(selectedNode); setRenameModal(true)}}/>}
        {selectedNode && <Button key="move" icon="move" intent="primary" text="Move" onClick={() => {setContextNode(selectedNode); setMoveNodeModal(true)}}/>}
        {actionButtons}
        {selectedNode &&  <Button key="delete" icon="delete" intent="danger" text="Delete" onClick={() => onDeleteNode(selectedNode)}/>}        

        <Divider />

        {/* File Location */}
        <FileLocation filePath={rootNode?.filePath} onClick={onNodePathClick} includeRoot getNode={getNode}/>

      </ButtonGroup>
      
      {/* File Tree */}
      <FileSystem
        nodes={treeNodes}
        contextMenu
        onNodeDoubleClick={(node: ITreeNode<INode>) => onNodeDoubleClick(node.nodeData)}
        onNodeClick={(node: ITreeNode<INode>) => onNodeClick(node.nodeData)}
        onDelete={(node: INode) => onDeleteNode(node)}
        onRename={(node: INode) => {
          setContextNode(node)
          setRenameModal(true)
        }}
        onMove={(node: INode) => {
          setContextNode(node)
          setMoveNodeModal(true)
        }}
        setNodeExpand={(node: ITreeNode<INode>, nodePath: number[], expanded: boolean) => {
          setTreeNodes(setNodeExpand(treeNodes, node, nodePath, expanded))
        }}
      />

      {/* Modals */}
      <NewNodeModal
        node={rootNode}
        isOpen={newNodeModal}
        onClose={() => setNewNodeModal(false)}
        getNode={getNode}
        nodeTypes={ALL_NODE_TYPES}
        onCreate={(name: string, nodeType: NodeType, locationNode: INode) => {
          setNewNodeModal(false)
          const nodeId = generateNodeId()
          const newFp = newFilePath(locationNode.filePath.filePath.filter(val => val !== rootNodeId).concat(nodeId))

          let node: INode = {
            nodeId: nodeId,
            label: name,
            nodeType: nodeType,
            filePath: newFp,
            children: []
          }

          onCreateNode(node)
      }} />

      <MoveNodeModal
        node={rootNode}
        isOpen={moveNodeModal}
        onClose={() => setMoveNodeModal(false)}
        getNode={getNode}
        nodeToMove={contextNode}
        onMove={async (toLocation: IFilePath) => {
          onMoveNode(contextNode.filePath, toLocation)
          setMoveNodeModal(false)
        }} />
      
      <RenameNodeModal
        nodeToRename={contextNode}
        isOpen={renameModal}
        onClose={() => setRenameModal(false)}
        onRename={async (newNode: INode) => {
          onUpdateNode(newNode)
          setRenameModal(false)
        }} />
    </>
  );
} 


export default FileSystemContainer;
