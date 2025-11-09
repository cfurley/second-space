Group D - Software Engineering - CS3202

# Backend Documentation

This document provides an overview of the backend architecture, technologies used, and instructions for setting up and running the backend server for the Group D - Software Engineering project (CS3202).

## Table of Contents
- [Technologies Used](#technologies-used)
- [Architecture Overview](#architecture-overview)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Contributing](#contributing)

## Technologies Used

- **Programming Language:** Node.js (v22+)
- **Web Framework:** Express.js 4.18.2
- **Database:** PostgreSQL 16
- **Database Driver:** node-postgres (pg) 8.11.3
- **Testing Framework:** Vitest 0.34.6
- **Containerization:** Docker
- **CORS:** cors 2.8.5

## Architecture Overview

The backend server is built using the Express.js web framework, which provides a lightweight and flexible environment for developing web applications. The application follows a modular architecture, separating concerns into different layers:

- **Routes:** Handle incoming HTTP requests and route them to the appropriate controllers.
- **Controllers:** Contain the business logic and interact with the models to process data.
- **Models:** Define the data structures and act as blueprints for database entities.
- **Database Layer:** Direct PostgreSQL connection using node-postgres pool for efficient database operations.

### Project Structure

```
backend/
??? src/
?   ??? controllers/     # Business logic and request handlers
?   ?   ??? userControllers.js
?   ?   ??? spaceControllers.js
?   ?   ??? themeControllers.js
?   ?   ??? mediaControllers.js
?   ??? routes/          # API route definitions
?   ?   ??? userRoutes.js
?   ?   ??? spacesRoutes.js
?   ?   ??? themeRoutes.js
?   ?   ??? mediaRoutes.js
?   ??? models/          # Data models
?   ?   ??? userModel.js
?   ?   ??? spaceModel.js
?   ?   ??? themeModel.js
?   ?   ??? mediaModel.js
?   ??? db/              # Database connection
?       ??? index.js
??? app.js               # Express application setup
??? package.json         # Project dependencies
??? Dockerfile           # Docker container configuration
??? .env.example         # Environment variables template
```

## Setup Instructions

### Prerequisites

- Node.js 22 or higher
- PostgreSQL 16 or higher
- Docker (optional, for containerized deployment)

### Local Development Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/cfurley/second-space
   cd second-space/backend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Copy the `.env.example` file to `.env` and update the values:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=myuser
   DB_PASSWORD=mypassword
   DB_NAME=mydatabase

   # Server Configuration
   PORT=8080
   NODE_ENV=development

   # CORS Configuration (comma-separated list)
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80
   ```

4. **Set Up the Database:**

   Ensure PostgreSQL is running and create the database:

   ```bash
   psql -U postgres
   CREATE DATABASE mydatabase;
   \q
   ```

   Run the initialization script:

   ```bash
   psql -U myuser -d mydatabase -f ../database/init/init.sql
   ```

5. **Start the Development Server:**

   ```bash
   npm start
   ```

   The server will start on `http://localhost:8080`.

### Docker Setup

1. **Build and Run with Docker Compose:**

   From the project root directory:

   ```bash
   docker-compose up --build
   ```

   This will start:
   - Backend server on port 8080
   - PostgreSQL database on port 5432
   - Frontend on port 80

2. **Stop the Services:**

   ```bash
   docker-compose down
   ```

3. **Remove Volumes (to reset database):**

   ```bash
   docker-compose down -v
   ```

## API Endpoints

### Health Check

- **GET** `/`
  - Returns API status and available endpoints
  - Response:
    ```json
    {
      "message": "Second Space API",
      "status": "running",
      "version": "0.1.0",
      "endpoints": {
        "users": "/user",
        "spaces": "/spaces"
      }
    }
    ```

### User Endpoints

- **POST** `/user/authentication`
  - Authenticate a user (login)
  - Request body: `{ username, password }`

- **POST** `/user`
  - Create a new user
  - Request body: `{ username, password, first_name, last_name, ... }`

- **PUT** `/user/:id`
  - Update user information
  - Request body: User fields to update

- **PUT** `/user/password`
  - Update user password
  - Request body: `{ username, old_password, new_password }`

- **DELETE** `/user/:id`
  - Delete a user (soft delete)
  - URL parameter: `id` - User ID

### Space Endpoints

- **GET** `/spaces/users/:id`
  - Get all spaces for a specific user
  - URL parameter: `id` - User ID

- **GET** `/spaces/:id`
  - Get a specific space by ID
  - URL parameter: `id` - Space ID

- **POST** `/spaces`
  - Create a new space
  - Request body: `{ created_by_user_id, title, icon }`

- **PUT** `/spaces/:id`
  - Update a space
  - URL parameter: `id` - Space ID
  - Request body: Space fields to update

- **DELETE** `/spaces/:id`
  - Delete a space (soft delete)
  - URL parameter: `id` - Space ID

## Database Schema

The application uses PostgreSQL with the following main tables:

### Core Tables

- **user** - User accounts with authentication
  - Fields: id, username, password, display_name, profile_picture_id, theme_id, first_name, last_name, timezone, timestamps

- **space** - User spaces/collections
  - Fields: id, created_by_user_id, title, icon, timestamps

- **containers** - Content containers within spaces
  - Fields: id, space_id, title, link, container_type_id, created_by_user_id, timestamps

- **media** - Media files associated with containers
  - Fields: id, container_id, filename, filepath, file_size, video_length, timestamps

### Supporting Tables

- **themes** - UI theme configurations
- **profile_picture** - User profile picture files
- **container_type** - Types of containers (Text, Video, Image, Link)
- **space_ordering** - User-specific space ordering
- **space_viewing_history** - Space view tracking
- **shared_spaces** - Space sharing and permissions
- **shared_spaces_permission_log** - Permission change history

All tables include soft delete functionality via `deleted` flag and timestamp fields for auditing.

## Testing

The project uses Vitest for testing.

### Running Tests

```bash
npm test
```

### Writing Tests

Tests should be placed in `__tests__` directories or named with `.test.js` or `.spec.js` extensions.

Example test structure:

```javascript
import { describe, it, expect } from 'vitest';

describe('User Controller', () => {
  it('should create a new user', () => {
    // Test implementation
  });
});
```

## Contributing

### Development Workflow

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test thoroughly

3. Commit your changes with descriptive messages:
   ```bash
   git commit -m "Add feature: description"
   ```

4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request on GitHub

### Code Style Guidelines

- Use ES6+ module syntax (`import`/`export`)
- Follow consistent naming conventions (camelCase for variables/functions)
- Add comments for complex logic
- Keep functions focused and modular
- Use async/await for asynchronous operations

### Database Migrations

When making database schema changes:
1. Update the `database/init/init.sql` file
2. Document the changes in your PR
3. Test with a fresh database initialization

## License

MIT License - See LICENSE file for details

## Contact

For questions or support, please contact the development team or create an issue on GitHub.
