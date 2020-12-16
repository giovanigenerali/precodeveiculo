/* Preço de Veículo - https://precodeveiculo.netlify.app
 * https://github.com/giovanigenerali/precodeveiculo
 * Developed by Giovani Generali - https://github.com/giovanigenerali
 */
const fipeAPI = "https://veiculos.fipe.org.br/api/veiculos";
const referencia = document.getElementById("referencia");
const tipoVeiculo = document.getElementById("tipo_veiculo");
const marca = document.getElementById("marca");
const modelo = document.getElementById("modelo");
const ano = document.getElementById("ano");
const consultar = document.getElementById("search");
const resultado = document.getElementById("resultado");
let referenciaHistorico = [];
let chart = null;

function generateLabelMonth(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).substring(0, 2);
}

function generateLabelYear(string) {
  return string.slice(2);
}

function generateReferenciaHistorico(data) {
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  let years_months = new Map();

  data.forEach((item) => {
    const [mes, ano] = item.Mes.replace(/\s/g, "").split("/");
    const data = {
      label: `${generateLabelMonth(mes)}/${generateLabelYear(ano)}`,
      id: item.Codigo,
    };

    years_months.set(
      ano,
      years_months.get(ano) ? [...years_months.get(ano), data] : [data]
    );
  });

  return Array.from(years_months).map(([key, value]) => {
    value.sort((a, b) => months[a[0]] - months[b[0]]);
    return { year: key, data: value };
  });
}

async function loadReferencia() {
  try {
    const { data } = await axios.post(`${fipeAPI}/ConsultarTabelaDeReferencia`);

    referenciaHistorico = generateReferenciaHistorico(data);

    data.forEach((element) => {
      const option = document.createElement("option");
      option.text = element.Mes;
      option.value = element.Codigo;

      referencia.add(option);
    });

    referencia.removeAttribute("disabled");
  } catch (err) {
    console.log("loadReferencia error", err);
  }
}

async function loadMarcas() {
  try {
    const form = new FormData();
    form.append("codigoTabelaReferencia", parseInt(referencia.value, 10));
    form.append("codigoTipoVeiculo", parseInt(tipoVeiculo.value, 10));

    const { data } = await axios.post(`${fipeAPI}/ConsultarMarcas`, form);

    data.forEach((element) => {
      const option = document.createElement("option");
      option.text = element.Label;
      option.value = element.Value;

      marca.add(option);
    });

    marca.removeAttribute("disabled");
  } catch (err) {
    console.log("loadMarcas error", err);
  }
}

async function loadModelos() {
  try {
    const form = new FormData();
    form.append("codigoTabelaReferencia", parseInt(referencia.value, 10));
    form.append("codigoTipoVeiculo", parseInt(tipoVeiculo.value, 10));
    form.append("codigoMarca", parseInt(marca.value, 10));

    const {
      data: { Modelos: data },
    } = await axios.post(`${fipeAPI}/ConsultarModelos`, form);

    data.forEach((element) => {
      const option = document.createElement("option");
      option.text = element.Label;
      option.value = element.Value;

      modelo.add(option);
    });

    modelo.removeAttribute("disabled");
  } catch (err) {
    console.log("loadModelos error", err);
  }
}

async function loadAnos() {
  try {
    const form = new FormData();
    form.append("codigoTabelaReferencia", parseInt(referencia.value, 10));
    form.append("codigoTipoVeiculo", parseInt(tipoVeiculo.value, 10));
    form.append("codigoMarca", parseInt(marca.value, 10));
    form.append("codigoModelo", parseInt(modelo.value, 10));

    const { data } = await axios.post(`${fipeAPI}/ConsultarAnoModelo`, form);

    data.forEach((element) => {
      const option = document.createElement("option");
      option.text =
        element.Value.indexOf("32000") !== -1 ? "Zero KM" : element.Label;
      option.value = element.Value;

      ano.add(option);
    });

    ano.removeAttribute("disabled");
  } catch (err) {
    console.log("loadAnos error", err);
  }
}

async function loadVeiculo() {
  try {
    const [anoModelo, codigoTipoCombustivel] = ano.value.split("-");

    const form = new FormData();
    form.append("codigoTabelaReferencia", parseInt(referencia.value, 10));
    form.append("codigoTipoVeiculo", parseInt(tipoVeiculo.value, 10));
    form.append("codigoMarca", parseInt(marca.value, 10));
    form.append("codigoModelo", parseInt(modelo.value, 10));
    form.append("ano", ano.value);
    form.append("anoModelo", parseInt(anoModelo, 10));
    form.append("codigoTipoCombustivel", parseInt(codigoTipoCombustivel, 10));
    form.append("tipoConsulta", "tradicional");

    resultado.innerHTML = "<p>Carregando...</p>";
    consultar.setAttribute("disabled", true);

    const { data } = await axios.post(
      `${fipeAPI}/ConsultarValorComTodosParametros`,
      form
    );

    renderVeiculo(data);

    consultar.removeAttribute("disabled");
  } catch (err) {
    console.log("loadVeiculo error", err);
  }
}

function renderVeiculo(data) {
  const {
    MesReferencia,
    CodigoFipe,
    Marca,
    Modelo,
    Combustivel,
    DataConsulta,
    Valor,
  } = data;

  const AnoModelo = data.AnoModelo === 32000 ? "Zero KM" : data.AnoModelo;

  const result = `
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tbody>
        <tr>
          <td>Mês de referência</td>
          <td>${MesReferencia}</td>
        </tr>
        <tr>
          <td>Código FIPE</td>
          <td>${CodigoFipe}</td>
        </tr>
        <tr>
          <td>Marca</td>
          <td>${Marca}</td>
        </tr>
        <tr>
          <td>Modelo</td>
          <td>${Modelo}</td>
        </tr>
        <tr>
          <td>Ano</td>
          <td>${AnoModelo}</td>
        </tr>
        <tr>
          <td>Combustível</td>
          <td>${Combustivel}</td>
        </tr>
        <tr>
          <td>Data da consulta</td>
          <td>${DataConsulta}</td>
        </tr>
        <tr>
          <td>Preço Médio</td>
          <td>${Valor}</td>
        </tr>
      </tbody>
    </table>
    ${
      referenciaHistorico &&
      `
        <br>
        <select id="historico">
          <option value="">Escolha o ano para exibir a variação de preço.</option>
          ${referenciaHistorico
            .map(
              (referencia) =>
                `<option value="${referencia.year}">${referencia.year}</option>`
            )
            .join("")}
        </select>
        <canvas id="grafico" style="display: none; width: 100%"></canvas>
      `
    }
  `;

  resultado.innerHTML = result;
  resultado.scrollIntoView({ behavior: "smooth" });

  const historico = document.getElementById("historico");

  historico.addEventListener("change", async (event) => {
    if (event.target.value !== "") {
      historico.setAttribute("disabled", true);
      generateChartData(event.target.value);
    } else {
      if (chart) {
        chart.destroy();
      }
    }
  });
}

async function generateChartData(year) {
  const historico = document.getElementById("historico");
  const { data } = referenciaHistorico.find(
    (referencia) => referencia.year === year
  );
  const [anoModelo, codigoTipoCombustivel] = ano.value.split("-");
  const dataChart = [];

  if (chart) {
    chart.destroy();
  }

  if (document.getElementById("sem_historico")) {
    document.getElementById("sem_historico").remove();
  }

  await Promise.all(
    data.map(async (item, idx) => {
      const form = new FormData();
      form.append("codigoTipoVeiculo", parseInt(tipoVeiculo.value, 10));
      form.append("codigoMarca", parseInt(marca.value, 10));
      form.append("codigoModelo", parseInt(modelo.value, 10));
      form.append("ano", ano.value);
      form.append("anoModelo", parseInt(anoModelo, 10));
      form.append("codigoTipoCombustivel", parseInt(codigoTipoCombustivel, 10));
      form.append("tipoConsulta", "tradicional");
      form.append("codigoTabelaReferencia", item.id);

      const { data } = await axios.post(
        `${fipeAPI}/ConsultarValorComTodosParametros`,
        form
      );

      if (data && data.Valor) {
        const value = parseFloat(
          data.Valor.replace("R$", "")
            .replace(/\./g, "")
            .replace(/\,/, ".")
            .replace(/\s/g, "")
        );

        dataChart.push({
          order: idx,
          label: item.label,
          value,
          price: data.Valor,
        });
      }
    })
  );

  dataChart.sort((a, b) =>
    a.order > b.order ? 1 : b.order > a.order ? -1 : 0
  );

  historico.removeAttribute("disabled");

  if (dataChart.length > 0) {
    renderChart(dataChart);
  } else {
    const message = document.createElement("p");
    message.id = "sem_historico";
    message.innerHTML = "Não existe histório de preço para este ano.";

    resultado.appendChild(message);
  }
}

function renderChart(chartData) {
  const grafico = document.getElementById("grafico");
  const labelMonths = chartData.map((data) => data.label).reverse();
  const dataValues = chartData.map((data) => data.value).reverse();
  const color = "rgb(54, 162, 235)";
  const colorHelper = Chart.helpers.color;

  chart = new Chart(grafico, {
    type: "line",
    data: {
      labels: labelMonths,
      datasets: [
        {
          data: dataValues,
          borderColor: color,
          label: false,
          fill: true,
          backgroundColor: colorHelper(color).alpha(0.2).rgbString(),
          pointBackgroundColor: color,
          pointBorderColor: color,
        },
      ],
    },
    options: {
      responsive: true,
      tooltips: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (value) => {
            const label = value.yLabel
              .toString()
              .split(/(?=(?:...)*$)/)
              .join(".");
            return `R$ ${label}`;
          },
        },
      },
      legend: {
        display: false,
      },
      scales: {
        yAxes: [
          {
            ticks: {
              userCallback: (value) => {
                const val = value
                  .toString()
                  .split(/(?=(?:...)*$)/)
                  .join(".");
                return `R$ ${val}`;
              },
            },
          },
        ],
      },
      hover: {
        mode: "nearest",
        intersect: true,
      },
    },
  });

  grafico.style.display = "";
}

referencia.addEventListener("change", (event) => {
  if (event.target.value !== "") {
    tipoVeiculo.removeAttribute("disabled");
  } else {
    tipoVeiculo.setAttribute("disabled", true);
  }

  tipoVeiculo.value = "";

  marca.setAttribute("disabled", true);
  marca.innerHTML = `<option value="">-</option>`;

  modelo.setAttribute("disabled", true);
  modelo.innerHTML = `<option value="">-</option>`;

  ano.setAttribute("disabled", true);
  ano.innerHTML = `<option value="">-</option>`;

  consultar.setAttribute("disabled", true);

  resultado.innerHTML = "";
});

tipoVeiculo.addEventListener("change", (event) => {
  if (event.target.value !== "") {
    loadMarcas();
  }

  marca.setAttribute("disabled", true);
  marca.innerHTML = `<option value="">-</option>`;

  modelo.setAttribute("disabled", true);
  modelo.innerHTML = `<option value="">-</option>`;

  ano.setAttribute("disabled", true);
  ano.innerHTML = `<option value="">-</option>`;

  consultar.setAttribute("disabled", true);

  resultado.innerHTML = "";
});

marca.addEventListener("change", (event) => {
  if (event.target.value !== "") {
    loadModelos();
  }

  modelo.setAttribute("disabled", true);
  modelo.innerHTML = `<option value="">-</option>`;

  ano.setAttribute("disabled", true);
  ano.innerHTML = `<option value="">-</option>`;

  consultar.setAttribute("disabled", true);

  resultado.innerHTML = "";
});

modelo.addEventListener("change", (event) => {
  if (event.target.value !== "") {
    loadAnos();
  }

  ano.setAttribute("disabled", true);
  ano.innerHTML = `<option value="">-</option>`;

  consultar.setAttribute("disabled", true);

  resultado.innerHTML = "";
});

ano.addEventListener("change", (event) => {
  if (event.target.value !== "") {
    consultar.removeAttribute("disabled");
  } else {
    consultar.setAttribute("disabled", true);
  }

  resultado.innerHTML = "";
});

consultar.addEventListener("click", () => {
  loadVeiculo();
});

document.addEventListener("DOMContentLoaded", () => {
  loadReferencia();
});
