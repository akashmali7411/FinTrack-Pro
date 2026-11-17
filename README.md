# FinTrack Pro – Personal Finance Management System

A full-stack Personal Finance Management Application designed to help users manage income, expenses, categories, and financial reports in one place.

## 🚀 Project Overview

FinTrack Pro helps users track their daily financial activities, understand spending patterns, and manage their personal finances efficiently.

## 🛠️ Technology Stack

### Frontend
- Next.js
- React.js
- TypeScript
- Tailwind CSS
- JavaScript
- HTML5 and CSS3

### Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Hibernate
- Maven
- REST APIs

### Database
- PostgreSQL

### Development Tools
- Visual Studio Code
- IntelliJ IDEA / VS Code
- PostgreSQL
- pgAdmin
- Swagger UI
- Git and GitHub

## ✨ Features

### 1. User Authentication
- User Registration
- User Login
- Password validation
- Logout functionality
- User-specific data management

### 2. Dashboard
- Total Income
- Total Expenses
- Total Balance
- Monthly Income and Expense chart
- Quick navigation to application modules
- Collapsible Sidebar

### 3. Expense Management
- Add new expenses
- Select expense category
- Select payment mode
- Record expense date
- Add expense description
- View total recorded expenses
- Manage expense categories
- Edit and delete categories

### 4. Income Management
- Add new income
- Select income category
- Select payment mode
- Record income date
- Add description
- View income records

### 5. Category Management
- Create income and expense categories
- Edit existing categories
- Activate or deactivate categories
- Prevent duplicate categories

### 6. Expense Reports
- Filter expenses by From Date and To Date
- Filter by category
- View total expenses
- Category-wise summary
- Export PDF
- Export Excel

## 📁 Project Structure

```text
FinTrack-Pro/
│
├── fintrack-backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/fintrack/fintrack_backend/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── entity/
│   │   │   │   ├── repository/
│   │   │   │   ├── security/
│   │   │   │   └── service/
│   │   │   │
│   │   │   └── resources/
│   │   │       └── application.yaml
│   │   │
│   │   └── test/
│   ├── pom.xml
│   └── mvnw.cmd
│
├── fintrack-frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── expenses/
│   │   ├── income/
│   │   ├── reports/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## ⚙️ Prerequisites

Install the following before running the project:

- Java JDK 21
- Node.js and npm
- PostgreSQL
- Visual Studio Code
- Git

## 🗄️ Database Setup

1. Open PostgreSQL or pgAdmin.
2. Create a database named:

```sql
CREATE DATABASE fintrack_db;
```

3. Configure the database connection in:

`fintrack-backend/src/main/resources/application.yaml`

Example configuration:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/fintrack_db
    username: postgres
    password: YOUR_POSTGRES_PASSWORD

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

server:
  port: 8080
```

Replace `YOUR_POSTGRES_PASSWORD` with your PostgreSQL password.

## ▶️ Run Backend

Open the terminal inside the backend folder:

```powershell
cd fintrack-backend
```

Run:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

## ▶️ Run Frontend

Open another terminal:

```powershell
cd fintrack-frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

## 🔗 API Base URL

```text
http://localhost:8080/api
```

## 🔐 Security Notes

- Do not upload database passwords.
- Do not upload API keys or secret credentials.
- Use environment variables for sensitive configuration.
- Do not commit `.env` files.
- Configure authentication and authorization before production deployment.

## 👨‍💻 Developer

**Akash Mali**

GitHub: https://github.com/akashmali7411

## 📌 Project Status

Development project – FinTrack Pro Personal Finance Management System.

---

If you find this project useful, feel free to explore the repository and provide feedback.
