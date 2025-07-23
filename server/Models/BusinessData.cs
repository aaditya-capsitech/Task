using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class BusinessData
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        public int Sno { get; set; }

        public string ClientId { get; set; } = null!;

        [BsonRequired]
        public string BusinessName { get; set; } = null!;

        public string Type { get; set; } = null!;

        public string ContactPerson { get; set; } = null!;

        public string Team { get; set; } = null!;

        public string Manager { get; set; } = null!;

        public string FirstResponse { get; set; } = null!;

        [EmailAddress]
        public string Email { get; set; } = null!;

        public string PhoneNumber { get; set; } = null!;

        [BsonRepresentation(BsonType.String)]
        public BusinessStatus Status { get; set; } = BusinessStatus.Active;

        public string CreatedBy { get; set; } = null!;

        [BsonElement("designation")]
        public string? Designation { get; set; }

        public string? LinkedContactId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
