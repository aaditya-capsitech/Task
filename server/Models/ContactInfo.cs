using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class ContactInfo
    {
        [Required]
        public string Id { get; set; } = string.Empty;  // Required to update the correct document

        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Designation { get; set; }
        public string? Type { get; set; }
        public string? Story { get; set; }
    }
}
