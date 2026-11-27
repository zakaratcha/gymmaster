import { boundClass } from 'autobind-decorator';

import { api } from '../api/api.service';
import { ApiClient } from '../api/ApiClient';
import type { AddSplitTagRequest, SplitTagsResponse } from './splitTags.models';

@boundClass
class SplitTagsClient extends ApiClient {
  private static _instance: SplitTagsClient;

  static get instance(): SplitTagsClient {
    return this._instance ?? (this._instance = new this());
  }

  private getSplitTagsUrl(clientId: string): string {
    return `${this.getApiUrl()}/clients/${encodeURIComponent(clientId)}/split-tags`;
  }

  async list(clientId: string): Promise<SplitTagsResponse> {
    return await api.get<SplitTagsResponse>(this.getSplitTagsUrl(clientId), { cache: { disabled: true } });
  }

  async add(clientId: string, payload: AddSplitTagRequest): Promise<SplitTagsResponse> {
    return await api.post<SplitTagsResponse>(this.getSplitTagsUrl(clientId), payload);
  }
}

export const splitTagsClient = SplitTagsClient.instance;
