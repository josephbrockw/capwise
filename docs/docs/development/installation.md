---
sidebar_position: 1
---

# Installation Guide

This guide will help you set up the BaseBuild project for local development.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- Node.js (v14 or later)
- npm or yarn
- Python (v3.8 or later)
- pip
- Docker and Docker Compose (optional, for containerized setup)

## Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/josephbrockw/basebuild.git
cd basebuild
```

### Backend Setup

1. Create a virtual environment and activate it:

```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

2. Install the required Python packages:

```bash
cd backend
pip install -r requirements.txt
```

3. Run migrations:

```bash
python manage.py migrate
```

4. Start the development server:

```bash
python manage.py runserver
```

The backend API should now be running at http://localhost:8000/.

### Frontend Setup

1. Install the required npm packages:

```bash
cd client
npm install
```

2. Start the development server:

```bash
npm start
```

The frontend application should now be running at http://localhost:3000/.

## Using Docker (Optional)

If you prefer to use Docker, you can use the provided Docker Compose configuration:

```bash
docker-compose up
```

This will start both the frontend and backend services in containers.

## Development Scripts

The project includes a helper script `bb.sh` that provides various development commands:

```bash
./bb.sh dev  # Start development servers
./bb.sh test  # Run tests
```

Refer to the script documentation for more commands.

## Troubleshooting

If you encounter any issues during installation, check the following:

- Make sure all prerequisites are installed and up to date
- Check that all required ports are available (8000 for backend, 3000 for frontend)
- Ensure you have the correct permissions to install packages and create files

If problems persist, please refer to the project's GitHub issues or contact the development team.
