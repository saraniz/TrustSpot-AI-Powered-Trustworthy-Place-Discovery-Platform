# TrustSpot: User Service

The **User Service** manages accounts, authentication, user profiles, bios, and profile/cover image configurations.

---

## ⚙️ Service Specifications

* **Port**: `8081`
* **Database**: H2 In-Memory (`jdbc:h2:mem:testdb`)
* **H2 Console**: Accessible at `http://localhost:8081/h2-console`
  * **Driver Class**: `org.h2.Driver`
  * **JDBC URL**: `jdbc:h2:mem:testdb`
  * **Username**: `sa`
  * **Password**: *None*

---

## 📡 REST API Endpoints

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/users/register` | `RegisterRequest` | Registers a new user account. |
| **POST** | `/api/users/login` | `LoginRequest` | Logs in a user and returns a JWT token. |
| **GET** | `/api/users/{id}` | *None* | Fetches profile details of the user by ID. |
| **PUT** | `/api/users/{id}` | `UpdateRequest` | Updates user bio and account details. |
| **POST** | `/api/users/{id}/profile-image` | `{ "imageUrl": "..." }` | Updates the profile image URL (supports up to 16MB Base64). |
| **POST** | `/api/users/{id}/cover-image` | `{ "imageUrl": "..." }` | Updates the cover image URL (supports up to 16MB Base64). |
| **POST** | `/api/users/validate` | `{ "token": "..." }` | Validates a JWT authorization token. |

---

## 🚀 How to Run

Navigate to the `user-service` directory and start the Spring Boot application:

```powershell
cd user-service
.\mvnw.cmd spring-boot:run
```
