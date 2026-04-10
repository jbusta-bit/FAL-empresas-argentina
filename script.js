const CONFIG = {
  recipientEmail: "jbustamante@balanz.com",
};

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function parseNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function baseRateFor(companyType) {
  return companyType === "grande" ? 1 : 2.5;
}

function updateCalculator() {
  const companyType = document.getElementById("companyType").value;
  const payroll = parseNumber(document.getElementById("monthlyPayroll").value);
  const employees = parseNumber(document.getElementById("employees").value);
  const extra = parseNumber(document.getElementById("extraContribution").value);
  const baseRate = baseRateFor(companyType);
  const totalRate = baseRate + extra;
  const legalMonthly = payroll * (baseRate / 100);
  const totalMonthly = payroll * (totalRate / 100);
  const annual = totalMonthly * 12;
  const perEmployee = employees > 0 ? totalMonthly / employees : 0;

  document.getElementById("baseRate").textContent = `${baseRate.toFixed(1)}%`;
  document.getElementById("baseRateInline").textContent = `${baseRate.toFixed(1)}%`;
  document.getElementById("legalMonthly").textContent = currency.format(legalMonthly);
  document.getElementById("totalMonthly").textContent = currency.format(totalMonthly);
  document.getElementById("annual").textContent = currency.format(annual);
  document.getElementById("perEmployee").textContent = currency.format(perEmployee);
  document.getElementById("payrollValue").textContent = currency.format(payroll);
  document.getElementById("employeesHint").textContent = `${employees || 0} empleados informados`;
  document.getElementById("totalMonthlyHint").textContent = `Base + ${extra.toFixed(1)}% adicional`;
}

function buildMailSubject(nombre) {
  return `FAL - ${nombre.trim() || "Solicitud de información"}`;
}

function buildMailBody(form) {
  return [
    `Nombre: ${form.nombre}`,
    `Cargo: ${form.cargo}`,
    `Empresa: ${form.empresa}`,
    `CUIT: ${form.cuit}`,
    `Email: ${form.email}`,
    `Teléfono: ${form.telefono}`,
    `Cantidad de empleados: ${form.empleados}`,
    `Masa salarial mensual estimada: ${form.masaSalarial}`,
    "",
    "Mensaje:",
    form.mensaje || "Quiero recibir información para evaluar implementación y apertura del FAL para mi empresa.",
  ].join("\n");
}

function handleLeadSubmit(event) {
  event.preventDefault();

  const form = {
    nombre: document.getElementById("nombre").value,
    cargo: document.getElementById("cargo").value,
    empresa: document.getElementById("empresa").value,
    cuit: document.getElementById("cuit").value,
    email: document.getElementById("email").value,
    telefono: document.getElementById("telefono").value,
    empleados: document.getElementById("empleadosForm").value,
    masaSalarial: document.getElementById("masaSalarial").value,
    mensaje: document.getElementById("mensaje").value,
  };

  const subject = encodeURIComponent(buildMailSubject(form.nombre));
  const body = encodeURIComponent(buildMailBody(form));
  window.location.href = `mailto:${CONFIG.recipientEmail}?subject=${subject}&body=${body}`;
}

function runDevChecks() {
  const subject = buildMailSubject("Juan Pérez");
  const body = buildMailBody({
    nombre: "Juan Pérez",
    cargo: "CFO",
    empresa: "Empresa SA",
    cuit: "30-12345678-9",
    email: "juan@empresa.com",
    telefono: "+54 11 1234 5678",
    empleados: "50",
    masaSalarial: "ARS 25.000.000",
    mensaje: "Necesito más información.",
  });

  console.assert(subject === "FAL - Juan Pérez", "Mail subject inválido");
  console.assert(body.includes("Nombre: Juan Pérez"), "Body sin nombre");
  console.assert(body.includes("Mensaje:"), "Body sin bloque de mensaje");
  console.assert(body.includes("\n"), "Body sin saltos de línea");

  const testRatePyme = baseRateFor("pyme");
  const testRateGrande = baseRateFor("grande");
  console.assert(testRatePyme === 2.5, "Base rate pyme inválido");
  console.assert(testRateGrande === 1, "Base rate grande inválido");
}

window.addEventListener("DOMContentLoaded", () => {
  document.title = "FAL Empresas Argentina | Información y apertura";

  ["companyType", "monthlyPayroll", "employees", "extraContribution"].forEach((id) => {
    document.getElementById(id).addEventListener("input", updateCalculator);
    document.getElementById(id).addEventListener("change", updateCalculator);
  });

  document.getElementById("leadForm").addEventListener("submit", handleLeadSubmit);

  updateCalculator();
  runDevChecks();
});
