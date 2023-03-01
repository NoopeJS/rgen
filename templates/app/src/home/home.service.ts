import { Injectable } from "@noopejs/react-gen/Injectable";

@Injectable(["HomeModule"])
export class HomeService {
  private message: string = "Hello Mama I'm Home";
  public getMessage(): string {
    return this.message;
  }
}
