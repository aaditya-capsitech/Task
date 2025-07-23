namespace server.DTOs
{
    public class UpdateProfileDto
    {
        public string Gender { get; set; } = string.Empty;
        public string Dob { get; set; } = string.Empty;
        public AddressDto Address { get; set; } = new AddressDto();

        public class AddressDto
        {
            public string House { get; set; } = string.Empty;
            public string Street { get; set; } = string.Empty;
            public string City { get; set; } = string.Empty;
            public string State { get; set; } = string.Empty;
            public string Pincode { get; set; } = string.Empty;
            public string Country { get; set; } = string.Empty;
        }
    }
}
