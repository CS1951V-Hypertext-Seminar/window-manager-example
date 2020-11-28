import { Corner, getNodeAtPath, getOtherDirection, getPathToCorner, MosaicDirection, MosaicNode, MosaicParent, updateTree } from "react-mosaic-component";

export function addNode(currentNode: MosaicNode<string>, nodeId: string): MosaicNode<string>  {
    if (currentNode) {
        const path = getPathToCorner(currentNode, Corner.TOP_RIGHT);
        const parent = getNodeAtPath(currentNode, path) as MosaicParent<string>;
        const destination = getNodeAtPath(currentNode, path) as MosaicNode<string>;
        const direction: MosaicDirection = parent ? getOtherDirection(parent.direction) : 'row';

        let first: MosaicNode<string>;
        let second: MosaicNode<string>;
        if (direction === 'row') {
            first = destination;
            second = nodeId
        } else {
            first = nodeId
            second = destination;
        }

        currentNode = updateTree(currentNode, [
            {
            path,
            spec: {
                $set: {
                    direction,
                    first,
                    second,
                },
            },
            },
        ]);
        
    } else {
        currentNode = nodeId
    }

    return currentNode

}