# CKD-Diagnostic-System
Un système intelligent de diagnostic de la Chronic Kidney Disease basé sur l’analyse des mesures biologiques du patient ainsi que de son historique médical. Le système utilise des techniques de logique non classique (comme la logique floue) afin de gérer l’incertitude présente dans les données médicales et d’aider à améliorer la précision du diagnostic précoce tout en assistant les professionnels de santé dans la prise de décision.
# CKD-Diagnostic-System

## Overview

CKD-Diagnostic-System is an intelligent diagnostic system designed to assist in the early detection of **Chronic Kidney Disease (CKD)**. The system analyzes patients’ biological measurements and medical history to predict the presence or risk level of CKD.

To handle the uncertainty that often exists in medical data, the system uses **non-classical logic techniques**, particularly **fuzzy logic**. This approach improves diagnostic accuracy and supports healthcare professionals in clinical decision-making.

---

## Objectives

* Assist in the **early diagnosis of Chronic Kidney Disease**.
* Handle **uncertainty and imprecision** in medical data using fuzzy logic.
* Provide **decision support** for healthcare professionals.
* Improve the **accuracy of CKD prediction** using intelligent methods.

---

## Features

* Analysis of **patient biological measurements**
* Integration of **medical history**
* Use of **fuzzy logic for uncertainty management**
* **Prediction of CKD risk level**
* User-friendly diagnostic output

---

## Dataset

The system uses medical data related to kidney function. Typical features may include:

* Age
* Blood Pressure
* Blood Glucose
* Serum Creatinine
* Blood Urea
* Hemoglobin
* Albumin
* Specific Gravity
* Medical history indicators

A commonly used dataset for CKD research:

* **Chronic Kidney Disease Dataset (UCI Machine Learning Repository)**

---

## Technologies Used

* **Python**
* **NumPy**
* **Pandas**
* **Scikit-learn**
* **Scikit-fuzzy**
* **Matplotlib**
* **Jupyter Notebook / Kaggle**

---

## System Architecture

1. **Data Collection**
2. **Data Preprocessing**

   * Handling missing values
   * Normalization
3. **Feature Analysis**
4. **Fuzzy Logic Model**
5. **Prediction Module**
6. **Diagnostic Output**

---

## Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/CKD-Diagnostic-System.git
```

2. Navigate to the project directory

```bash
cd CKD-Diagnostic-System
```

3. Install required libraries

```bash
pip install numpy pandas scikit-learn scikit-fuzzy matplotlib
```

---

## Usage

Run the main script:

```bash
python main.py
```

The system will:

1. Load the patient dataset
2. Apply preprocessing
3. Run the fuzzy inference system
4. Predict the CKD diagnostic result

---

## Example Output

```
Patient Risk Level: High
Recommendation: Further clinical examination required
```

---

## Project Structure

```
CKD-Diagnostic-System
│
├── data
│   └── ckd_dataset.csv
│
├── notebooks
│   └── analysis.ipynb
│
├── src
│   ├── preprocessing.py
│   ├── fuzzy_model.py
│   └── prediction.py
│
├── main.py
├── requirements.txt
└── README.md
```

---

## Applications

* Clinical decision support
* Early CKD screening systems
* Medical research and AI in healthcare

---

## Future Improvements

* Integration with hospital information systems
* Deep learning models for improved accuracy
* Web interface for doctors
* Real-time patient monitoring

---

## License

This project is intended for **research and educational purposes**.

---

## Author

Developed as part of a research project on intelligent medical diagnostic systems using fuzzy logic.
