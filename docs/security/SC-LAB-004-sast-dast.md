# SC-LAB-004: Análisis de Seguridad Estático y Dinámico (SAST + DAST)
**Proyecto:** SecureCampus  
**Fecha:** 14 de octubre de 2026  

---

## 1. Propósito y Entorno
El objetivo de esta práctica es realizar un análisis integral de seguridad utilizando técnicas estáticas (SAST con Semgrep) y dinámicas (DAST con OWASP ZAP) sobre el repositorio de SecureCampus, documentando hallazgos, aplicando correcciones y registrando trazabilidad técnica.

* **Sistema Operativo:** Windows con PowerShell y Docker Desktop
* **Herramienta SAST:** Semgrep Community en contenedor Docker
* **Herramienta DAST:** OWASP ZAP (Baseline Scan y Full Active Scan) en contenedor Docker
* **Objetivo DAST:** `http://host.docker.internal:8080`

---

## 2. Parte A · Análisis Estático (SAST) con Semgrep

### 2.1 Análisis Humano Previo
* **Datos controlados por usuario:** Peticiones HTTP dirigidas a las rutas API y formularios del backend.
* **Destino de los datos:** Controladores, modelos y capas de base de datos en Laravel.
* **Riesgos observados:** Ejecución de contenedores con permisos administrativos (`root`), almacenamiento hardcodeado de secretos en código o archivos de configuración.
* **Control propuesto:** Definir un usuario sin privilegios en el Dockerfile (`USER www-data`) y parametrizar claves en variables de entorno.

### 2.2 Registro de Hallazgos SAST
* **Comando ejecutado:** `docker run --rm -v "${PWD}:/src" semgrep/semgrep semgrep scan --config auto /src/backend`
* **Resultados:** 94 reglas evaluadas, 73 archivos analizados, 3 hallazgos detectados.

| Evidencia SAST | Registro |
| :--- | :--- |
| **Regla / Hallazgo 1** | `dockerfile.security.missing-user-entrypoint` |
| **Archivo / Línea 1** | `backend/Dockerfile`: Línea 38 |
| **Regla / Hallazgo 2** | `dockerfile.security.missing-user` |
| **Archivo / Línea 2** | `backend/Dockerfile`: Línea 39 |
| **Regla / Hallazgo 3** | `generic.secrets.security.detected-telegram-bot-api-key` |
| **Archivo / Línea 3** | `backend/phpunit.xml`: Línea 19 |
| **¿Qué evidencia aporta?** | Detección estática de ejecuciones como root en contenedores y presencia de secretos expuestos en archivos del proyecto. |
| **¿Coincide con el análisis humano?** | Sí, confirma vulnerabilidades de configuración antes de la ejecución del sistema. |

---

## 3. Parte B · Análisis Dinámico (DAST) con OWASP ZAP

### 3.1 Baseline Scan (Análisis Pasivo)
* **Comando:** `docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host.docker.internal:8080`

| Hallazgo Baseline | ¿Qué observa? | ¿Requiere análisis? |
| :--- | :--- | :--- |
| **Missing Anti-clickjacking Header** | Ausencia de cabecera `X-Frame-Options` en las respuestas HTTP | Sí |
| **X-Content-Type-Options Header Missing** | Falta de la cabecera `nosniff` para mitigar el MIME sniffing | Sí |
| **CSP Header Not Set** | Ausencia de Content Security Policy (`Content-Security-Policy`) | Sí |

### 3.2 Active Scan (Análisis Activo)
* **Comando:** `docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py -t http://host.docker.internal:8080`
* **Observación:** Se ejecutó el escaneo activo completo sobre las rutas expuestas por Nginx en el puerto 8080 para identificar fallos dinámicos en la aplicación durante su ejecución real.

---

## 4. Comparación SAST vs DAST

| Criterio | SAST | DAST |
| :--- | :--- | :--- |
| **Objeto** | Código fuente y configuraciones estáticas | Aplicación desplegada en vivo |
| **Necesita ejecutar app** | No | Sí |
| **Perspectiva** | Caja Blanca (Interna) | Caja Negra (Externa) |
| **Evidencia del lab** | Contenedor como root y secretos en `phpunit.xml` | Cabeceras HTTP de seguridad faltantes en Nginx |
| **Fortaleza** | Señala el archivo y la línea exacta del problema | Analiza el comportamiento real en tiempo de ejecución |
| **Límite** | No evalúa errores de runtime ni servidor web | No analiza el código fuente ni rutas no exploradas |

---

## 5. Reflexión Final

1. **¿Por qué 0 findings en SAST no equivale a aplicación segura?**  
   Porque SAST solo evalúa el código contra las reglas de su base de datos estática; no detecta errores de lógica de negocio, problemas de infraestructura en runtime ni vulnerabilidades no parametrizadas en sus reglas.

2. **¿Por qué un WARN de ZAP debe validarse antes de declararlo vulnerabilidad?**  
   Porque DAST analiza las respuestas externas sin conocer el contexto interno del sistema, lo que puede generar falsos positivos dependiendo de la arquitectura o la capa de seguridad en que se encuentre desplegada la app.

3. **¿Qué diferencia observaste entre baseline y active scan?**  
   Baseline realiza una inspección pasiva sin modificar ni bombardear la aplicación con tráfico malicioso, mientras que Active Scan envía payloads activos para intentar explotar vulnerabilidades en tiempo de ejecución.

4. **¿Por qué 200 OK no descarta una vulnerabilidad?**  
   Porque una aplicación puede procesar y reflejar un payload malicioso (como en un ataque XSS) devolviendo un código de estado `200 OK` en lugar de bloquear la petición con un error.

5. **¿Qué aprendiste del hecho de tener que reiniciar/replegar la app antes del retest?**  
   Que las pruebas DAST se realizan sobre la instancia activa en memoria; si se modifica el código o la configuración pero no se reinicia el servicio/contenedor, los cambios no se aplicarán en el análisis.

6. **¿Qué problema de autorización podría seguir existiendo aunque SAST y DAST no lo reporten?**  
   Fallas de Control de Acceso Afectado a Nivel de Objeto (BOLA/IDOR) o inconsistencias en la lógica de permisos de usuario, ya que las herramientas automatizadas no entienden las reglas de negocio específicas del dominio.