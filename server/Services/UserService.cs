using MongoDB.Driver;
using server.Models;

namespace server.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _usersCollection;

        public UserService(IMongoDatabase database)
        {
            _usersCollection = database.GetCollection<User>("Users");
        }

        //   Create/Register new user
        public async Task CreateAsync(User user)
        {
            await _usersCollection.InsertOneAsync(user);
        }

        //   Get user by email
        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _usersCollection
                .Find(u => u.Email == email)
                .FirstOrDefaultAsync();
        }

        //   (Optional) Get all users
        public async Task<List<User>> GetAllAsync()
        {
            return await _usersCollection.Find(_ => true).ToListAsync();
        }

        //   (Optional) Get user by ID
        public async Task<User?> GetByIdAsync(string id)
        {
            return await _usersCollection
                .Find(u => u.Id == id)
                .FirstOrDefaultAsync();
        }

        //   (Optional) Delete user by ID
        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _usersCollection.DeleteOneAsync(u => u.Id == id);
            return result.DeletedCount > 0;
        }

        //   (Optional) Update user password (simplified)
        public async Task<bool> UpdatePasswordAsync(string email, string newPassword)
        {
            var update = Builders<User>.Update.Set(u => u.Password, newPassword);
            var result = await _usersCollection.UpdateOneAsync(u => u.Email == email, update);
            return result.ModifiedCount > 0;
        }
        public async Task<bool> UpdateAsync(string id, User user)
        {
            var result = await _usersCollection.ReplaceOneAsync(u => u.Id == id, user);
            return result.ModifiedCount > 0;
        }

    }
}
