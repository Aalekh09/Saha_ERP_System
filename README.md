# Saha Institute ERP - Full Stack Project

## Project Structure

```
.
├── backend/    # Spring Boot backend (Java)
│   ├── src/
│   ├── pom.xml
│   ├── mvnw, mvnw.cmd, .mvn/
│   └── application.properties
└── frontend/   # Static frontend (HTML, CSS, JS)
    └── static/
        ├── index.html, ...
        ├── js/
        ├── css/
        ├── uploads/
        └── pages/
```

---

## Prerequisites
- **Java 17+** (for backend)
- **Maven** (wrapper included, so not strictly required)
- **Node.js** (for `npx serve` to run the frontend)

---

## How to Run the Project

### 1. Backend (Spring Boot)

1. Open a terminal and navigate to the `backend` directory:
   ```sh
   cd backend
   ```
2. Start the backend server on port **4455**:
   ```sh
   ./mvnw spring-boot:run
   ```
   - On Windows, you can also use:
     ```sh
     mvnw.cmd spring-boot:run
     ```
3. The backend will be available at:  
   `http://localhost:4455/`

---

### 2. Frontend (Static Files)

1. Open a new terminal and navigate to the frontend static directory:
   ```sh
   cd frontend/static
   ```
2. Serve the frontend using [serve](https://www.npmjs.com/package/serve):
   ```sh
   npx serve .
   ```
3. By default, the frontend will be available at:  
   `http://localhost:3000/`

---

## Connecting Frontend and Backend
- The frontend JavaScript is configured to call the backend at `http://localhost:4455/api/...`.
- Make sure both servers are running at the same time.
- If you change the backend port, update the API URLs in your JS files accordingly.

---

## Troubleshooting
- **CORS Issues:** The backend is configured to allow all origins (see `WebConfig.java`).
- **404 Errors:** Ensure the backend is running and accessible at the correct port.
- **Port Conflicts:** If port 4455 or 3000 is in use, change to a free port and update your configuration and JS files.

---

## Customization
- **Backend code:** `backend/src/main/java/com/example/studentmanagement/`
- **Frontend code:** `frontend/static/`
- **API URLs:** Update in `frontend/static/js/pages/reports.js` and other JS files as needed.

---

## Credits
- Developed for Saha Institute ERP
- Backend: Spring Boot (Java)
- Frontend: HTML, CSS, JavaScript
