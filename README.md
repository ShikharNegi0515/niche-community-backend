# Niche Community Backend

This is the backend for the Niche Community project. It is built using **Node.js**, **Express**, and **MongoDB** (via Mongoose). It provides REST APIs for authentication, communities, posts, and comments.

## Features

- User authentication (signup, login)
- Community management (create, join, leave, delete)
- Post management (create, fetch, delete)
- Comment management (add, fetch, delete)
- Role-based actions for community creators
- CORS enabled for frontend interaction
- JWT-based authentication

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
PORT — port where backend will run
MONGO_URI — MongoDB Atlas connection string
JWT_SECRET — secret key for JWT tokens

```bash
npm install        # Install dependencies
npm run dev        # Start backend in development mode (nodemon)
npm start          # Start backend in production mode
```

## Folder Structure

backend/
├── config/          # Database connection (db.js)
├── controllers/     # Route controllers for auth, posts, communities, comments
├── models/          # Mongoose models (User, Post, Community, Comment)
├── routes/          # Express routes
├── middleware/      # Auth middleware, error handling
├── server.js        # Entry point
└── package.json

## API Endpoints

### Auth
- `POST /api/auth/signup` — register a new user  
- `POST /api/auth/login` — login user  

### Communities
- `GET /api/communities` — fetch all communities  
- `POST /api/communities` — create a community  
- `POST /api/communities/:id/join` — join a community  
- `POST /api/communities/:id/leave` — leave a community  
- `DELETE /api/communities/:id` — delete a community  

### Posts
- `GET /api/posts` — fetch all posts  
- `GET /api/posts/feed` — fetch posts from joined communities  
- `POST /api/posts` — create a post  
- `DELETE /api/posts/:id` — delete a post  

### Comments
- `GET /api/comments/:postId` — fetch comments for a post  
- `POST /api/comments` — add a comment  
- `DELETE /api/comments/:id` — delete a comment  

## Contributing
1. Fork the repository  
2. Create a new branch (`git checkout -b feature/YourFeature`)  
3. Commit your changes (`git commit -m 'Add YourFeature'`)  
4. Push to the branch (`git push origin feature/YourFeature`)  
5. Open a pull request  

## License
MIT License
