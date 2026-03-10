// State management
let selectedLogics = []
let patientData = {}
const diagnosticResults = []

// Initialize event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Logic selection buttons
  const logicButtons = document.querySelectorAll(".logic-button")
  logicButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const logic = button.dataset.logic
      toggleLogicSelection(logic, button)
    })
  })

  // Diagnose button
  document.getElementById("diagnoseButton").addEventListener("click", runDiagnostic)
})

// Toggle logic selection
function toggleLogicSelection(logic, button) {
  if (selectedLogics.includes(logic)) {
    selectedLogics = selectedLogics.filter((l) => l !== logic)
    button.classList.remove("active")
  } else {
    selectedLogics.push(logic)
    button.classList.add("active")
  }
}

// Collect patient data from form
function collectPatientData() {
  return {
    name: document.getElementById("patientName").value || "Patient",
    age: document.getElementById("patientAge").value || "",
    biologicalMeasures: {
      creatinine: Number.parseFloat(document.getElementById("creatinine").value) || 0,
      gfr: Number.parseFloat(document.getElementById("gfr").value) || 0,
      albumin: Number.parseFloat(document.getElementById("albumin").value) || 0,
      hemoglobin: Number.parseFloat(document.getElementById("hemoglobin").value) || 0,
      urea: Number.parseFloat(document.getElementById("urea").value) || 0,
      proteinuria: Number.parseFloat(document.getElementById("proteinuria").value) || 0,
    },
    clinicalHistory: {
      diabetes: document.getElementById("diabetes").checked,
      hypertension: document.getElementById("hypertension").checked,
      cardiovascular: document.getElementById("cardiovascular").checked,
      familyHistory: document.getElementById("familyHistory").checked,
      anemie: document.getElementById("anemie").checked,
      oedeme: document.getElementById("oedeme").checked,
    },
  }
}

// Run diagnostic
function runDiagnostic() {
  if (selectedLogics.length === 0) {
    alert("Veuillez sélectionner au moins une logique")
    return
  }

  patientData = collectPatientData()
  const resultsContainer = document.getElementById("resultsContainer")
  resultsContainer.innerHTML = ""

  selectedLogics.forEach((logic) => {
    const result = calculateDiagnostic(logic, patientData)
    diagnosticResults.push(result)
    displayResult(result)
    markLogicCompleted(logic)
  })

  updateComparisonTable()
}

// Calculate diagnostic based on logic type
function calculateDiagnostic(logic, data) {
  switch (logic) {
    case "modal":
      return calculateModalLogic(data)
    case "default":
      return calculateDefaultLogic(data)
    case "fuzzy":
      return calculateFuzzyLogic(data)
    case "dempster":
      return calculateDempsterShaferLogic(data)
    default:
      return null
  }
}

function calculateModalLogic(data) {
  const { name, biologicalMeasures, clinicalHistory } = data

  // Count symptoms
  const symptomsCKD = ["hypertension", "anemie", "oedeme", "fatigue"]
  const symptoms = []
  if (clinicalHistory.hypertension) symptoms.push("Hypertension")
  if (clinicalHistory.anemie) symptoms.push("Anemie")
  if (clinicalHistory.oedeme) symptoms.push("Oedeme")
  // Note: fatigue not in form, but keeping logic flexible

  const symptomsPresent = symptoms.length

  // Count abnormal measures
  let measuresAnormales = 0
  if (biologicalMeasures.creatinine > 1.4) measuresAnormales++
  if (biologicalMeasures.urea > 50) measuresAnormales++
  if (biologicalMeasures.proteinuria > 0) measuresAnormales++

  let result, certitude, severity

  if (measuresAnormales >= 2) {
    result = "□ CKD (Nécessité)"
    certitude = 0.95
    severity = "critical"
  } else if (symptomsPresent >= 2) {
    result = "◇ CKD (Possibilité forte)"
    certitude = 0.7
    severity = "moderate"
  } else if (symptomsPresent >= 1) {
    result = "◇ CKD (Possibilité faible)"
    certitude = 0.45
    severity = "moderate"
  } else {
    result = "○ Aucun CKD détecté"
    certitude = 0.1
    severity = "normal"
  }

  return {
    logic: "Modal Logic",
    patient: name,
    severity: severity,
    content: `Diagnostic modal pour ${name} : ${result}\nCertitude : ${(certitude * 100).toFixed(0)}%`,
    type: "modal",
    certitude: certitude,
  }
}

function calculateDefaultLogic(data) {
  const { name, biologicalMeasures, clinicalHistory } = data

  let defautCKD = false
  const reglesAppliquees = []
  const exceptions = []

  // Règle 1: Hypertension → CKD
  if (clinicalHistory.hypertension) {
    reglesAppliquees.push("R1: Hypertension → CKD")
    defautCKD = true
    if (biologicalMeasures.creatinine <= 1.4 && biologicalMeasures.urea <= 50) {
      exceptions.push("Mesures rénales normales")
      defautCKD = false
    }
  }

  // Règle 2: Anémie → CKD
  if (clinicalHistory.anemie) {
    reglesAppliquees.push("R2: Anémie → CKD")
    defautCKD = true
    if (biologicalMeasures.hemoglobin >= 13) {
      exceptions.push("Hémoglobine normale")
      defautCKD = false
    }
  }

  // Règle 3: Œdème → CKD
  if (clinicalHistory.oedeme) {
    reglesAppliquees.push("R3: Œdème → CKD")
    defautCKD = true
    if (biologicalMeasures.proteinuria === 0) {
      exceptions.push("Protéinurie absente")
      defautCKD = false
    }
  }

  const riskStatus = defautCKD ? "Patient à risque CKD (par défaut)" : "Pas de risque CKD"
  const severity = defautCKD ? "moderate" : "normal"

  let content = `Diagnostic par défaut pour ${name} : ${riskStatus}\n\n`
  content += `Règles appliquées :\n${reglesAppliquees.join("\n") || "Aucune"}\n\n`
  if (exceptions.length > 0) {
    content += `Exceptions détectées :\n${exceptions.join("\n")}`
  }

  return {
    logic: "Logique par Défaut",
    patient: name,
    severity: severity,
    content: content,
    type: "default",
    defaultRisk: riskStatus,
  }
}

function calculateFuzzyLogic(data) {
  const { name, biologicalMeasures } = data

  const creat = biologicalMeasures.creatinine
  const protein = biologicalMeasures.proteinuria

  // Membership functions for Creatinine
  const creatNormale = creat <= 1.2 ? 1 : creat <= 1.4 ? (1.4 - creat) / 0.2 : 0
  const creatLegerement =
    creat <= 1.2 ? 0 : creat <= 1.4 ? (creat - 1.2) / 0.2 : creat <= 1.8 ? 1 : creat <= 2.0 ? (2.0 - creat) / 0.2 : 0
  const creatElevee = creat <= 1.8 ? 0 : creat <= 2.5 ? (creat - 1.8) / 0.7 : creat <= 3.5 ? 1 : (4.0 - creat) / 0.5
  const creatTresElevee = creat <= 3.5 ? 0 : creat <= 4.0 ? (creat - 3.5) / 0.5 : 1

  // Membership functions for Protein
  const proteinNormale = protein <= 0.15 ? 1 : protein <= 0.5 ? (0.5 - protein) / 0.35 : 0
  const proteinAnormale = protein <= 0.15 ? 0 : protein <= 0.5 ? (protein - 0.15) / 0.35 : 1

  // Apply fuzzy rules
  const rules = []

  // R1: Créatinine=Normale ET Protéine=Normale → Risque=Faible
  rules.push({ activation: Math.min(creatNormale, proteinNormale), risk: 15 })

  // R2: Créatinine=Légèrement_élevée ET Protéine=Anormale → Risque=Moyen
  rules.push({ activation: Math.min(creatLegerement, proteinAnormale), risk: 50 })

  // R3: Créatinine=Élevée → Risque=Élevé
  rules.push({ activation: creatElevee, risk: 75 })

  // R4: Créatinine=Élevée ET Protéine=Anormale → Risque=Très_élevé
  rules.push({ activation: Math.min(creatElevee, proteinAnormale), risk: 90 })

  // R5: Créatinine=Très_élevée → Risque=Très_élevé
  rules.push({ activation: creatTresElevee, risk: 95 })

  // R6: Protéine=Anormale ET Créatinine=Normale → Risque=Moyen
  rules.push({ activation: Math.min(proteinAnormale, creatNormale), risk: 45 })

  // R7: Créatinine=Légèrement_élevée ET Protéine=Normale → Risque=Faible
  rules.push({ activation: Math.min(creatLegerement, proteinNormale), risk: 25 })

  // Defuzzification (weighted average)
  let numerator = 0
  let denominator = 0

  rules.forEach((rule) => {
    numerator += rule.activation * rule.risk
    denominator += rule.activation
  })

  const fuzzyRisk = denominator > 0 ? numerator / denominator : 0

  let interpretation, severity
  if (fuzzyRisk > 70) {
    interpretation = "Risque très élevé"
    severity = "critical"
  } else if (fuzzyRisk > 50) {
    interpretation = "Risque élevé"
    severity = "critical"
  } else if (fuzzyRisk > 30) {
    interpretation = "Risque moyen"
    severity = "moderate"
  } else {
    interpretation = "Risque faible"
    severity = "normal"
  }

  return {
    logic: "Logique Floue",
    patient: name,
    severity: severity,
    content: `Degré de risque CKD = ${fuzzyRisk.toFixed(2)}%\nInterprétation : ${interpretation}`,
    type: "fuzzy",
    fuzzyRisk: fuzzyRisk,
    fuzzyLevel: interpretation,
  }
}

function calculateDempsterShaferLogic(data) {
  const { name, biologicalMeasures, clinicalHistory } = data

  // Biology evidence
  let m_CKD_bio, m_nonCKD_bio

  if (biologicalMeasures.creatinine > 3.0 || biologicalMeasures.proteinuria >= 2) {
    m_CKD_bio = 0.7
    m_nonCKD_bio = 0.1
  } else if (biologicalMeasures.creatinine > 1.5 || biologicalMeasures.proteinuria >= 1) {
    m_CKD_bio = 0.5
    m_nonCKD_bio = 0.2
  } else {
    m_CKD_bio = 0.2
    m_nonCKD_bio = 0.6
  }

  const m_uncertainty_bio = 1 - (m_CKD_bio + m_nonCKD_bio)

  const bioEvidence = {
    CKD: m_CKD_bio,
    NOT_CKD: m_nonCKD_bio,
    UNCERTAINTY: m_uncertainty_bio,
  }

  // Symptoms evidence
  const symptomsCount = [clinicalHistory.hypertension, clinicalHistory.oedeme, clinicalHistory.anemie].filter(
    Boolean,
  ).length

  let m_CKD_symp, m_nonCKD_symp

  if (symptomsCount >= 2) {
    m_CKD_symp = 0.6
    m_nonCKD_symp = 0.2
  } else if (symptomsCount === 1) {
    m_CKD_symp = 0.4
    m_nonCKD_symp = 0.3
  } else {
    m_CKD_symp = 0.2
    m_nonCKD_symp = 0.6
  }

  const m_uncertainty_symp = 1 - (m_CKD_symp + m_nonCKD_symp)

  const symptomEvidence = {
    CKD: m_CKD_symp,
    NOT_CKD: m_nonCKD_symp,
    UNCERTAINTY: m_uncertainty_symp,
  }

  // Dempster's combination rule
  const combined = dempsterCombination(bioEvidence, symptomEvidence)

  let interpretation, severity
  if (combined.CKD > 0.6) {
    interpretation = "Forte croyance de CKD"
    severity = "critical"
  } else if (combined.CKD > 0.3) {
    interpretation = "Croyance modérée de CKD"
    severity = "moderate"
  } else {
    interpretation = "Faible croyance de CKD"
    severity = "normal"
  }

  const content = `Source biologie : ${JSON.stringify(bioEvidence, null, 2)}

Source symptômes : ${JSON.stringify(symptomEvidence, null, 2)}

Croyance combinée : ${JSON.stringify(combined, null, 2)}

Interprétation : ${interpretation}`

  return {
    logic: "Dempster-Shafer",
    patient: name,
    severity: severity,
    content: content,
    type: "dempster",
    belief: combined.CKD,
    uncertainty: combined.UNCERTAINTY,
  }
}

// Dempster's combination rule
function dempsterCombination(m1, m2) {
  const K = m1.CKD * m2.NOT_CKD + m1.NOT_CKD * m2.CKD

  return {
    CKD: (m1.CKD * m2.CKD + m1.CKD * m2.UNCERTAINTY + m1.UNCERTAINTY * m2.CKD) / (1 - K),
    NOT_CKD: (m1.NOT_CKD * m2.NOT_CKD + m1.NOT_CKD * m2.UNCERTAINTY + m1.UNCERTAINTY * m2.NOT_CKD) / (1 - K),
    UNCERTAINTY: (m1.UNCERTAINTY * m2.UNCERTAINTY) / (1 - K),
  }
}

// Display result
function displayResult(result) {
  const resultsContainer = document.getElementById("resultsContainer")

  const resultCard = document.createElement("div")
  resultCard.className = `result-card ${result.severity}`

  const badgeText = result.severity === "normal" ? "Normal" : result.severity === "moderate" ? "Modéré" : "Critique"

  resultCard.innerHTML = `
        <div class="result-header">
            <h3 class="result-title">${result.logic}</h3>
            <span class="result-badge ${result.severity}">${badgeText}</span>
        </div>
        <div class="result-content">
            <pre>${result.content}</pre>
        </div>
    `

  resultsContainer.appendChild(resultCard)
}

// Mark logic as completed
function markLogicCompleted(logic) {
  const statusElement = document.querySelector(`[data-status="${logic}"]`)
  if (statusElement) {
    statusElement.classList.add("completed")
  }
}

// Update comparison table
function updateComparisonTable() {
  if (diagnosticResults.length === 0) return

  const comparisonContainer = document.getElementById("comparisonContainer")

  const tableHTML = `
        <div class="comparison-table">
            <h2>Comparaison des Logiques</h2>
            <table>
                <thead>
                    <tr>
                        <th>Patient</th>
                        <th>Logique des défauts</th>
                        <th>Risque flou (%)</th>
                        <th>Niveau flou</th>
                        <th>Croyance CKD</th>
                        <th>Incertitude</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateComparisonRows()}
                </tbody>
            </table>
        </div>
    `

  comparisonContainer.innerHTML = tableHTML
}

// Generate comparison table rows
function generateComparisonRows() {
  // Group results by patient
  const patientGroups = {}

  diagnosticResults.forEach((result) => {
    if (!patientGroups[result.patient]) {
      patientGroups[result.patient] = {
        patient: result.patient,
        default: "-",
        fuzzy: "-",
        fuzzyLevel: "-",
        belief: "-",
        uncertainty: "-",
      }
    }

    if (result.type === "default") {
      patientGroups[result.patient].default = result.defaultRisk || "-"
    }
    if (result.type === "fuzzy") {
      patientGroups[result.patient].fuzzy = result.fuzzyRisk.toFixed(2)
      patientGroups[result.patient].fuzzyLevel = result.fuzzyLevel
    }
    if (result.type === "dempster") {
      patientGroups[result.patient].belief = result.belief.toFixed(2)
      patientGroups[result.patient].uncertainty = result.uncertainty.toFixed(2)
    }
  })

  return Object.values(patientGroups)
    .map(
      (row) => `
        <tr>
            <td>${row.patient}</td>
            <td>${row.default}</td>
            <td>${row.fuzzy}</td>
            <td>${row.fuzzyLevel}</td>
            <td>${row.belief}</td>
            <td>${row.uncertainty}</td>
        </tr>
    `,
    )
    .join("")
}
