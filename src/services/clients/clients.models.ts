export type Client = {
  readonly id: string;
  readonly name: string;
  readonly notes?: string;
  readonly bodyWeightKg?: number;
};

export type CreateClientRequest = {
  readonly name: string;
  readonly notes?: string;
  readonly bodyWeightKg?: number;
};

export type UpdateClientRequest = {
  readonly name?: string;
  readonly notes?: string;
  readonly bodyWeightKg?: number | null;
};

export type ClientsListResponse = {
  readonly clients: readonly Client[];
};

export type ClientResponse = {
  readonly client: Client;
};
