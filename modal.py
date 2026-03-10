class Patient:
    def __init__(self, nom, symptomes, mesures):
        self.nom = nom
        self.symptomes = symptomes
        self.mesures = mesures

def diagnostic_modal(patient):
    symptomes_ckd = ["Hypertension", "Anemie", "Oedeme"]
    symptomes_present = [s for s in patient.symptomes if s in symptomes_ckd]

    mesures_anormales = 0
    if patient.mesures.get("Creatinine", 0) > 1.4:
        mesures_anormales += 1
    if patient.mesures.get("Uree", 0) > 50:
        mesures_anormales += 1
    if patient.mesures.get("ProteineUrinaire", "absent") != "absent":
        mesures_anormales += 1

    if len(symptomes_present) >= 1:
        possible_ckd = True
    else:
        possible_ckd = False

    if mesures_anormales >= 2:
        necessaire_ckd = True
    else:
        necessaire_ckd = False

    if necessaire_ckd:
        niveau = "□ CKD (diagnostic nécessaire / confirmé)"
    elif possible_ckd:
        niveau = "◇ CKD (diagnostic possible)"
    else:
        niveau = "Pas de CKD détecté"

    return niveau

# Interface interactive


print("=== Système d'aide au diagnostic CKD (modal) ===")

nom = input("Nom du patient : ")

# Saisie des symptômes
print("Saisir les symptômes du patient (séparés par des virgules). Exemples : Hypertension, Anemie, Oedeme")
symptomes_input = input("Symptômes : ")
symptomes = [s.strip() for s in symptomes_input.split(",")]

# Saisie des mesures biologiques
print("Saisir les valeurs biologiques :")
creatinine = float(input("Créatinine (mg/dL) : "))
uree = float(input("Urée (mg/dL) : "))
proteine = input("Protéine urinaire (absent/present) : ").strip().lower()

mesures = {
    "Creatinine": creatinine,
    "Uree": uree,
    "ProteineUrinaire": proteine
}

# Création du patient et diagnostic
nouveau_patient = Patient(nom, symptomes, mesures)
resultat = diagnostic_modal(nouveau_patient)

print(f"\nDiagnostic modal pour {nom} : {resultat}")
