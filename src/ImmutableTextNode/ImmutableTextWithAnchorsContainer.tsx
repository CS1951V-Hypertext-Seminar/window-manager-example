

import React, { useEffect, useState } from 'react';
import { queryCache, useMutation, useQuery } from 'react-query';
import ImmutableTextAnchorGateway from '../Gateways/ImmutableText/ImmutableTextAnchorGateway';
import { Button, ButtonGroup, Divider, Spinner } from '@blueprintjs/core';
import HypertextSdk from '../HypertextSdk';
import { generateAnchorId } from '../NodeManager/helpers/generateNodeId';
import ImmutableTextView from './ImmutableTextView';
import AddAnchorModal from './AddAnchorModal';
import { IImmutableTextAnchor, IImmutableTextNode } from 'hypertext-interfaces';

interface ImmutableTextWithAnchorsContainerProps {
    node: IImmutableTextNode
    anchorId: string
    anchorIds: string[]
    createNode: (text: string) => void
    setLoading: (loading: boolean) => void
}

function ImmutableTextWithAnchorsContainer(props: ImmutableTextWithAnchorsContainerProps): JSX.Element {

  const { node, anchorId, anchorIds, createNode, setLoading } = props
  const [newAnchor, setNewAnchor]: [IImmutableTextAnchor, any] = useState(null)
  const [newAnchorModal, setNewAnchorModal]: [boolean, any] = useState(false)

  const [createAnchor] = useMutation(HypertextSdk.createImmutableTextAnchor, {
    onSuccess: () => queryCache.invalidateQueries([node.nodeId, 'anchors']) 
  })

  const { isLoading, data } = useQuery([ anchorIds ], ImmutableTextAnchorGateway.getAnchors)

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading, setLoading])

  const immutableTextAnchorMap = data && data.success ? data.payload : {}
  const immutableTextAnchors = data && data.success ? Object.values(data.payload) : []

  return (<div style={{margin: 'auto', marginTop: '10px', width: '100%', padding: '10px', border: '1px dashed black'}}>
    {newAnchor && <> <ButtonGroup>
        <Button text="Create Anchor" onClick={() => setNewAnchorModal(true) }/> 
        <Button text="Clear Selection" onClick={() => setNewAnchor(null) }/> 
    </ButtonGroup> <Divider /> </>}
    <ImmutableTextView
        previewAnchor={immutableTextAnchorMap[anchorId]}
        node={node} 
        anchor={newAnchor}
        selectedAnchorId={anchorId}
        anchors={immutableTextAnchors}
        addNode={createNode}
        setAnchor={anc => {
            console.log("anc", anc)
            setNewAnchor(null)
            setNewAnchor(anc)
    }}/>

    <AddAnchorModal 
        isOpen={newAnchorModal}
        onClose={() => setNewAnchorModal(false)}
        onAdd={label => {
            const anchorId = generateAnchorId()
            createAnchor({
                anchor: {
                    nodeId: node.nodeId,
                    anchorId: anchorId,
                    label: label,
                    type: 'immutable-text'
                },
                immutableTextAnchor: {
                    anchorId: anchorId,
                    start: newAnchor.start,
                    end: newAnchor.end
                }
            })
            setNewAnchor(null)
            setNewAnchorModal(false)
        }}
        text={node && newAnchor ? node.text.substring(newAnchor.start, newAnchor.end + 1) : ''}
        anchor={newAnchor}
    />
    </div>
  )
}

export default ImmutableTextWithAnchorsContainer;