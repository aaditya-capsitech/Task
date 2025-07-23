using Microsoft.AspNetCore.Authorization; // CHANGE: Needed for [Authorize]
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using server.DTOs;
using server.Models;
using server.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly UserService _userService;

        public AuthController(IConfiguration config, UserService userService)
        {
            _config = config;
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FirstName) ||
                string.IsNullOrWhiteSpace(dto.LastName) ||
                string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new { message = "All fields are required." });
            }

            if (dto.Password.Length < 8)
            {
                return BadRequest(new { message = "Password must be at least 8 characters long." });
            }

            var existingUser = await _userService.GetByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Email already registered." });
            }

            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Password = dto.Password,
                Role = dto.Role ?? "Admin"
            };

            await _userService.CreateAsync(user);

            return Ok(new { message = "User registered successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            var user = await _userService.GetByEmailAsync(login.Email);

            if (user == null || user.Password != login.Password)
            {
                return Unauthorized(new { message = "Invalid credentials." });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                message = "Login successful",
                token,
                user = new
                {
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    role = user.Role,
                    gender = user.Gender,
                    dob = user.Dob,
                    address = user.Address
                }
            });
        }

        // CHANGE: Add new endpoint to allow password change
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrWhiteSpace(email))
                return Unauthorized(new { message = "Unauthorized." });

            var user = await _userService.GetByEmailAsync(email);
            if (user == null)
                return NotFound(new { message = "User not found." });

            if (user.Password != dto.CurrentPassword)
                return BadRequest(new { message = "Current password is incorrect." });

            if (dto.NewPassword != dto.ConfirmPassword)
                return BadRequest(new { message = "New passwords do not match." });

            if (dto.NewPassword.Length < 8)
                return BadRequest(new { message = "New password must be at least 8 characters long." });

            var updated = await _userService.UpdatePasswordAsync(email, dto.NewPassword); // Use UpdatePasswordAsync
            if (!updated)
                return StatusCode(500, new { message = "Failed to update password." });

            return Ok(new { message = "Password updated successfully." });
        }


        private string GenerateJwtToken(User user)
        {
            var key = _config["JwtSettings:Key"];
            var issuer = _config["JwtSettings:Issuer"];
            var audience = _config["JwtSettings:Audience"];

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName),
                new Claim("role", user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        [HttpPost("update-profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrWhiteSpace(email))
                return Unauthorized(new { message = "Unauthorized." });

            var user = await _userService.GetByEmailAsync(email);
            if (user == null)
                return NotFound(new { message = "User not found." });

            user.Gender = dto.Gender;
            user.Dob = dto.Dob;
            user.Address = new Address
            {
                House = dto.Address.House,
                Street = dto.Address.Street,
                City = dto.Address.City,
                State = dto.Address.State,
                Pincode = dto.Address.Pincode,
                Country = dto.Address.Country
            };

            var updated = await _userService.UpdateAsync(user.Id!, user);
            if (!updated)
                return StatusCode(500, new { message = "Failed to update profile." });

            return Ok(new { message = "Profile updated successfully." });
        }

    }
}
