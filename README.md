# API Documentation

* [Authentication](#authentication)
  * [Login](#login)

## Authentication

### Login

Authenticate against Active Directory and return an authorization token.

URL

`/api/auth`

Method

`POST`

Data Params

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| `username` | `String` | sAMAccountName of user | **yes** |
| `password` | `String` | Password of user | **yes** |

Success Response

```http
Status: 200 OK
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRyZWVtbWV0dCIsImFkbWluIjp0cnVlLCJpYXQiOjE1Mzg0OTgzNTgsImV4cCI6MTUzODUwNTU1OH0.vuQKgy3GHdjRIKXzhezf9r40X2asgMGq-39jg3UUALs

{
  "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRyZWVtbWV0dCIsImFkbWluIjp0cnVlLCJpYXQiOjE1Mzg0OTgzNTgsImV4cCI6MTUzODUwNTU1OH0.vuQKgy3GHdjRIKXzhezf9r40X2asgMGq-39jg3UUALs",
  "type": "bearer"
}
```

Error Response

```http
Status: 401 Unauthorized

{
  "error": "Incorrect username or password."
}
```

```http
Status: 403 Forbidden

{
  "error": "You do not have the necessary permissions."
}
```