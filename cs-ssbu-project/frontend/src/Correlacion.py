import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Datos en formato de lista de diccionarios
data = [
    {"Team": "0TD", "Player": "SMX199", "Placement": 1},
    {"Team": "RT/SMB", "Player": "BetaMan", "Placement": 2},
    {"Team": "BTT/CS", "Player": "JoJo", "Placement": 3},
    {"Team": "CS", "Player": "SteLaR", "Placement": 4},
    {"Team": "", "Player": "Take", "Placement": 5},
    {"Team": "", "Player": "*Dejbone*", "Placement": 5},
    {"Team": "CS/VTG", "Player": "Anticris", "Placement": 7},
    {"Team": "VGC", "Player": "Sato", "Placement": 7},
    {"Team": "", "Player": "Detectivo", "Placement": 9},
    {"Team": "", "Player": "Core", "Placement": 9},
    {"Team": "CS", "Player": "Alpuq", "Placement": 9},
    {"Team": "", "Player": "F", "Placement": 9},
    {"Team": "CA/RT", "Player": "Holy", "Placement": 13},
    {"Team": "CS", "Player": "Draknite", "Placement": 13},
    {"Team": "VGC", "Player": "Okami", "Placement": 13},
    {"Team": "CZA", "Player": "Crizua", "Placement": 13},
    {"Team": "VGC", "Player": "MegajuanxHD", "Placement": 17},
    {"Team": "CA", "Player": "eSpartanCol", "Placement": 17},
]

# Crear DataFrame
df = pd.DataFrame(data)

print("DataFrame:")
print(df)

# Calcular la matriz de correlación
correlation_matrix = df[['Placement']].corr()

print("\nMatriz de Correlación:")
print(correlation_matrix)

# Visualizar la matriz de correlación
plt.figure(figsize=(5, 4))
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', cbar=True)
plt.title('Matriz de Correlación de Placement')
plt.show()
