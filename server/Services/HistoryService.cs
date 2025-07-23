using MongoDB.Driver;
using server.Models;

namespace server.Services
{
    public class HistoryService
    {
        private readonly IMongoCollection<History> _historyCollection;

        public HistoryService(IMongoClient client)
        {
            var database = client.GetDatabase("ActingOfficeDB");
            _historyCollection = database.GetCollection<History>("history");
        }

        // Log a new history entry
        public async Task LogAsync(string businessId, string message, string? performedBy)
        {
            if (string.IsNullOrWhiteSpace(businessId) || string.IsNullOrWhiteSpace(message))
                return;

            var history = new History
            {
                BusinessId = businessId,
                Message = message,
                PerformedBy = performedBy ?? "System",
                Timestamp = DateTime.UtcNow
            };

            await _historyCollection.InsertOneAsync(history);
        }

        // Get all logs for a business
        public async Task<List<History>> GetByBusinessIdAsync(string businessId)
        {
            if (string.IsNullOrWhiteSpace(businessId))
                return new List<History>();

            return await _historyCollection
                .Find(entry => entry.BusinessId == businessId)
                .SortByDescending(entry => entry.Timestamp)
                .ToListAsync();
        }
    }
}
