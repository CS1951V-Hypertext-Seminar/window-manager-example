

import { Spinner } from '@blueprintjs/core';
import { INode } from 'hypertext-interfaces';
import React, { useEffect } from 'react';
import { queryCache, useMutation, useQuery } from 'react-query';
import ImmutableGridNodeGateway from '../Gateways/ImmutableGrid/ImmutableGridNodeGateway';
import ImmutableGridWithAnchorsContainer from './ImmutableGridWithAnchorsContainer';

interface ImmutableTextContainerProps {
    node: INode
    anchorId: string
    anchorIds: string[]
    setLoading: (loading: boolean) => void
}

function ImmutableGridContainer(props: ImmutableTextContainerProps): JSX.Element {
  const { node, anchorId, anchorIds, setLoading} = props
  const { isLoading, data, error } = useQuery([node.nodeId, node.nodeType], ImmutableGridNodeGateway.getNode)

  const [createNode] = useMutation(ImmutableGridNodeGateway.createNode, {
    onSuccess: () => queryCache.invalidateQueries([node.nodeId, node.nodeType]) 
  })

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading, setLoading])

  if (isLoading) return null

  if (error) return <div> {'An error has occurred: ' + error} </div>

  return (<div>
        <ImmutableGridWithAnchorsContainer 
            node={data?.payload}
            setLoading={setLoading}
            anchorIds={anchorIds}
            anchorId={anchorId}
            createNode={ig => createNode({
              nodeId: node.nodeId,
              columns: ig.columns,
              rows: ig.rows
            })} />
    </div>
  )
}

export default ImmutableGridContainer;