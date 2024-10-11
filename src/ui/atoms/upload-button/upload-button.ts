import { bindable } from "aurelia";
import "./upload-button.scss";

export class UploadButton {
  @bindable public onUpload: (result: string) => void;
  public uploadButtonRef: HTMLInputElement;

  attached() {
    const onChange = (event) => {
      const reader = new FileReader();
      reader.onload = onReaderLoad;
      reader.readAsText(event.target.files[0]);
    };

    const onReaderLoad = (event) => {
      this.onUpload(event.target.result);
    };

    this.uploadButtonRef.addEventListener("change", onChange);
  }
}
