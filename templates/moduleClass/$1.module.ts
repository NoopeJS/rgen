import { Module } from "@noopejs/react-gen/Module";
import { Inject } from "@noopejs/react-gen/Injectable";
import RootModule from "../root/root.module";
import $2Component from "./$1.component";
import { $2Service } from "./$1.service";
import { View } from "@noopejs/react-gen/ModuleComponent";

@Module({
  component: $2Component,
  parent: () => RootModule,
  providers: [$2ervice],
})
export default class $2Module {
  constructor(
    @Inject("$2Service") private $1Service: $2Service,
    @View() private $1Component: (props: { message: string }) => JSX.Element
  ) {}

  renderComponent() {
    return this.$1Component({ message: this.$1Service.getMessage() });
  }
}
