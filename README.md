# SocialSpark

SocialSpark is a modern social media web application that allows users to connect, share moments, and interact with others through posts, likes, comments, and stories. The platform is designed with a clean, responsive interface inspired by popular social networks.

## Features

* User authentication (Sign Up / Login)
* User profile with avatar, bio, and personal information
* Create posts with images and captions
* Like and comment on posts
* Follow and unfollow users
* Stories that automatically disappear after 24 hours
* News feed showing posts from followed users
* Responsive design for desktop and mobile

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* Supabase (Authentication, Database, Storage)

## Database Structure

The application uses the following tables:

* profiles – stores user profile information
* posts – stores user posts
* likes – tracks post likes
* comments – stores comments on posts
* follows – manages follower relationships
* stories – stores temporary stories

Row Level Security (RLS) policies are enabled to protect user data and ensure users can only modify their own content.

## Storage Buckets

Supabase storage is used for media uploads.

* **posts** → stores uploaded post images
* **avatars** → stores user profile pictures



## Project Structure

src/

* components → reusable UI components
* pages → application pages
* lib → Supabase client configuration
* assets → images and static files

## Future Improvements

* Real-time chat
* Notifications system
* Video posts / reels
* Advanced search functionality
* Mobile app version

## Author

SocialSpark was developed as a full-stack social media application using React and Supabase.

## License
This project is intended for educational and development purposes.
