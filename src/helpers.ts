import { failureServiceResponse, IAnchor, INode, IServiceResponse } from "hypertext-interfaces"
import { queryCache } from "react-query"

export function getNode(nodeId: string): IServiceResponse<INode> {
    const sr: IServiceResponse<INode> = queryCache.getQueryData(nodeId)
    if (sr) {
      return sr
    }
    return failureServiceResponse("Node isn't in cache")
  }

export const getAnchor = (anchorId: string): IServiceResponse<IAnchor> => {
    const sr: IServiceResponse<IAnchor> = queryCache.getQueryData(anchorId)
    if (sr) {
        return sr
    }
    return failureServiceResponse("Anchor not in cache.")
}