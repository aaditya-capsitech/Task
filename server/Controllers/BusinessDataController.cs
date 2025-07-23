using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Models;
using server.Services;
using server.Dtos;
using System.Security.Claims;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BusinessDataController : ControllerBase
    {
        private readonly BusinessDataService _service;
        private readonly HistoryService _historyService;

        public BusinessDataController(BusinessDataService service, HistoryService historyService)
        {
            _service = service;
            _historyService = historyService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Get(
            [FromQuery] string status = "active",
            [FromQuery] string? type = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var email = User.FindFirstValue(ClaimTypes.Email);
                var role = User.FindFirstValue("role") ?? "User";
                var (items, totalCount) = await _service.GetFilteredAsync(status.ToLower(), role, email, type, page, pageSize);

                return Ok(new
                {
                    totalCount,
                    currentPage = page,
                    pageSize,
                    data = items
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest(new { message = "Invalid ID" });

            var data = await _service.GetByIdAsync(id);
            if (data == null)
                return NotFound(new { message = "Business not found" });

            return Ok(data);
        }

        [HttpGet("with-client")]
        [Authorize]
        public async Task<IActionResult> GetBusinessesWithClient([FromQuery] string clientId)
        {
            if (string.IsNullOrWhiteSpace(clientId))
                return BadRequest(new { message = "Missing clientId" });

            var businesses = await _service.GetBusinessesWithClientDetails(clientId);
            return Ok(businesses);
        }

        [HttpGet("with-contact")]
        public async Task<IActionResult> GetBusinessesByContact(string contactId)
        {
            var businesses = await _service.GetByContactIdAsync(contactId);
            return Ok(businesses);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Post([FromBody] BusinessDataDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid data" });

            var createdBy = User.FindFirstValue(ClaimTypes.Email);

            var data = new BusinessData
            {
                BusinessName = dto.BusinessName,
                Type = dto.Type,
                ContactPerson = dto.ContactPerson,
                Team = dto.Team,
                Manager = dto.Manager,
                FirstResponse = dto.FirstResponse,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                CreatedBy = createdBy,
                LinkedContactId = dto.LinkedContactId,
                Status = BusinessStatus.Active
            };

            await _service.AddAsync(data);

            return Ok(new
            {
                message = "Data added successfully",
                id = data.Id,
                clientId = data.ClientId
            });
        }

        [HttpPost("update/{id}")]
        [Authorize]
        public async Task<IActionResult> Update(string id, [FromBody] BusinessData updated)
        {
            if (string.IsNullOrWhiteSpace(id) || updated == null)
                return BadRequest(new { message = "Invalid input" });

            var performedBy = User.FindFirstValue(ClaimTypes.Email);
            var existing = await _service.GetByIdAsync(id);

            if (existing == null)
                return NotFound(new { message = "Business not found" });

            updated.ClientId = existing.ClientId;
            updated.Sno = existing.Sno;
            updated.Status = existing.Status;
            updated.CreatedBy = existing.CreatedBy;

            var success = await _service.UpdateAsync(id, updated, performedBy);
            if (!success)
                return NotFound(new { message = "Business not updated" });

            return Ok(new { message = "Business updated successfully" });
        }

        [HttpPost("delete/{id}")]
        [Authorize]
        public async Task<IActionResult> SoftDelete(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest(new { message = "Invalid ID" });

            var result = await _service.MarkInactiveAsync(id);
            if (!result)
                return NotFound(new { message = "Data not found or already inactive" });

            return Ok(new { message = "Data marked as inactive" });
        }

        [HttpPost("status/{id}")]
        [Authorize]
        public async Task<IActionResult> ToggleStatus(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest(new { message = "Invalid ID" });

            var updated = await _service.ToggleStatusAsync(id);
            if (!updated)
                return NotFound(new { message = "Record not found or status not updated" });

            return Ok(new { message = "Status toggled successfully" });
        }

        [HttpPost("restore/{id}")]
        [Authorize]
        public async Task<IActionResult> Restore(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest(new { message = "Invalid ID" });

            var result = await _service.RestoreBusinessAsync(id);
            if (!result)
                return NotFound(new { message = "Business not found or already active" });

            return Ok(new { message = "Business restored successfully" });
        }
        [HttpGet("client/{clientId}")]
        [Authorize]
        public async Task<IActionResult> GetBusinessesByClient(string clientId)
        {
            if (string.IsNullOrWhiteSpace(clientId))
                return BadRequest(new { message = "Missing clientId" });

            var businesses = await _service.GetByClientIdAsync(clientId);

            var result = businesses
                .Where(b => b.Status != BusinessStatus.Inactive)
                .Select(b => new
                {
                    id = b.Id,
                    businessName = b.BusinessName,
                    type = b.Type,
                    status = b.Status
                });

            return Ok(result);
        }
        [HttpGet("all")]
        [Authorize]
        public async Task<IActionResult> GetAllActive()
        {
            try
            {
                var email = User.FindFirstValue(ClaimTypes.Email);
                var role = User.FindFirstValue("role") ?? "User";

                // fetch all active businesses without paging
                var (items, _) = await _service.GetFilteredAsync("active", role, email, null, 1, int.MaxValue);

                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }
    }
}
