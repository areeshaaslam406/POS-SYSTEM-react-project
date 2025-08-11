using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using WebApplication2.Models;
using WebApplication2.Repository;

namespace WebApplication2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ProductsRepository _repo;

        public ProductsController(ProductsRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                var products = _repo.GetAll();
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving products.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            try
            {
                var product = _repo.GetById(id);
                if (product == null)
                    return NotFound(new { message = "Product not found." });

                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving product.", error = ex.Message });
            }
        }

        [HttpPost]
        public IActionResult Add([FromBody] Product product)
        {
            try
            {
                _repo.Add(product);
                return Ok(new { message = "Product added successfully." });
            }
            catch (SqlException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error adding product.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Product updated)
        {
            try
            {
                var existing = _repo.GetById(id);
                if (existing == null)
                    return NotFound(new { message = "Product not found." });

                if (existing.Code.ToLower() != updated.Code.ToLower())
                    return BadRequest(new { message = "Product code cannot be changed." });

                _repo.Update(id, updated);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating product.", error = ex.Message });
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
                    if (result.Message.Contains("has been sold"))
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
                return StatusCode(500, new { message = "Error deleting product.", error = ex.Message });
            }
        }
    }
}
