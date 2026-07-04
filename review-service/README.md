# TrustSpot: Review Service

The **Review Service** manages reviews, comments, ratings, image attachments, and user likes on reviews.

---

## ⚙️ Service Specifications

* **Port**: `8083`
* **Database**: H2 In-Memory (`jdbc:h2:mem:testdb`)
* **H2 Console**: Accessible at `http://localhost:8083/h2-console`
  * **Driver Class**: `org.h2.Driver`
  * **JDBC URL**: `jdbc:h2:mem:testdb`
  * **Username**: `sa`
  * **Password**: *None*

---

## 📡 REST API Endpoints

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/reviews` | `Review` | Submits a new review. |
| **GET** | `/api/reviews/place/{placeId}` | *None* | Fetches reviews written for a specific place. |
| **GET** | `/api/reviews/user/{userId}` | *None* | Fetches reviews authored by a specific user. |
| **PUT** | `/api/reviews/{reviewId}` | `Review` | Edits an existing review (rating, comment, image URLs). |
| **DELETE** | `/api/reviews/{reviewId}` | *None* | Deletes a review. |
| **POST** | `/api/reviews/{reviewId}/like` | `{ "userId": 1 }` | Toggles liking/unliking a review for the user. |

---

## 🚀 How to Run

Navigate to the `review-service` directory and start the Spring Boot application:

```powershell
cd review-service
.\mvnw.cmd spring-boot:run
```
