import { resolve } from "aurelia";
import { CompletionsService } from "../../../../common/services/CompletionsService";
import { COMPLETIONS_MAP } from "../../../../common/modules/constants";

export class CompletionsProviderDemo {
  public message = "./completions-provider-demo.html";

  private completionsService = resolve(CompletionsService);

  constructor() {
    this.completionsService.register(
      COMPLETIONS_MAP.gridFunctions,
      ["hi", "bye"].map((v) => ({ text: v })),
    );
  }
}
