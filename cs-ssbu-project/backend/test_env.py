import os
from dotenv import load_dotenv

load_dotenv()  # Carga las variables de entorno desde el archivo .env

print('TEST_VAR:', os.getenv('TEST_VAR'))
