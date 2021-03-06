import React, { useEffect, useState } from 'react';
import {IAnchor, INode} from 'hypertext-interfaces'
import JsonNodeView from '../components/JsonNodeView';
import ImmutableTextContainer from '../../ImmutableTextNode/ImmutableTextNodeContainer';
import ImmutableGridContainer from '../../ImmutableGridNode/ImmutableGridNodeContainer';
import AnchorContainer from '../../Anchors/AnchorContainer';
import { Spinner } from '@blueprintjs/core';

interface NodeTriageProps {
  node: INode
  anchorId: string
}

function NodeTriage(props: NodeTriageProps): JSX.Element {
    const { node, anchorId } = props

    const [selectedAnchor, setSelectedAnchor]: [IAnchor, any] = useState(null)
    const [previewAnchor, setPreviewAnchor]: [IAnchor, any] = useState(null)
    const [anchorIds, setAnchorIds]: [string[], any] = useState([])
    const [loading, setLoading]: [boolean, any] = useState(false)

    useEffect(() => {
        setSelectedAnchor(null)
        setPreviewAnchor(null)
    }, [node.nodeId, anchorId])

    let nodeComponent = null

    if (node) {
        switch (node.nodeType) {
            case 'node':
                return <JsonNodeView node={node} />
            case 'immutable-grid':
                nodeComponent = <ImmutableGridContainer 
                                    node={node}
                                    setLoading={setLoading}
                                    anchorId={previewAnchor ? previewAnchor.anchorId : selectedAnchor ? selectedAnchor.anchorId : anchorId} 
                                    anchorIds={anchorIds} />
                break
            case 'immutable-text':
                nodeComponent = <ImmutableTextContainer 
                                    node={node}
                                    setLoading={setLoading}
                                    anchorId={previewAnchor ? previewAnchor.anchorId : selectedAnchor ? selectedAnchor.anchorId : anchorId} 
                                    anchorIds={anchorIds} />
                break
            default:
                return  <div> Hmmm, don't recognize node type {node.nodeType}... </div>
        }

        return <div>

            {loading && <div style={{padding: '5px'}}><Spinner size={30}/></div> }

            {nodeComponent}

            <AnchorContainer 
                selectedAnchor={selectedAnchor}
                setSelectedAnchor={setSelectedAnchor}
                setPreviewAnchor={setPreviewAnchor}
                setAnchorIds={setAnchorIds}
                node={node}
                setLoading={setLoading}
                clearSelection={() => {
                    setSelectedAnchor(null)
                    setPreviewAnchor(null)
                }}
            />
        </div>
    }
    else
        return null
}

export default NodeTriage;
