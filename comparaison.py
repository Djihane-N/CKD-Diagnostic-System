import pandas as pd

#  Logique des défauts 
def logique_defaut(symptomes, creat, prot, hemo):
    risque = False

    if "Hypertension" in symptomes:
        risque = True
        if creat <= 1.4:
            risque = False

    if "Anemie" in symptomes:
        risque = True
        if hemo >= 13:
            risque = False

    if "Oedeme" in symptomes:
        risque = True
        if prot == 0:
            risque = False

    return "Risque CKD" if risque else "Pas de risque CKD"


#  Logique floue 
def fuzzy_risk(creat, prot):
    if creat > 3 and prot > 2:
        return 80
    elif creat > 1.5 and prot > 1:
        return 55
    else:
        return 25

def fuzzy_label(value):
    if value < 40:
        return "Faible"
    elif value < 70:
        return "Moyen"
    else:
        return "Fort"


#  Théorie des fonctions de croyance 
def belief_ckd(creat, prot, symptomes):
    belief = 0.0

    # Source biologique
    if creat > 2.5:
        belief += 0.4
    if prot > 2:
        belief += 0.3

    # Source clinique
    if "Hypertension" in symptomes:
        belief += 0.2
    if "Anemie" in symptomes:
        belief += 0.1

    belief = min(belief, 1.0)
    uncertainty = 1 - belief

    return belief, uncertainty



# Saisie interactive des patients

def saisir_patient():
    nom = input("\nNom du patient : ")

    print("Entrez les symptômes (stop pour terminer) :")
    symptomes = []
    while True:
        s = input("- Symptôme : ")
        if s.lower() == "stop":
            break
        symptomes.append(s)

    creat = float(input("Taux de créatinine : "))
    prot = float(input("Taux de protéine urinaire : "))
    hemo = float(input("Taux d’hémoglobine : "))

    return {
        "Patient": nom,
        "symptomes": symptomes,
        "Creatinine": creat,
        "ProteineUrinaire": prot,
        "Hemoglobine": hemo
    }



# Programme principal : comparaison

patients = []

print("=== SAISIE DES PATIENTS ===")
while True:
    patient = saisir_patient()
    patients.append(patient)

    cont = input("\nAjouter un autre patient ? (oui/non) : ")
    if cont.lower() != "oui":
        break



# Application des trois raisonnements

results = []

for p in patients:
    defaut_res = logique_defaut(
        p["symptomes"],
        p["Creatinine"],
        p["ProteineUrinaire"],
        p["Hemoglobine"]
    )

    fuzzy_val = fuzzy_risk(p["Creatinine"], p["ProteineUrinaire"])
    fuzzy_res = fuzzy_label(fuzzy_val)

    belief, uncertainty = belief_ckd(
        p["Creatinine"],
        p["ProteineUrinaire"],
        p["symptomes"]
    )

    results.append({
        "Patient": p["Patient"],
        "Logique des défauts": defaut_res,
        "Risque flou (%)": fuzzy_val,
        "Niveau flou": fuzzy_res,
        "Croyance CKD": round(belief, 2),
        "Incertitude": round(uncertainty, 2)
    })



#  Tableau comparatif final

df_comparison = pd.DataFrame(results)

print("\n===== COMPARAISON DES APPROCHES =====")
display(df_comparison)


#  Comparaison entre patients 

df_sorted = df_comparison.sort_values(
    by=["Croyance CKD", "Risque flou (%)"],
    ascending=False
)

print("\nCLASSEMENT DES PATIENTS PAR RISQUE")
display(df_sorted)
