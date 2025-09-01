
# OlaClick Backend Challenge - NestJS Edition

This repository is a scaffold implementing the requirements for the OlaClick challenge:
- NestJS (modular)
- Sequelize (with sequelize-cli migrations)
- PostgreSQL
- Redis (cache)
- Docker / docker-compose
- Jest tests scaffolded

## How to run with Docker (recommended)
1. Copy `.env.example` to `.env` and adjust if needed.
2. Run:
```bash
docker-compose up --build
```
This will start the API on port 3000, Postgres and Redis.

## Migrations
The project uses `sequelize-cli`. Inside the container run:
```bash
npx sequelize db:migrate
npx sequelize db:seed:all
```

## Endpoints
- `GET /orders` - list orders (not delivered). Cached 30s.
- `POST /orders` - create new order.
- `POST /orders/:id/advance` - advance order state (initiated → sent → delivered). When delivered, the order is removed.
- `GET /orders/:id` - get order detail.

## 🧪 Preguntas adicionales

### **1. ¿Cómo desacoplarías la lógica de negocio del framework NestJS?**
Para desacoplar la lógica de negocio:  
- Implementar servicios y repositorios basados en **interfaces**, no en NestJS directamente.  
- Mantener la lógica de negocio en clases puras de TypeScript.  
- Seguir una **arquitectura hexagonal (Ports & Adapters)**, donde NestJS actúa como capa de transporte, no como núcleo.  
- Esto permite tests independientes y portabilidad de la lógica a otros entornos.

---

### **2. ¿Cómo escalarías esta API para soportar miles de órdenes concurrentes?**
- **Escalabilidad horizontal**: múltiples instancias con balanceador (Nginx, Kubernetes, AWS ELB).  
- **Optimización de base de datos**: índices en campos críticos (`status`, `createdAt`) y particionamiento si es necesario.  
- **Cache distribuido (Redis)** para reducir la carga en PostgreSQL.  
- **Colas de mensajería** (RabbitMQ, Kafka, SQS) para procesar tareas pesadas de forma asíncrona.  
- **Monitoreo y observabilidad** (Prometheus, Grafana, logs estructurados) para detectar cuellos de botella.

---

### **3. ¿Qué ventajas ofrece Redis en este caso y qué alternativas considerarías?**
**Ventajas de Redis:**  
- Cache en memoria extremadamente rápido.  
- Expiración automática de claves (ideal para resultados temporales).  
- Soporta estructuras de datos avanzadas, pub/sub y rate limiting.  

**Alternativas:**  
- **Memcached**: rápido y simple, aunque menos flexible que Redis.  
- **Optimización de PostgreSQL** con `pgbouncer` y caché interno (menos eficiente para alta concurrencia).  
- **Servicios administrados en la nube**: AWS ElastiCache, GCP Memorystore, Azure Cache for Redis.  

Redis es la mejor opción aquí por **velocidad**, **flexibilidad** y **ecosistema**.

---

## 📬 Colección de Postman

En la carpeta `documents/` se encuentra la colección lista para probar los endpoints de la API:  


