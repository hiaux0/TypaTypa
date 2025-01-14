export default function (
  /** @type {import('plop').NodePlopAPI} */
  plop
) {
  // controller generator
  plop.setGenerator("Ui Component", {
    description: "Create a new Ui Component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Ui Component name"
      },
      {
        type: "list",
        name: "type",
        message: "Ui Component type",
        choices: ["atoms", "molecules", "organisms", "pages"]
      }
    ],
    actions: [
      {
        type: "add",
        path: "src/ui/{{type}}/ui-{{name}}/ui-{{name}}.ts",
        templateFile: "src/ui/templates/ui-template-hbs/ui-template.ts.hbs"
      },
      {
        type: "add",
        path: "src/ui/{{type}}/ui-{{name}}/ui-{{name}}.html",
        templateFile: "src/ui/templates/ui-template-hbs/ui-template.html.hbs"
      },
      {
        type: "add",
        path: "src/ui/{{type}}/ui-{{name}}/ui-{{name}}-demo/ui-{{name}}-demo.ts",
        templateFile: "src/ui/templates/ui-template-hbs/ui-template.ts.hbs"
      },
      {
        type: "add",
        path: "src/ui/{{type}}/ui-{{name}}/ui-{{name}}-demo/ui-{{name}}-demo.html",
        templateFile: "src/ui/templates/ui-template-hbs/ui-template.html.hbs"
      }
      // demo
    ]
  });
}
