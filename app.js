/* Preço de Veículo - https://precodeveiculo.netlify.app
 * https://github.com/wgenial/precodeveiculo
 * Developed by WGenial - http://wgenial.com.br
 */
const referencia = document.getElementById("referencia");
const tipoVeiculo = document.getElementById("tipo_veiculo");
const marca = document.getElementById("marca");
const modelo = document.getElementById("modelo");
const ano = document.getElementById("ano");
const consultar = document.getElementById("search");
const resultado = document.getElementById("resultado");

async function loadReferencia() {
  try {
    const { data } = await axios.post("https://veiculos.fipe.org.br/api/veiculos/ConsultarTabelaDeReferencia");

    data.forEach(element => {
      const option = document.createElement("option");
      option.text = element.Mes;
      option.value = element.Codigo;

      referencia.add(option);
    });

    referencia.removeAttribute("disabled");
  } catch (err) {
    console.log(err);
  }
}

async function loadMarcas() {
  try {
    const form = new FormData();
    form.append('codigoTabelaReferencia', parseInt(referencia.value, 10));
    form.append('codigoTipoVeiculo', parseInt(tipoVeiculo.value, 10));

    const { data } = await axios.post("https://veiculos.fipe.org.br/api/veiculos/ConsultarMarcas", form);

    data.forEach(element => {
      const option = document.createElement("option");
      option.text = element.Label;
      option.value = element.Value;

      marca.add(option);
    });

    marca.removeAttribute("disabled");
  } catch (err) {
    console.log(err);
  }
}

async function loadModelos() {
  try {
    const form = new FormData();
    form.append('codigoTabelaReferencia', parseInt(referencia.value, 10));
    form.append('codigoTipoVeiculo', parseInt(tipoVeiculo.value, 10));
    form.append('codigoMarca', parseInt(marca.value, 10));

    const { data: { Modelos: data} } = await axios.post("https://veiculos.fipe.org.br/api/veiculos/ConsultarModelos", form);

    data.forEach(element => {
      const option = document.createElement("option");
      option.text = element.Label;
      option.value = element.Value;

      modelo.add(option);
    });

    modelo.removeAttribute("disabled");
  } catch (err) {
    console.log(err);
  }
}

async function loadAnos() {
  try {
    const form = new FormData();
    form.append('codigoTabelaReferencia', parseInt(referencia.value, 10));
    form.append('codigoTipoVeiculo', parseInt(tipoVeiculo.value, 10));
    form.append('codigoMarca', parseInt(marca.value, 10));
    form.append('codigoModelo', parseInt(modelo.value, 10));

    const { data } = await axios.post("https://veiculos.fipe.org.br/api/veiculos/ConsultarAnoModelo", form);

    data.forEach(element => {
      const option = document.createElement("option");
      option.text = element.Label;
      option.value = element.Value;

      ano.add(option);
    });

    ano.removeAttribute("disabled");
  } catch (err) {
    console.log(err);
  }
}

async function loadVeiculo() {
  try {
    const [anoModelo, codigoTipoCombustivel] = ano.value.split("-");

    const form = new FormData();
    form.append('codigoTabelaReferencia', parseInt(referencia.value, 10));
    form.append('codigoTipoVeiculo', parseInt(tipoVeiculo.value, 10));
    form.append('codigoMarca', parseInt(marca.value, 10));
    form.append('codigoModelo', parseInt(modelo.value, 10));
    form.append('ano', ano.value);
    form.append('anoModelo', parseInt(anoModelo, 10));
    form.append('codigoTipoCombustivel', parseInt(codigoTipoCombustivel, 10));
    form.append('tipoConsulta', "tradicional");

    resultado.innerHTML = `<p>Carregando...</p>`;
    consultar.setAttribute("disabled", true);

    const { data } = await axios.post("https://veiculos.fipe.org.br/api/veiculos/ConsultarValorComTodosParametros", form);

    renderVeiculo(data);

    consultar.removeAttribute("disabled");

  } catch (err) {
    console.log(err);
  }
}

function renderVeiculo(data) {
  const {
    MesReferencia,
    CodigoFipe,
    Marca,
    Modelo,
    AnoModelo,
    Combustivel,
    DataConsulta,
    Valor
  } = data;

  const result = `
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tbody>
        <tr>
          <td>Mês de referência:</td>
          <td>${MesReferencia}</td>
        </tr>
        <tr>
          <td>Código Fipe:</td>
          <td>${CodigoFipe}</td>
        </tr>
        <tr>
          <td>Marca:</td>
          <td>${Marca}</td>
        </tr>
        <tr>
          <td>Modelo:</td>
          <td>${Modelo}</td>
        </tr>
        <tr>
          <td>Ano Modelo:</td>
          <td>${AnoModelo} ${Combustivel}</td>
        </tr>
        <tr>
          <td>Data da consulta:</td>
          <td>${DataConsulta}</td>
        </tr>
        <tr>
          <td>Preço Médio:</td>
          <td>${Valor}</td>
        </tr>
      </tbody>
    </table>
  `;

  resultado.innerHTML = result;
  resultado.scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  loadReferencia();
});

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