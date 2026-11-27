import { splitTagsClient } from './splitTags.client';

export async function listSplitTags(clientId: string): Promise<readonly string[]> {
  const response = await splitTagsClient.list(clientId);
  return response.splitTags;
}

export async function addSplitTag(clientId: string, tag: string): Promise<readonly string[]> {
  const response = await splitTagsClient.add(clientId, { tag });
  return response.splitTags;
}
