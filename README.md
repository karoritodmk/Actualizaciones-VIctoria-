APPM 

Si hay errores en tsconfig.json , la alternativa es volver a ejecutar npm installl o 

Presiona Ctrl + Shift + P (o Cmd + Shift + P en Mac).

Escribe "TypeScript: Restart TS server" (Reiniciar servidor TS) y selecciónalo.

Alternativamente, cierra y vuelve a abrir VS Code.




```bash
cd backend
python -m venv venv
source venv/bin/activate      # En Windows: venv\Scripts\activate
pip install -r requirements.txt

python seed_roles.py ** para la creacion de usuarios 

cp .env.example .env

python -c "import secrets; print(secrets.token_hex(32))" ** en este caso es para la secret key 
uvicorn main:app --reload

# Opción B: crear el esquema de una vez con el script SQL (ver sección 4)
# y luego arrancar la API igual.

# En cualquiera de las dos opciones, para crear los 3 roles + el primer
# coordinador (una sola vez):
python seed_roles.py
```

