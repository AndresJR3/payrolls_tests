# Sistema de Nóminas API

Una aplicación web completa para la gestión de nóminas empresariales con autenticación JWT, CRUD completo y interfaz moderna.

## 🚀 Características

- **Autenticación segura** con JWT y bcrypt
- **CRUD completo** para gestión de nóminas
- **API RESTful** bien estructurada
- **Frontend moderno** y responsive
- **Estadísticas** y análisis de datos
- **Paginación** de resultados
- **Validaciones** robustas
- **Pruebas automatizadas**
- **Dockerizado** para fácil despliegue

## 🏗️ Arquitectura

```
nominas/
├── src/                          # Backend
│   ├── config/                   # Configuraciones
│   │   └── database.js          # Conexión a BD
│   ├── controllers/             # Lógica de negocio
│   │   ├── authController.js    # Autenticación
│   │   └── payrollController.js # Nóminas
│   ├── middleware/              # Middlewares
│   │   ├── auth.js             # Autenticación JWT
│   │   └── errorHandler.js     # Manejo de errores
│   ├── routes/                  # Definición de rutas
│   │   ├── authRoutes.js       # Rutas de auth
│   │   └── payrollRoutes.js    # Rutas de nóminas
│   ├── __tests__/              # Pruebas
│   │   └── api.test.js         # Tests de la API
│   └── index.js                # Servidor principal
├── frontend/                    # Frontend
│   ├── index.html              # Interfaz principal
│   └── app.js                  # Lógica del cliente
├── docker-compose.yml          # Configuración Docker
├── package.json                # Dependencias
└── README.md                   # Documentación
```

## 🛠️ Instalación y Configuración

### Requisitos Previos

- Node.js >= 14.x
- Docker y Docker Compose
- Git

### Instalación Rápida con Docker

1. **Clonar el repositorio:**
   ```bash
   git clone <tu-repositorio>
   cd nominas
   ```

2. **Configurar variables de entorno:**
   ```bash
   # Crear archivo .env en la raíz del proyecto
   cat > .env << EOF
   DB_URL=postgresql://postgres:Admin76995@db:5432/payrolldb
   JWT_SECRET=ADMIN76995
   NODE_ENV=development
   PORT=5000
   EOF
   ```

3. **Ejecutar con Docker:**
   ```bash
   docker-compose up --build
   ```

4. **Acceder a la aplicación:**
   - Frontend: http://localhost:5000
   - API: http://localhost:5000/api

### Instalación Manual

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar PostgreSQL:**
   - Instalar PostgreSQL
   - Crear base de datos `payrolldb`
   - Ajustar variables de entorno en `.env`

3. **Ejecutar la aplicación:**
   ```bash
   npm start
   ```

## 📚 API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/profile` | Obtener perfil | Sí |

### Nóminas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/payrolls` | Listar nóminas | Sí |
| GET | `/api/payrolls/stats` | Estadísticas | Sí |
| GET | `/api/payrolls/:id` | Obtener nómina | Sí |
| POST | `/api/payrolls` | Crear nómina | Sí |
| PUT | `/api/payrolls/:id` | Actualizar nómina | Sí |
| DELETE | `/api/payrolls/:id` | Eliminar nómina | Sí |

## 📖 Uso de la API

### Registro de Usuario

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "mipassword"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "mipassword"
  }'
```

### Crear Nómina

```bash
curl -X POST http://localhost:5000/api/payrolls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-jwt-token" \
  -d '{
    "employee_name": "Juan Pérez",
    "salary": 15000.50,
    "pay_date": "2024-01-15"
  }'
```

### Listar Nóminas con Paginación

```bash
curl -X GET "http://localhost:5000/api/payrolls?page=1&limit=10" \
  -H "Authorization: Bearer tu-jwt-token"
```

## 🧪 Pruebas

Ejecutar todas las pruebas:

```bash
npm test
```

Ejecutar pruebas en modo watch:

```bash
npm run test:watch
```

Las pruebas incluyen:
- Autenticación (registro, login, validaciones)
- CRUD de nóminas
- Validaciones de datos
- Seguridad (tokens, permisos)
- Manejo de errores

## 🎨 Frontend

El frontend incluye:

- **Interfaz moderna** con CSS3 y animaciones
- **Responsive design** para móviles y desktop
- **Validaciones en tiempo real**
- **Manejo de estados** (loading, errores, éxito)
- **Paginación** de resultados
- **Modales** para crear/editar
- **Estadísticas visuales**

### Funcionalidades:

1. **Autenticación:** Login y registro con validación
2. **Dashboard:** Estadísticas y resumen
3. **Gestión de nóminas:** CRUD completo
4. **Paginación:** Navegación por páginas
5. **Responsive:** Adaptable a cualquier dispositivo

## 🔒 Seguridad

- **JWT tokens** para autenticación
- **Bcrypt** para hash de passwords
- **Validación** de entrada en cliente y servidor
- **Sanitización** de datos
- **Manejo seguro** de errores
- **Headers de seguridad**

## 🐳 Docker

El proyecto incluye configuración Docker completa:

- **Multi-container:** PostgreSQL + Node.js
- **Volúmenes persistentes** para datos
- **Variables de entorno** configurables
- **Red interna** para comunicación segura

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
# Base de datos
DB_URL=postgresql://usuario:password@host:puerto/database

# JWT
JWT_SECRET=tu-secreto-super-seguro

# Servidor
NODE_ENV=development|production
PORT=5000

# Opcional: Configuraciones adicionales
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

### Configuración de Producción

Para producción, asegúrate de:

1. Usar un JWT_SECRET fuerte y único
2. Configurar HTTPS
3. Usar variables de entorno seguras
4. Configurar logs apropiados
5. Implementar rate limiting
6. Usar un proxy reverso (nginx)

## 🤝 Contribuciones

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia ISC.

## 🆘 Soporte

Si tienes problemas:

1. Revisa la documentación
2. Verifica los logs: `docker-compose logs`
3. Asegúrate de que PostgreSQL esté corriendo
4. Verifica las variables de entorno

## 🚀 Próximas Funcionalidades

- [ ] Exportar nóminas a PDF/Excel
- [ ] Notificaciones por email
- [ ] Roles y permisos
- [ ] Historial de cambios
- [ ] Dashboard con gráficos
- [ ] API de terceros (bancos)
- [ ] Backups automatizados
- [ ] Multi-empresa

## 📊 Estado del Proyecto

- ✅ API REST completa
- ✅ Frontend funcional
- ✅ Autenticación JWT
- ✅ CRUD de nóminas
- ✅ Pruebas automatizadas
- ✅ Docker configurado
- ✅ Documentación completa