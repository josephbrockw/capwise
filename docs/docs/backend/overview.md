---
sidebar_position: 1
---

# Backend Overview

The BaseBuild backend is built with Django and provides a RESTful API for the frontend application. It handles user authentication, data storage, and business logic processing.

## Technology Stack

- **Django**: Python web framework
- **Django REST Framework**: For building RESTful APIs
- **PostgreSQL**: Database for data storage
- **Celery**: For asynchronous task processing

## Project Structure

The backend code is organized in the `backend` directory with the following structure:

```
backend/
u251cu2500u2500 api/                # API endpoints and serializers
u2502   u251cu2500u2500 serializers.py  # Data serializers
u2502   u251cu2500u2500 urls.py         # API URL routing
u2502   u2514u2500u2500 views.py        # API view functions
u251cu2500u2500 config/             # Project configuration
u251cu2500u2500 core/               # Core application functionality
u251cu2500u2500 users/              # User management
u251cu2500u2500 payments/           # Payment processing
u251cu2500u2500 manage.py           # Django management script
u2514u2500u2500 requirements.txt    # Python dependencies
```

## Key Components

The backend includes several key components:

- **Authentication System**: Handles user registration, login, and session management
- **API Endpoints**: RESTful endpoints for frontend communication
- **Data Models**: Database models for storing application data
- **Serializers**: Convert between Python objects and JSON data
- **Background Tasks**: Celery tasks for asynchronous processing

## API Structure

The API follows RESTful principles and is organized by resource type:

- `/api/users/` - User management endpoints
- `/api/auth/` - Authentication endpoints
- `/api/products/` - Product management endpoints
- `/api/payments/` - Payment processing endpoints

## Getting Started

To start working with the backend code:

1. Make sure you have Python 3.8+ installed
2. Navigate to the `backend` directory
3. Create and activate a virtual environment
4. Install dependencies with `pip install -r requirements.txt`
5. Run migrations with `python manage.py migrate`
6. Start the development server with `python manage.py runserver`

The API will be available at http://localhost:8000/api/.

## Testing

The backend includes comprehensive tests:

```bash
python manage.py test
```

## API Documentation

API documentation is available at http://localhost:8000/api/docs/ when running the development server. This provides an interactive interface to explore and test the API endpoints.
