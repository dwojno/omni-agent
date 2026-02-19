export class HookManager implements TransactionHooks {
  private readonly afterCommitCallbacks: (() => void | Promise<void>)[] = [];

  public onAfterCommit(callback: VoidFunction) {
    this.afterCommitCallbacks.push(callback);
  }

  public async executeAfterCommitCallbacks() {
    for (const callback of this.afterCommitCallbacks) {
      await callback();
    }
  }
}
export interface TransactionHooks {
  onAfterCommit: (callback: () => void | Promise<void>) => void;
}
