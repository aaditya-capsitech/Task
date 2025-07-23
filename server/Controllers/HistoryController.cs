using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Services;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Only authenticated users can view history
    public class HistoryController : ControllerBase
    {
        private readonly HistoryService _historyService;

        public HistoryController(HistoryService historyService)
        {
            _historyService = historyService;
        }

        // Now uses query string: /api/history?businessId=mongodbid
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string businessId)
        {
            if (string.IsNullOrWhiteSpace(businessId))
                return BadRequest(new { message = "Business ID is required." });

            var logs = await _historyService.GetByBusinessIdAsync(businessId);
            return Ok(logs);
        }
    }
}
