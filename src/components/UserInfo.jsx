function UserInfo({ user }) {
    return (
      <div className="flex items-center space-x-4">
        <img
          src={user.profilePicture || 'https://via.placeholder.com/100'}
          alt={user.username}
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
          <p className="text-gray-600">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }
  
  export default UserInfo;