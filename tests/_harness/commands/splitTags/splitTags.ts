import { splitTagsClient } from '../../../../src/services/splitTags/splitTags.client';
import type { AddSplitTagRequest, SplitTagsResponse } from '../../../../src/services/splitTags/splitTags.models';
import { requestAsAdmin, requestAsTrainer, requestWithoutAuth } from '../requestAs';

export async function listSplitTags(clientId: string): Promise<readonly string[]> {
  const response = await requestAsAdmin<SplitTagsResponse, [string]>(splitTagsClient.list, clientId);
  return response.splitTags;
}

export async function listSplitTagsForTrainer(clientId: string): Promise<readonly string[]> {
  const response = await requestAsTrainer<SplitTagsResponse, [string]>(splitTagsClient.list, clientId);
  return response.splitTags;
}

export async function listSplitTagsWithoutAuth(clientId: string): Promise<readonly string[]> {
  const response = await requestWithoutAuth<SplitTagsResponse, [string]>(splitTagsClient.list, clientId);
  return response.splitTags;
}

export async function addSplitTag(clientId: string, tag: string): Promise<readonly string[]> {
  const response = await requestAsAdmin<SplitTagsResponse, [string, AddSplitTagRequest]>(
    splitTagsClient.add,
    clientId,
    { tag }
  );
  return response.splitTags;
}

export async function addSplitTagForTrainer(clientId: string, tag: string): Promise<readonly string[]> {
  const response = await requestAsTrainer<SplitTagsResponse, [string, AddSplitTagRequest]>(
    splitTagsClient.add,
    clientId,
    { tag }
  );
  return response.splitTags;
}
