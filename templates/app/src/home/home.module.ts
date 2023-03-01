import { Module } from "@noopejs/react-gen/Module";
import { Inject } from "@noopejs/react-gen/Injectable";
import RootModule from "../root/root.module";
import HomeComponent from "./home.component";
import { HomeService } from "./home.service";
import { View } from "@noopejs/react-gen/ModuleComponent";

@Module({
  component: HomeComponent,
  parent: () => RootModule,
  providers: [HomeService],
})
export default class HomeModule {
  constructor(
    @Inject("HomeService") private homeService: HomeService,
    @View() private homeComponent: (props: { message: string }) => JSX.Element
  ) {}

  renderComponent() {
    return this.homeComponent({ message: this.homeService.getMessage() });
  }
}
