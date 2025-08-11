using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using WebApplication2.Models;
using WebApplication2.Repository;

namespace WebApplication2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalespersonController : ControllerBase
    {
        private readonly SalespersonRepository _repo;

        public SalespersonController(SalespersonRepository repo)
        {
            _repo = repo;
        }


        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                var salespersons = _repo.GetAll();
                return Ok(salespersons);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving salespersons.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            try
            {
                var salesperson = _repo.GetById(id);
                if (salesperson == null)
                    return NotFound(new { message = "Salesperson not found." });

                return Ok(salesperson);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the salesperson.", error = ex.Message });
            }
        }


        [HttpPost]
        public IActionResult Add([FromBody] Salesperson salesperson)
        {
            //// Validate code format
            //if (string.IsNullOrEmpty(salesperson.Code) ||
            //    salesperson.Code.Length != 6 ||
            //    !salesperson.Code.All(char.IsDigit))
            //{
            //    return BadRequest(new { message = "Code must be exactly 6 digits." });
            //}

            try
            {
                _repo.Add(salesperson);
                return Ok(new { message = "Salesperson added successfully." });
            }
            catch (SqlException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while adding the salesperson.", error = ex.Message });
            }
        }


        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Salesperson updated)
        {
            try
            {
                var existing = _repo.GetById(id);
                if (existing == null)
                    return NotFound(new { message = "Salesperson not found." });

                if (existing.Code != updated.Code)
                    return BadRequest(new { message = "Code cannot be changed." });

                _repo.UpdateName(id, updated.Name);
                return NoContent(); // 204 No Content
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the salesperson.", error = ex.Message });
            }
        }


        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                var result = _repo.DeleteWithDetails(id);
                
                if (result.Success)
                {
                    return Ok(new { message = result.Message });
                }
                else
                {
                    // Check if it's a "cannot delete" error or "not found" error
                    if (result.Message.Contains("has made sales"))
                    {
                        return Conflict(new { message = result.Message });
                    }
                    else
                    {
                        return NotFound(new { message = result.Message });
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the salesperson.", error = ex.Message });
            }
        }
    }
}
