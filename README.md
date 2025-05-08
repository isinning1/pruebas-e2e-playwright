# 🎭 Pruebas E2E con Playwright

Este repositorio contiene pruebas **End-to-End (E2E)** automatizadas con [Playwright](https://playwright.dev/) para validar la funcionalidad del sistema en sus versiones **web (Angular)** y **móvil (Ionic)**.

---

## 📦 Requisitos

- Node.js v18 o superior
- npm
- Tener clonado y levantado localmente:
  - [Repositorio Web Angular](https://github.com/Mayistikar/Proyecto-Final-FE-Web)
  - [Repositorio Móvil Ionic](https://github.com/Mayistikar/proyecto-final-fe-app)

---

## 🚀 Instalación

1. Clona este repositorio:

```bash
git clone https://github.com/isinning1/pruebas-e2e-playwright.git
cd pruebas-e2e-playwright
npm install
```

2. Asegúrate de tener los otros dos repositorios corriendo en paralelo:
## Web (Angular)
```bash
cd Proyecto-Final-FE-Web
npm install
npm run start o ng serve 
```
## Movil Ionic
```bash
cd proyecto-final-fe-app
npm install
ng run app:serve --host=localhost --port=8100
```

# Ejecución de Pruebas 
Con los servidores levantados, desde la raíz de este repositorio:
```bash
npx playwright test
```

# Ver reporte de resultados
Después de ejecutar las pruebas:
```bash
npx playwright show-report
```

# CI/CD con GitHub Actions
Este repositorio incluye un flujo de trabajo en .github/workflows/playwright.yml que:

Ejecuta las pruebas automáticamente al hacer push o pull request

Corre contra el entorno desplegado (https://main.d2sk28qnzn31cz.amplifyapp.com)

Sube el reporte de pruebas como artefacto

```
Puedes ver los reportes en la pestaña Actions > Workflow run > Artifacts.
```