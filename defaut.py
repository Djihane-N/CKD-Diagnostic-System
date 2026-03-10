class Patient:
    def __init__(self, nom, symptomes, mesures):
        self.nom = nom
        self.symptomes = symptomes
        self.mesures = mesures

def raisonnement_defaut(patient):
    
    defaut_ckd = False
    exceptions = []

    # Règles par défaut
    if "Hypertension" in patient.symptomes:
        defaut_ckd = True
        if patient.mesures.get("Creatinine", 0) <= 1.4 and patient.mesures.get("Uree", 0) <= 50:
            exceptions.append("Hypertension contredite par mesures normales")
            defaut_ckd = False

    if "Anemie" in patient.symptomes:
        defaut_ckd = True
        if patient.mesures.get("Hémoglobine", 13) >= 13:
            exceptions.append("Anémie contredite par hémoglobine normale")
            defaut_ckd = False

    if "Oedeme" in patient.symptomes:
        defaut_ckd = True
        if patient.mesures.get("ProteineUrinaire", "absent") == "absent":
            exceptions.append("Œdème contredit par protéine urinaire absente")
            defaut_ckd = False

    # Résultat final
    if defaut_ckd:
        resultat = "Patient à risque CKD (par défaut)"
    else:
        resultat = "Pas de risque CKD confirmé"

    return resultat, exceptions


# Fonction pour ajouter un patient à la main


def saisir_patient():
    nom = input("Entrez le nom du patient : ")

    # Saisie des symptômes
    symptomes = []
    print("Entrez les symptômes du patient (tapez 'stop' pour terminer) : ")
    while True:
        symptome = input("- Symptome: ")
        if symptome.lower() == "stop":
            break
        symptomes.append(symptome)

    # Saisie des mesures
    mesures = {}
    print("Entrez les mesures du patient (tapez 'stop' pour terminer) : ")
    while True:
        mesure = input("- Nom de la mesure: ")
        if mesure.lower() == "stop":
            break
        valeur = input(f"  Valeur de {mesure}: ")
        # Conversion en float si possible
        try:
            valeur = float(valeur)
        except ValueError:
            pass
        mesures[mesure] = valeur

    return Patient(nom, symptomes, mesures)


# Programme principal


if __name__ == "__main__":
    while True:
        patient = saisir_patient()
        resultat, exceptions = raisonnement_defaut(patient)

        print(f"\nDiagnostic par défaut pour {patient.nom} : {resultat}")
        if exceptions:
            print("Exceptions détectées :")
            for e in exceptions:
                print("-", e)

        continuer = input("\nVoulez-vous ajouter un autre patient ? (oui/non) : ")
        if continuer.lower() != "oui":
            break
