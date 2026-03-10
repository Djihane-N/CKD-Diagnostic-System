class Patient:
    def __init__(self, nom, symptomes, mesures):
        self.nom = nom
        self.symptomes = symptomes
        self.mesures = mesures




#  Logique floue 


# Fonctions d’appartenance
def trapmf(x, a, b, c, d):
    return max(min((x-a)/(b-a) if b!=a else 1,
                   1,
                   (d-x)/(d-c) if d!=c else 1), 0)

def trimf(x, a, b, c):
    return max(min((x-a)/(b-a) if b!=a else 1,
                   (c-x)/(c-b) if c!=b else 1), 0)

# Créatinine
def creatinine_faible(x):
    return trapmf(x, 0.4, 0.4, 1.0, 1.5)

def creatinine_moyenne(x):
    return trimf(x, 1.2, 2.0, 3.0)

def creatinine_elevee(x):
    return trapmf(x, 2.5, 3.5, 6.0, 6.0)

# Protéines urinaires
def proteines_normales(x):
    return trapmf(x, 0, 0, 0, 1)

def proteines_anormales(x):
    return trapmf(x, 1, 2, 5, 5)

# Raisonnement flou
def raisonnement_flou(patient):
    sc = patient.mesures.get("Creatinine", 1.0)
    prot = patient.mesures.get("ProteineUrinaire", 0)

    sc_f = creatinine_faible(sc)
    sc_m = creatinine_moyenne(sc)
    sc_e = creatinine_elevee(sc)

    p_n = proteines_normales(prot)
    p_a = proteines_anormales(prot)

    # Règles floues
    r_faible = min(sc_f, p_n)
    r_moyen = min(sc_m, p_a)
    r_fort = min(sc_e, p_a)

    # Défuzzification
    risque = (
        r_faible * 20 +
        r_moyen * 50 +
        r_fort * 80
    ) / (r_faible + r_moyen + r_fort + 1e-6)

    return risque


def interpreter_risque(valeur):
    if valeur < 40:
        return "Risque faible"
    elif valeur < 70:
        return "Risque moyen"
    else:
        return "Risque fort"



# Saisie patient

def saisir_patient():
    nom = input("Nom du patient : ")

    symptomes = []
    print("Entrez les symptômes (stop pour finir) :")
    while True:
        s = input("- Symptôme : ")
        if s.lower() == "stop":
            break
        symptomes.append(s)

    mesures = {}
    print("Entrez les mesures (stop pour finir) :")
    while True:
        m = input("- Mesure : ")
        if m.lower() == "stop":
            break
        v = float(input(f"  Valeur de {m} : "))
        mesures[m] = v

    return Patient(nom, symptomes, mesures)



# Programme principal

if __name__ == "__main__":
    while True:
        patient = saisir_patient()

        
        resultat_defaut, exceptions = raisonnement_defaut(patient)

       
        risque_flou = raisonnement_flou(patient)
        interpretation = interpreter_risque(risque_flou)

        print("\n===== RÉSULTATS =====")
        print("Logique des défauts :", resultat_defaut)
        if exceptions:
            print("Exceptions :")
            for e in exceptions:
                print("-", e)

        print("\nLogique floue :")
        print(f"Degré de risque CKD = {risque_flou:.2f}")
        print("Interprétation :", interpretation)

        cont = input("\nAjouter un autre patient ? (oui/non) : ")
        if cont.lower() != "oui":
            break
