import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Form</h2>
    <ui-form>
      <input type="text" placeholder="Default Form Input" />
      <button type="submit">Submit</button>
    </ui-form>

    <h2>Primary Form</h2>
    <ui-form variant="primary">
      <input type="text" placeholder="Primary Form Input" />
      <button type="submit">Submit</button>
    </ui-form>

    <h2>Secondary Form</h2>
    <ui-form variant="secondary">
      <input type="text" placeholder="Secondary Form Input" />
      <button type="submit">Submit</button>
    </ui-form>

    <h2>Destructive Form</h2>
    <ui-form variant="destructive">
      <input type="text" placeholder="Destructive Form Input" />
      <button type="submit">Submit</button>
    </ui-form>

    <h2>Form with Validation</h2>
    <ui-form submit.bind="validateForm">
      <input type="text" placeholder="Form Input" required />
      <button type="submit">Submit</button>
    </ui-form>
  </div>
`;

@customElement({ name: "ui-form-demo", template })
export class UiFormDemo {
  public validateForm() {
    // Add form validation logic here
    alert("Form submitted!");
  }
}
