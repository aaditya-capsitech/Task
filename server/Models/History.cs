using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace server.Models
{
    public class History
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        public string BusinessId { get; set; } = null!;

        public string Message { get; set; } = null!;

        public string PerformedBy { get; set; } = null!;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
