# Wizard 0x65

## Installation

This project requires Node (v18), rust, and wasm-pack.

## Database Setup

Make sure postgres is installed on your local machine. Created a postgres DB called "wizard_db".

Make sure prisma is installed. In your .env file, add the line:
DATABASE_URL="postgresql://[YOUR_MACHINE_NAME]@localhost:5432/wizard_db"

Run `npx prisma init` and `npx prisma migrate dev --name init`. Check to make sure your postgresDB has been populated with tables based on the models listed in `schema.prisma`.
