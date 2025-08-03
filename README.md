# Sport Center Reservation Managing Website

## Demo

https://github.com/user-attachments/assets/dacef894-7603-4060-946f-870fe0c311d7

## Tech stack

- backend:
  - ExpressJS
- frontend:
  - plain old HTML+CSS+JavaScript

## Setup

1. Pull, build & run a MySQL image: `docker compose up -d`
2. Enter inside database container: `docker exec -it projekt mysql -u root -pHnsAdrt0WtynpKJd`
3. Copy & Paste contents of `setup.sql` in terminal to populate database
4. Exit database container (CTRL+D)
5. Install dependencies: `npm i`
6. Start web server: `npm start`

## Example users

- Admin user
  - username: `isten`
  - password: `xx`
- Student user
  - username: `jimmy`
  - password: `x`
