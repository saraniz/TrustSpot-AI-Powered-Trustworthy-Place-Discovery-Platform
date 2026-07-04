# TrustSpot: Place Service

The **Place Service** manages local business listings, categories, addresses, coordinates (latitude/longitude), and ownership attributes.

---

## ⚙️ Service Specifications

* **Port**: `8082`
* **Database**: H2 In-Memory (`jdbc:h2:mem:testdb`)
* **H2 Console**: Accessible at `http://localhost:8082/h2-console`
  * **Driver Class**: `org.h2.Driver`
  * **JDBC URL**: `jdbc:h2:mem:testdb`
  * **Username**: `sa`
  * **Password**: *None*

---

## 📡 REST API Endpoints

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/places` | *None* | Lists all places. |
| **GET** | `/api/places/{id}` | *None* | Fetches a single place by ID. |
| **POST** | `/api/places` | `Place` | Registers a new place. Includes `userId` to designate ownership. |
| **PUT** | `/api/places/{id}` | `Place` | Updates place details (category, address, image URLs). |
| **DELETE** | `/api/places/{id}` | *None* | Deletes a place from the repository. |

---

## 🚀 How to Run

Navigate to the `place-service` directory and start the Spring Boot application:

```powershell
cd place-service
.\mvnw.cmd spring-boot:run
```
