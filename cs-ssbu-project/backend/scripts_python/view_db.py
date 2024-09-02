import sqlite3
import os

# Ruta a tu archivo de base de datos (.db)
DATABASE_PATH = 'C:/Users/linkm/OneDrive/Documentos/Proyectos/Analisis de Datos/Analitica-Datos-Proyecto/cs-ssbu-project/backend/db/CSDB.db'

def view_database():
    print(f"Database path: {DATABASE_PATH}")

    # Verifica si el archivo de base de datos existe
    if not os.path.exists(DATABASE_PATH):
        print("Error: La base de datos no se encuentra en la ruta especificada.")
        return

    try:
        # Conectar a la base de datos
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        # Ejecutar una consulta para obtener todas las tablas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("La base de datos no contiene tablas. Verifica el archivo de base de datos.")
        else:
            print("Tables:", tables)

            # Mostrar el contenido de cada tabla
            for table in tables:
                table_name = table[0]
                print(f"\nContents of table {table_name}:")
                cursor.execute(f"SELECT * FROM {table_name};")
                rows = cursor.fetchall()
                for row in rows:
                    print(row)

        # Cerrar la conexión
        conn.close()
    
    except sqlite3.Error as e:
        print(f"SQLite error: {e}")

if __name__ == "__main__":
    view_database()
