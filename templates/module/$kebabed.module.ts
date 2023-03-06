import { Module } from "@noopejs/react-gen/Module";
import { Inject } from "@noopejs/react-gen/Injectable";
import RootModule from "../root/root.module";
import $capitalizedComponent from "./$kebabed.component";
import { $capitalizedService } from "./$kebabed.service";
import { View } from "@noopejs/react-gen/ModuleComponent";

@Module({
  component: $capitalizedComponent,
  parent: () => RootModule,
  providers: [$capitalizedService],
})
export default class $capitalizedModule {
  constructor(
    @Inject("$capitalizedService") private $camelizedService: $capitalizedService,
    @View() private $camelizedComponent: (props: { message: string }) => JSX.Element
  ) {}

  renderComponent() {
    return this.$camelizedComponent({ message: this.$camelizedService.getMessage() });
  }
}
