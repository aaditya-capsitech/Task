using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace server.Models
{
    public class Client
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("clientId")]
        public string ClientId { get; set; } = string.Empty;

        [BsonElement("businessName")]
        public string BusinessName { get; set; } = string.Empty;

        [BsonElement("type")]
        public string Type { get; set; } = string.Empty;

        [BsonElement("contactPerson")]
        public string ContactPerson { get; set; } = string.Empty;

        [BsonElement("team")]
        public string Team { get; set; } = string.Empty;

        [BsonElement("manager")]
        public string Manager { get; set; } = string.Empty;

        [BsonElement("FR")]
        public string FirstResponse { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("phoneNumber")]
        public string PhoneNumber { get; set; } = string.Empty;

        public string Status { get; set; } = "active";
    }
}
