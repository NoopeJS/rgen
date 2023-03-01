import { AppModule } from "@noopejs/react-gen/App";
import HomeModule from "../home/home.module";
import RootComponent from "./root.component";

console.log("Message from root.module.ts");
@AppModule({
  name: "Main",
  component: RootComponent,
  children: [HomeModule],
})
export default class RootModule {}
