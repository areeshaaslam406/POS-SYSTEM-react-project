//using Microsoft.AspNetCore.Mvc;
//using Microsoft.Data.SqlClient;
//using WebApplication2.Models;
//using WebApplication2.Repository;

//namespace WebApplication2.Controllers
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    public class SalesDetailController : ControllerBase
//    {
//        private readonly SalesDetailRepository _repo;

//        public SalesDetailController(SalesDetailRepository repo)
//        {
//            _repo = repo;
//        }

//        [HttpGet("sale/{saleId}")]
//        public IActionResult GetBySaleId(int saleId)
//        {
//            try
//            {
//                var salesDetails = _repo.GetBySaleId(saleId);
//                return Ok(salesDetails);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { message = "Error retrieving sales details.", error = ex.Message });
//            }
//        }

//        [HttpGet("{id}")]
//        public IActionResult GetById(int id)
//        {
//            try
//            {
//                var salesDetail = _repo.GetById(id);
//                if (salesDetail == null)
//                    return NotFound(new { message = "Sales detail not found." });

//                return Ok(salesDetail);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { message = "Error retrieving sales detail.", error = ex.Message });
//            }
//        }

//        [HttpPost]
//        public IActionResult Add([FromBody] SalesDetail salesDetail)
//        {
//            try
//            {
//                _repo.Add(salesDetail);
//                return Ok(new { message = "Sales detail added successfully." });
//            }
//            catch (SqlException ex)
//            {
//                return Conflict(new { message = ex.Message });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { message = "Error adding sales detail.", error = ex.Message });
//            }
//        }

//        [HttpPut("{id}")]
//        public IActionResult Update(int id, [FromBody] SalesDetail updated)
//        {
//            try
//            {
//                var existing = _repo.GetById(id);
//                if (existing == null)
//                    return NotFound(new { message = "Sales detail not found." });

//                _repo.Update(id, updated);
//                return NoContent();
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { message = "Error updating sales detail.", error = ex.Message });
//            }
//        }

//        [HttpDelete("{id}")]
//        public IActionResult Delete(int id)
//        {
//            try
//            {
//                var deleted = _repo.Delete(id);
//                if (!deleted)
//                    return NotFound(new { message = "Sales detail not found." });

//                return NoContent();
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { message = "Error deleting sales detail.", error = ex.Message });
//            }
//        }
//    }
//}
