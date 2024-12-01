import { route } from '@aurelia/router-lite';
import './ui-lib-page.scss';
import { UiLibWelcome } from './ui-lib-welcome/ui-lib-welcome';

const routes = [
  {
    path: "",
    component: UiLibWelcome,
    title: "Ui Lib",
  },
];

@route({
  title: 'uilibHI',
  routes,
})
export class UiLibPage {
  public message = "ui-lib-page.html";
}
