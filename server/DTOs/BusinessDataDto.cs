using server.Models; 

namespace server.Dtos
{
    public class BusinessDataDto
    {
        public string BusinessName { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string ContactPerson { get; set; } = null!;
        public string Team { get; set; } = null!;
        public string Manager { get; set; } = null!;
        public string FirstResponse { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;

        public BusinessStatus? Status { get; set; }  // Nullable, server assigns default
        public string? CreatedBy { get; set; }
        public string? LinkedContactId { get; set; }
        public string? Designation { get; set; }
    }
}
