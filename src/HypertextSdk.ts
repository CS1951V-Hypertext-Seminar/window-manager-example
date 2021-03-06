import { failureServiceResponse, IAnchor, IFilePath, IImmutableGridAnchor, IImmutableTextAnchor, INode, IServiceResponse, successfulServiceResponse } from "hypertext-interfaces";
import AnchorGateway from "./Gateways/AnchorGateway";
import ImmutableGridAnchorGateway from "./Gateways/ImmutableGrid/ImmutableGridAnchorGateway";
import ImmutableTextAnchorGateway from "./Gateways/ImmutableText/ImmutableTextAnchorGateway";
import ImmutableTextNodeGateway from "./Gateways/ImmutableText/ImmutableTextNodeGateway";
import LinkGateway from "./Gateways/LinkGateway";
import NodeGateway from "./Gateways/NodeGateway";

interface IHypertextSdk {
    createImmutableTextAnchor(data: {
        anchor: IAnchor,
        immutableTextAnchor: IImmutableTextAnchor
    })
    createImmutableGridAnchor(data: {
        anchor: IAnchor,
        immutableGridAnchor: IImmutableGridAnchor
    })
    moveNode: (data: {
        moveFrom: IFilePath,
        moveTo: IFilePath
    }) => Promise<IServiceResponse<{}>>
    deleteNode: (node: INode) => Promise<IServiceResponse<{}>>
    deleteAnchor: (anchorId: string) => Promise<IServiceResponse<{}>>
}

const HypertextSdk: IHypertextSdk = {

    deleteNode: async (node: INode): Promise<IServiceResponse<{}>> => {

        const deleteNodeResponse = await NodeGateway.deleteNode(node.nodeId)
        if (!deleteNodeResponse.success) {
            return deleteNodeResponse
        }

        const nodeIds = getNodeIds(node)
        const responses = await Promise.all(nodeIds.map(nid => deleteRelatedNodeData(nid)))

        let errMsg = ''
        responses.forEach(sr => errMsg += sr.message)

        if (errMsg !== '') {
            return failureServiceResponse(errMsg)
        }

        return successfulServiceResponse({})

    },

    deleteAnchor: async (anchorId: string): Promise<IServiceResponse<{}>> => {
        let errMsg = ''

        const deleteAnchorsResponse = await AnchorGateway.deleteAnchor(anchorId)
        if (!deleteAnchorsResponse.success) {
            errMsg += deleteAnchorsResponse.message
        }

        const deleteImmutableAnchorsResponse = await ImmutableTextAnchorGateway.deleteAnchor(anchorId)
        if (!deleteImmutableAnchorsResponse.success) {
            errMsg += deleteImmutableAnchorsResponse.message
        }

        const deleteLinkResponse = await LinkGateway.deleteAnchorLinks(anchorId)
        if (!deleteLinkResponse.success) {
            errMsg += deleteLinkResponse.message
        }

        if (errMsg !== '') {
            return failureServiceResponse(errMsg)
        }

        return successfulServiceResponse({})
    },

    moveNode: async (data: {
        moveFrom: IFilePath,
        moveTo: IFilePath
    }): Promise<IServiceResponse<{}>> => {
        return await NodeGateway.moveNode(data.moveFrom, data.moveTo)
    },


    createImmutableTextAnchor: async (data: {
        anchor: IAnchor,
        immutableTextAnchor: IImmutableTextAnchor
    }): Promise<IServiceResponse<{
        anchor: IAnchor,
        immutableTextAnchor: IImmutableTextAnchor
    }>> => {
        const createAnchor = await AnchorGateway.createAnchor(data.anchor)
        if (createAnchor.success) {
            const createImmutableAnchor = await ImmutableTextAnchorGateway.createAnchor(data.immutableTextAnchor)
            if (createImmutableAnchor.success) {
                return successfulServiceResponse({
                    anchor: createAnchor.payload,
                    immutableTextAnchor: createImmutableAnchor.payload
                })
            } else {
                return failureServiceResponse(createImmutableAnchor.message)
            }
        } else {
            return failureServiceResponse(createAnchor.message)
        }
    },

    createImmutableGridAnchor: async (data: {
        anchor: IAnchor,
        immutableGridAnchor: IImmutableGridAnchor
    }): Promise<IServiceResponse<{
        anchor: IAnchor,
        immutableGridAnchor: IImmutableGridAnchor
    }>> => {
        const createAnchor = await AnchorGateway.createAnchor(data.anchor)
        if (createAnchor.success) {
            const createImmutableAnchor = await ImmutableGridAnchorGateway.createAnchor(data.immutableGridAnchor)
            if (createImmutableAnchor.success) {
                return successfulServiceResponse({
                    anchor: createAnchor.payload,
                    immutableGridAnchor: createImmutableAnchor.payload
                })
            } else {
                return failureServiceResponse(createImmutableAnchor.message)
            }
        } else {
            return failureServiceResponse(createAnchor.message)
        }
    }
}

function getNodeIds(node: INode): string[] {
    let childrenIds = []

    node.children.forEach(child => {
        childrenIds = childrenIds.concat(getNodeIds(child))
    })

    return [node.nodeId].concat(childrenIds)
}

async function deleteRelatedNodeData(nodeId: string): Promise<IServiceResponse<{}>> {
    let errMsg = ''

    const deleteImmutableNodeResponse = await ImmutableTextNodeGateway.deleteNode(nodeId)
        if (!deleteImmutableNodeResponse.success) {
            errMsg += deleteImmutableNodeResponse.message
        }

        const getNodeAnchorsResponse = await AnchorGateway.getNodeAnchors(nodeId)
        
        const deleteAnchorsResponse = await AnchorGateway.deleteNodeAnchors(nodeId)
        if (!deleteAnchorsResponse.success) {
            errMsg += deleteAnchorsResponse.message
        }

        if (getNodeAnchorsResponse.success) {
            const deleteImmutableAnchorsResponse = await ImmutableTextAnchorGateway.deleteAnchors(Object.keys(getNodeAnchorsResponse.payload))
            if (!deleteImmutableAnchorsResponse.success) {
                errMsg += deleteImmutableAnchorsResponse.message
            }
        }

        const deleteLinkResponse = await LinkGateway.deleteNodeLinks(nodeId)
        if (!deleteLinkResponse.success) {
            errMsg += deleteLinkResponse.message
        }

        if (errMsg !== '') {
            return failureServiceResponse(errMsg)
        }

        return successfulServiceResponse({})
}

export default HypertextSdk