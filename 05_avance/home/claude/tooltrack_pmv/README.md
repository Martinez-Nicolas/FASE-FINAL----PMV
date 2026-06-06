# ToolTrack PMV — Prototipo Mínimo Viable
**Grupo 5** · Nicolás Martínez Cáceres · Martín Sanhueza Fernández  
Desarrollo de Aplicaciones Empresariales · UCT · 2026

---

## Requisitos
- Node.js v18+
- Cuenta Supabase con el schema aplicado

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# El archivo .env ya viene configurado con las credenciales del proyecto

# 3. Aplicar el schema en Supabase
# Ir a Supabase → SQL Editor → pegar contenido de supabase_schema.sql → Run

# 4. Correr la aplicación
npm run dev
```

Abrir en: `http://localhost:5173`

## Flujo principal

1. **Login** → seleccionar rol y usuario
2. **Operario** → Nueva solicitud → completa formulario
3. **Supervisor** → Aprobar solicitud
4. **Bodeguero** → Confirmar entrega
5. **Operario** → Devolver herramienta (conforme o con daños)
6. **Mantención** → Emitir veredicto (Reparar / Desgaste / Dado de Baja)

## Tecnologías
- React 18 + Vite
- Tailwind CSS
- Supabase (PostgreSQL + API REST)
