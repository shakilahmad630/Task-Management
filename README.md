# Task Management App - Backend

This is the Spring Boot backend for the Task Management Application. It provides a RESTful API for user authentication, task management, and activity logging.

## Technologies Used
* **Java 17+**
* **Spring Boot 3**
* **Spring Security** (with JWT Authentication)
* **Spring Data JPA**
* **PostgreSQL**
* **Maven**

## Features
* **Authentication**: User registration and login using JWT tokens.
* **Task Management**: Create, Read, Update, and Delete tasks with fields for title, description, priority, status, and due dates.
* **Role-Based Access**: Distinguishes between standard `USER`s and `ADMIN`s. Admins can view and manage all users' tasks.
* **Activity Logging**: Automatically logs all task interactions (creation, updates, status changes, deletions) and exposes them for an activity feed.
* **Attachments Support**: Endpoint ready for file uploads associated with tasks.

## Getting Started

### Prerequisites
1. Ensure you have **Java 17** or higher installed.
2. Ensure you have **Maven** installed.
3. A running **PostgreSQL** instance.

### Database Setup
1. Open pgAdmin or your PostgreSQL client.
2. Create a new database named `taskdb`.
3. Check `src/main/resources/application.properties` to ensure the username and password match your local PostgreSQL configuration:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/taskdb
   spring.datasource.username=postgres
   spring.datasource.password=123456
   ```

### Running the Application
1. Open a terminal in the backend root directory.
2. Run the application using Maven:
   ```bash
   mvnw spring-boot:run
   ```
   *Alternatively, you can run the `BackendApplication.java` file directly from your IDE (IntelliJ IDEA, Eclipse, VS Code).*

3. The server will start on port `8081` (as configured in `application.properties`).

## API Endpoints Overview

* **Auth**: `POST /auth/login`, `POST /auth/signup`
* **Tasks**: `GET /tasks/getAll`, `POST /tasks/create`, `PATCH /tasks/update/{id}`, `DELETE /tasks/delete/{id}`
* **Activity**: `POST /activities/log`, `GET /activities/all`, `GET /activities/task/{id}`, `DELETE /activities/clear`
* **Users**: `GET /users`, `PATCH /users/{id}`, `DELETE /users/{id}` (Admin only)
