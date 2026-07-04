# TrustSpot: AI-Powered Trustworthy Place Discovery Platform

TrustSpot is a modern, scalable, microservices-based application designed to discover new locations and read credible, high-trust user reviews. The application uses a multi-service architecture on the backend with Spring Boot and a React + TypeScript single-page application on the frontend.

---

## 🏛️ System Architecture & Port Mapping

The application consists of three independent Spring Boot microservices backed by in-memory H2 databases, communicating with a centralized frontend:

| Service | Port | Database | Description |
| :--- | :--- | :--- | :--- |
| **User Service** | `8081` | H2 (in-memory) | Handles user registration, authentication (JWT), profiles, bios, and profile images. |
| **Place Service** | `8082` | H2 (in-memory) | Manages place listings, categories, locations (coordinates), ownership, and edits. |
| **Review Service** | `8083` | H2 (in-memory) | Manages place reviews, ratings, likes, and image attachments. |
| **React Frontend** | `5173` | Local Storage | The interactive user interface built with React, Vite, and Zustand. |

---

## ✨ Key Features

1. **Microservices Design**: Decoupled domain models where each microservice operates on its own port and database.
2. **Dynamic Dashboard & Analytics**: A live user dashboard summarizing my reviews, registered places, saved bookmarks, and custom statistics.
3. **High-Contrast Pure Black Theme**: Overrides all ash-colored fonts to `#000000` to ensure optimal readability.
4. **Place Ownership & Moderation**: Users can register places, and only the creator can edit/delete those locations directly from the dashboard or place detail view.
5. **Local File Uploader (Base64)**: Users can select local images (up to 16MB) which are processed as Base64 strings, stored directly in H2 `CLOB`/`MEDIUMTEXT` columns, and rendered.
6. **Authentic Reviews Constraint**: Users cannot review places they authored to maintain unbiased, fair community standards.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Java**: JDK 17 (ensure `JAVA_HOME` is set).
* **Node.js**: Node 18+ and `npm`.

### Step 1: Run the Backend Services
Open three separate terminals and run each service:

```powershell
# In terminal 1 (User Service)
cd user-service
.\mvnw.cmd spring-boot:run

# In terminal 2 (Place Service)
cd place-service
.\mvnw.cmd spring-boot:run

# In terminal 3 (Review Service)
cd review-service
.\mvnw.cmd spring-boot:run
```

### Step 2: Run the React Frontend
Open a fourth terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at: **`http://localhost:5173`**

---

## 🛠️ Technology Stack

* **Backend**: Java 17, Spring Boot, Spring Data JPA, H2 Database (in-memory), Lombok, Jackson
* **Frontend**: React, TypeScript, Vite, Tailwind CSS, Zustand, Axios
