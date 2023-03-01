import { Injectable } from "@noopejs/react-gen/Injectable";

@Injectable(["$2Module"])
export class $2Service {
  private message: string = "Hello Mama I'm $2";
  public getMessage(): string {
    return this.message;
  }
}
