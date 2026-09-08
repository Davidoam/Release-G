# Copilot Usage

This document explains how Copilot was used as an assistant, not as the owner of the implementation.

| Problema | Que pedi a Copilot | Que acepte/modifique |
| --- | --- | --- |
| Test | Generar edge cases para decisiones DEPLOY, BLOCK y REVIEW | Acepte los casos principales y adapte los asserts a `node:test` |
| Health endpoint | Revisar como probar `/health` sin arrancar el servidor en puerto fijo | Exporte `app` desde `server.js` y use `app.listen(0)` en tests |
| Release history | Sugerir una forma simple de guardar evaluaciones | Implemente persistencia manual con SQLite en `src/database/db.js` |
| Docker | Revisar por que el contenedor no arrancaba en puerto 3000 | Cambie el entrypoint a `src/server.js` y use Node 20 Alpine |
| SQLite en Docker | Comprobar como incluir SQLite dentro de la imagen | Anadi `apk add --no-cache sqlite` al Dockerfile |
| ConfigMap | Separar configuracion no sensible de valores hardcodeados | Movi `APP_NAME`, `NODE_ENV`, `PORT`, `RISK_THRESHOLD` y `DB_PATH` a `configmap.yaml` |
| Secret | Crear una secret simulada para `API_KEY` | Use `stringData` para mantener el ejemplo legible |
| PVC | Conectar `/app/data` a almacenamiento persistente | Monte el PVC en `/app/data` y apunte `DB_PATH` a `/app/data/runtime.db` |
| YAML | Explicar `livenessProbe` y `readinessProbe` | Implemente ambas probes manualmente usando `/health` y `/ready` |
| Kubernetes validation | Revisar el error de OpenAPI al aplicar manifests | Identifique que era problema de Minikube/API server, no del YAML |

## Notes

Copilot was treated as a reviewer and brainstorming assistant. The final code, Kubernetes manifests, Dockerfile changes, and tests were reviewed and adjusted manually before being accepted.
