using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace server.Models
{
    [BsonIgnoreExtraElements]
    public class Contact
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public string? Id { get; set; }

        // Replace single BusinessId with a list
        public List<IdNameModel> Businesses { get; set; } = new List<IdNameModel>();

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = string.Empty;

        [Required]
        public string Phone { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        public string? Designation { get; set; }

        public string? Story { get; set; }

        public string? PerformedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? ClientId { get; set; }
    }

    // This model supports saving multiple businesses
    public class IdNameModel
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Name { get; set; } = string.Empty;
    }
}
