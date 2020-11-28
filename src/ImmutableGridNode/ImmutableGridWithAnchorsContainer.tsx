

import React, { useEffect, useState } from 'react';
import { queryCache, useMutation, useQuery } from 'react-query';
import { IImmutableGridAnchor, IImmutableGridNode } from 'hypertext-interfaces';
import { Button, ButtonGroup, Divider, Spinner } from '@blueprintjs/core';
import HypertextSdk from '../HypertextSdk';
import { generateAnchorId } from '../NodeManager/helpers/generateNodeId';
import ImmutableGridView from './ImmutableGridView';
import ImmutableGridAnchorGateway from '../Gateways/ImmutableGrid/ImmutableGridAnchorGateway';
import AddGridAnchorModal from './AddGridAnchorModal';

interface ImmutableGridWithAnchorsContainerProps {
    node: IImmutableGridNode
    anchorId: string
    anchorIds: string[]
    createNode: (node: IImmutableGridNode) => void
    setLoading: (loading: boolean) => void
}

function ImmutableGridWithAnchorsContainer(props: ImmutableGridWithAnchorsContainerProps): JSX.Element {

  const { node, anchorId, anchorIds, createNode, setLoading } = props
  const [newAnchor, setNewAnchor]: [IImmutableGridAnchor, any] = useState(null)
  const [newAnchorModal, setNewAnchorModal]: [boolean, any] = useState(false)

  const [createAnchor] = useMutation(HypertextSdk.createImmutableGridAnchor, {
    onSuccess: () => queryCache.invalidateQueries([node.nodeId, 'anchors']) 
  })

  const { isLoading, data } = useQuery([ anchorIds ], ImmutableGridAnchorGateway.getAnchors)

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading, setLoading])
  
  const immutableGridAnchorMap = data && data.success ? data.payload : {}
  const immutableGridAnchors = data && data.success ? Object.values(data.payload) : []

  return (<div style={{margin: 'auto', marginTop: '10px', width: '100%', padding: '10px', border: '1px dashed black'}}>
    {newAnchor && <> <ButtonGroup>
        <Button text="Create Anchor" onClick={() => setNewAnchorModal(true) }/> 
        <Button text="Clear Selection" onClick={() => setNewAnchor(null) }/> 
    </ButtonGroup> <Divider /> </>}
    <ImmutableGridView
        setNewAnchor={anc => {
            setNewAnchor(anc)
        }}
        newAnchor={newAnchor}
        node={node}
        onAdd={(columns, rows) => createNode({
            nodeId: '',
            columns: columns,
            rows: rows
        })}
        anchors={immutableGridAnchors}
        previewAnchor={immutableGridAnchorMap[anchorId]}
    />

    <Divider />

    <AddGridAnchorModal 
        isOpen={newAnchorModal}
        onClose={() => setNewAnchorModal(false)}
        onAdd={label => {
            const anchorId = generateAnchorId()
            createAnchor({
                anchor: {
                    nodeId: node.nodeId,
                    anchorId: anchorId,
                    label: label,
                    type: 'immutable-grid'
                },
                immutableGridAnchor: {
                    anchorId: anchorId,
                    bottomRightCell: newAnchor.bottomRightCell,
                    topLeftCell: newAnchor.topLeftCell
                }
            })
            setNewAnchor(null)
            setNewAnchorModal(false)
        }}
        node={node}
        anchor={newAnchor} />
    </div>
  )
}

export default ImmutableGridWithAnchorsContainer;