# SnapLife

SnapLife is a MERN stack blogging platform where users can write blogs, upload images, rate blogs, and interact with other users through comments and ratings.

## Features

- **User Authentication**: Sign up and log in securely.
- **Create & Manage Blogs**: Users can write, edit, and delete their own blogs.
- **Image Upload**: Attach images to blog posts.
- **Ratings & Reviews**: Other users can rate blogs (1-5 stars) and leave comments.
- **Search & Filter**: Find blogs by keywords and authors.

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Cloudinary 
- **Deployment**: Render 

## Installation

### Prerequisites
- Node.js & npm installed
- MongoDB instance running (local or cloud)

### Steps to Run

1. **Clone the repository:**
   ```sh
   git clone https://github.com/sujalmendhe02/SnapLife.git
   cd SnapLife
   ```

2. **Install dependencies:**
   ```sh
   npm install
   cd client && npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   CLOUDINARY_URL=your_cloudinary_url
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the backend server:**
   ```sh
   npm run dev
   ```

5. **Start the frontend:**
   ```sh
   cd client
   npm run dev
   ```

## API Endpoints

| Method | Endpoint            | Description                 |
|--------|---------------------|-----------------------------|
| POST   | /api/auth/register  | Register a new user        |
| POST   | /api/auth/login     | Login user                 |
| POST   | /api/blogs          | Create a new blog          |
| GET    | /api/blogs          | Get all blogs              |
| GET    | /api/blogs/:id      | Get a specific blog        |
| POST   | /api/blogs/:id/rate | Rate and review a blog     |

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.


