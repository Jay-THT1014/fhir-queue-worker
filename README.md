# FHIR Queue Worker

A Node.js background worker using BullMQ to sync data from the EHR database to Medplum.

## 🚀 Getting Started

### Prerequisites

- Node.js (v20.x or higher)
- PostgreSQL
- Redis

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (ensure you have a `.env` file with your database and Redis credentials).

### Running the Application

- **Development Mode:** `npm run dev` (uses nodemon for hot-reloading)
- **Production Mode:** `npm start`

---

## 🏛️ Project Architecture

This application is a background worker. It listens to a Redis queue and processes jobs asynchronously.

1. **Queue Consumer (`/queue`)**: Listens to BullMQ for new sync jobs.
2. **Services (`/services`)**: Business logic, data fetching from the EHR, FHIR mapping, and Medplum API communication.
3. **Configuration (`/config`)**: Database and Redis connection setups.

---

## 📂 Folder Structure

```text
fhir-queue-worker/
├── config/             # Configuration files (e.g., db.js for Postgres pool)
├── queue/              # BullMQ consumer logic
├── services/           # Core business logic (FHIR mapping, Medplum sync)
├── tests/              # Test suites
├── utils/              # Reusable helper functions (logger)
└── index.js            # Worker entry point (starts the consumer)
```

---

## 🧪 Testing

The project is scaffolded for both Unit and Integration testing.

- **Unit Tests** (`tests/unit/`): Test specific functions in isolation (e.g., mocking the database to test a service).
- **Integration Tests** (`tests/integration/`): Test the full HTTP request lifecycle by interacting with the Express `app` directly.

Run the full test suite with:

```bash
npm test
```

For coverage reports:

```bash
npm run test:cov
```
