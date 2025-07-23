using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using server.Models;
using server.Services;
using System.Security.Claims;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ContactsController : ControllerBase
    {
        private readonly ContactService _contactService;
        private readonly BusinessDataService _businessDataService;

        public ContactsController(ContactService contactService, BusinessDataService businessDataService)
        {
            _contactService = contactService;
            _businessDataService = businessDataService;
        }

        // POST: Create contact with initial businesses
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Contact contact)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (contact == null || contact.Businesses == null || contact.Businesses.Count == 0)
                return BadRequest(new { message = "At least one business must be linked." });

            var firstBusinessId = contact.Businesses[0].Id;
            if (string.IsNullOrWhiteSpace(firstBusinessId))
                return BadRequest(new { message = "First Business ID is invalid." });

            var business = await _businessDataService.GetByIdAsync(firstBusinessId);
            if (business == null)
                return BadRequest(new { message = "Business not found for the provided ID." });

            contact.ClientId = business.ClientId;

            var performedBy = User.FindFirstValue(ClaimTypes.Email) ?? "Unknown";
            await _contactService.CreateWithHistoryAsync(contact, performedBy);

            return Ok(new { message = "Contact created successfully", contact });
        }

        // POST: Append new businesses to an existing contact
        [HttpPost("{contactId}/link-businesses")]
        public async Task<IActionResult> LinkBusinesses(string contactId, [FromBody] List<IdNameModel> businesses)
        {
            if (string.IsNullOrWhiteSpace(contactId))
                return BadRequest(new { message = "Invalid contact ID" });

            if (businesses == null || businesses.Count == 0)
                return BadRequest(new { message = "No businesses provided to link." });

            var contact = await _contactService.GetByIdAsync(contactId);
            if (contact == null)
                return NotFound(new { message = "Contact not found." });

            // Filter out businesses already linked
            var newBusinesses = businesses
                .Where(b => !contact.Businesses.Any(existing => existing.Id == b.Id))
                .ToList();

            if (newBusinesses.Count == 0)
                return Ok(new { message = "All provided businesses are already linked." });

            var filter = Builders<Contact>.Filter.Eq(c => c.Id, contactId);
            var update = Builders<Contact>.Update.AddToSetEach(c => c.Businesses, newBusinesses);
            var updated = await _contactService.UpdateRawAsync(filter, update);

            if (!updated)
                return NotFound(new { message = "Failed to update contact." });

            return Ok(new { message = "New businesses linked successfully", added = newBusinesses.Count });
        }

        // POST: Update an existing contact
        [HttpPost("update")]
        public async Task<IActionResult> UpdateContact([FromBody] ContactInfo contactInfo)
        {
            if (contactInfo == null || string.IsNullOrWhiteSpace(contactInfo.Id))
                return BadRequest(new { message = "Invalid contact data." });

            var existing = await _contactService.GetByIdAsync(contactInfo.Id);
            if (existing == null)
                return NotFound(new { message = "Contact not found." });

            // Only update non-null fields (in case partial update)
            if (!string.IsNullOrEmpty(contactInfo.Email)) existing.Email = contactInfo.Email;
            if (!string.IsNullOrEmpty(contactInfo.Phone)) existing.Phone = contactInfo.Phone;
            if (!string.IsNullOrEmpty(contactInfo.Designation)) existing.Designation = contactInfo.Designation;
            if (!string.IsNullOrEmpty(contactInfo.Type)) existing.Type = contactInfo.Type;
            if (!string.IsNullOrEmpty(contactInfo.Story)) existing.Story = contactInfo.Story;

            var success = await _contactService.UpdateAsync(existing);
            if (!success)
                return StatusCode(500, new { message = "Failed to update contact." });

            return Ok(new { message = "Contact updated successfully.", contact = existing });
        }


        // GET: Contacts by businessId
        [HttpGet]
        public async Task<IActionResult> GetByBusinessId([FromQuery] string businessId)
        {
            if (string.IsNullOrWhiteSpace(businessId))
                return BadRequest(new { message = "BusinessId is required." });

            var contacts = await _contactService.GetByBusinessIdAsync(businessId);
            return Ok(contacts);
        }

        // GET: Single contact by contact ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var contact = await _contactService.GetByIdAsync(id);
            if (contact == null)
                return NotFound(new { message = "Contact not found." });

            return Ok(contact);
        }
        // GET: All contacts with resolved business names
        [HttpGet("all")]
        public async Task<IActionResult> GetAllContacts()
        {
            var contacts = await _contactService.GetAllAsync();

            var allBusinessIds = contacts
                .SelectMany(c => c.Businesses?.Select(b => b.Id) ?? new List<string>())
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Distinct()
                .ToList();

            //to Get business info
            var businessList = await _businessDataService.GetByIdsAsync(allBusinessIds);

            var result = contacts.Select(c =>
            {
                var businessNames = c.Businesses?.Select(b =>
                {
                    var matched = businessList.FirstOrDefault(db => db.Id == b.Id);
                    return matched?.BusinessName ?? b.Name;
                }).ToList() ?? new List<string>();

                return new
                {
                    c.Id,
                    c.Name,
                    c.Designation,
                    c.Email,
                    c.Phone,
                    c.Type,
                    BusinessNames = businessNames
                };
            });

            return Ok(result);
        }
        // GET: Contact with full business details
        [HttpGet("{id}/details")]
        public async Task<IActionResult> GetContactWithBusinessDetails(string id)
        {
            var contact = await _contactService.GetByIdAsync(id);
            if (contact == null)
                return NotFound(new { message = "Contact not found." });

            var businessIds = contact.Businesses
                ?.Where(b => !string.IsNullOrWhiteSpace(b.Id))
                .Select(b => b.Id)
                .Distinct()
                .ToList() ?? new();

            var businesses = await _businessDataService.GetByIdsAsync(businessIds);

            return Ok(new
            {
                contact,
                businesses
            });
        }
     [HttpPost("refresh")]
public async Task<IActionResult> RefreshContacts()
{
    try
    {
        // Your logic here (e.g., reload from another source)
        await _contactService.RefreshAsync();
        return Ok();
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Error refreshing contacts: {ex.Message}");
    }
}



    }
}
