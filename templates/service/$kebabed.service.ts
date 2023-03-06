import { Injectable } from "@noopejs/react-gen/Injectable";

@Injectable([])
export class $capitalizedService {
  private message: string = "Hello Mama I'm $regularized";
  public getMessage(): string {
    return this.message;
  }
}
