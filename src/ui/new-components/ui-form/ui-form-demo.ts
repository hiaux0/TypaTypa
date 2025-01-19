import { UiForm } from "./ui-form";

export class UiFormDemo {
  public message = "ui-form-demo";

  // Example 1: Default Form
  public defaultForm = `
    <ui-form>
      <input type="text" placeholder="Default Form Input" />
      <button type="submit">Submit</button>
    </ui-form>
  `;

  // Example 2: Primary Form
  public primaryForm = `
    <ui-form variant="primary">
      <input type="text" placeholder="Primary Form Input" />
      <button type="submit">Submit</button>
    </ui-form>
  `;

  // Example 3: Secondary Form
  public secondaryForm = `
    <ui-form variant="secondary">
      <input type="text" placeholder="Secondary Form Input" />
      <button type="submit">Submit</button>
    </ui-form>
  `;

  // Example 4: Destructive Form
  public destructiveForm = `
    <ui-form variant="destructive">
      <input type="text" placeholder="Destructive Form Input" />
      <button type="submit">Submit</button>
    </ui-form>
  `;

  // Example 5: Form with Validation
  public formWithValidation = `
    <ui-form submit.bind="validateForm">
      <input type="text" placeholder="Form Input" required />
      <button type="submit">Submit</button>
    </ui-form>
  `;

  public validateForm() {
    // Add form validation logic here
    alert("Form submitted!");
  }
}
