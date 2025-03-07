import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Bar Chart</h2>
    <ui-chart type="bar" data.bind="barChartData" options.bind="chartOptions"></ui-chart>

    <h2>Line Chart</h2>
    <ui-chart type="line" data.bind="lineChartData" options.bind="chartOptions"></ui-chart>

    <h2>Pie Chart</h2>
    <ui-chart type="pie" data.bind="pieChartData" options.bind="chartOptions"></ui-chart>

    <h2>Primary Color Bar Chart</h2>
    <ui-chart type="bar" color="primary" data.bind="barChartData" options.bind="chartOptions"></ui-chart>

    <h2>Destructive Color Line Chart</h2>
    <ui-chart type="line" color="destructive" data.bind="lineChartData" options.bind="chartOptions"></ui-chart>
  </div>
`;

@customElement({ name: "ui-chart-demo", template })
export class UiChartDemo {
  public barChartData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Dataset 1",
        backgroundColor: "#42A5F5",
        borderColor: "#1E88E5",
        data: [65, 59, 80, 81, 56, 55, 40],
      },
      {
        label: "Dataset 2",
        backgroundColor: "#9CCC65",
        borderColor: "#7CB342",
        data: [28, 48, 40, 19, 86, 27, 90],
      },
    ],
  };

  public lineChartData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Dataset 1",
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        data: [65, 59, 80, 81, 56, 55, 40],
      },
      {
        label: "Dataset 2",
        backgroundColor: "rgba(153,102,255,0.4)",
        borderColor: "rgba(153,102,255,1)",
        data: [28, 48, 40, 19, 86, 27, 90],
      },
    ],
  };

  public pieChartData = {
    labels: ["Red", "Blue", "Yellow"],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  public chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
}
