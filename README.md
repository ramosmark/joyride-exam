# Joyride Backend Exam
 
#### Node setup on macOS
```
brew update
brew install node
npm install 
```

Redis setup on macOS
```
sudo apt-get install redis
redis-server
```

Setup Database
```
run code from schema.sql to mysql-cli or mysql workbench
```

Run Server
```
npm install
npm run dev
```

Environment Variables
``` Create .env file in root directory ```
``
PORT=3000
MYSQL_HOST='127.0.0.1'
MYSQL_USER=''
MYSQL_PASSWORD=''
MYSQL_DATABASE='joyride_exam'
SECRET='joyride'
EXPIRATION=120
```

Requests for postman testing
``` 
user registration: http://localhost:3000/users/register
user login: http://localhost:3000/users/login
user logout: http://localhost:3000/users/logout
fetching user data from github: http://localhost:3000/users/info
```

How to run API
```
for registraion: pass JSON data to the body (name, email and password)

example: {
  "name": "Mark Ramos",
  "email": "ramosmark@getnada.com",
  "password": "p@ssW0rD!"
}

for login: pass JSON data to the body with (email and password)

example: {
  "email": "ramosmark@getnada.com",
  "password": "p@ssW0rD!"
}

for logout: use token from login as bearer token

for fetching github user info: use token from login as bearer token then pass an array of JSON data to the body

example: 
[{
  "username": "ramosmark" 
},
{
  "username": "someranmdomuser" 
}]

```
