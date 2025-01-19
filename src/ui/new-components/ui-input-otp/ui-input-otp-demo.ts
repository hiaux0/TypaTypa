import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Input OTP</h2>
    <ui-input-otp></ui-input-otp>

    <h2>Destructive Input OTP</h2>
    <ui-input-otp variant="destructive"></ui-input-otp>

    <h2>Outline Input OTP</h2>
    <ui-input-otp variant="outline"></ui-input-otp>

    <h2>Secondary Input OTP</h2>
    <ui-input-otp variant="secondary"></ui-input-otp>

    <h2>Ghost Input OTP</h2>
    <ui-input-otp variant="ghost"></ui-input-otp>

    <h2>Link Input OTP</h2>
    <ui-input-otp variant="link"></ui-input-otp>

    <h2>Small Input OTP</h2>
    <ui-input-otp size="sm"></ui-input-otp>

    <h2>Large Input OTP</h2>
    <ui-input-otp size="lg"></ui-input-otp>
  </div>
`;

@customElement({ name: "ui-input-otp-demo", template })
export class UiInputOtpDemo {}
