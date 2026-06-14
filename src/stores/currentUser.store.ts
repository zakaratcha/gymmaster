import { action, makeObservable, observable } from 'mobx';

import type { Trainer } from '../services/trainers/trainers.models.ts';

class CurrentUserStore implements Partial<Trainer> {
  @observable id?: Trainer['id'];
  @observable email?: Trainer['email'];
  @observable status?: Trainer['status'];
  @observable roles?: Trainer['roles'];
  @observable inited = false;

  constructor() {
    makeObservable(this);
  }

  @action
  setTrainer(trainer: Trainer): void {
    this.id = trainer.id;
    this.email = trainer.email;
    this.status = trainer.status;
    this.roles = [...trainer.roles];
  }

  @action
  setInited(inited: boolean): void {
    this.inited = inited;
  }

  @action
  reset(): void {
    this.id = undefined;
    this.email = undefined;
    this.status = undefined;
    this.roles = undefined;
  }
}

export const currentUserStore = new CurrentUserStore();
