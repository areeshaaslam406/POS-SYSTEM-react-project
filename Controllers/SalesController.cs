
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using WebApplication2.Models;
using WebApplication2.Repository;

namespace WebApplication2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        private readonly SalesMasterRepository _repo;

        public SalesController(SalesMasterRepository repo)
        {
            _repo = repo;
        }

        // GET: api/sales
        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                var sales = _repo.GetAll();
                return Ok(sales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving sales.", error = ex.Message });
            }
        }

        // GET: api/sales/{id}
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            try
            {
                Console.WriteLine($"SalesController.GetById called with ID: {id}");
                
                var sale = _repo.GetById(id);
                if (sale == null)
                {
                    Console.WriteLine($"Sale with ID {id} not found");
                    return NotFound(new { message = "Sale not found." });
                }

                Console.WriteLine($"Sale retrieved successfully: SaleId={sale.SaleId}, Details count={sale.Details?.Count ?? 0}");
                return Ok(sale);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SalesController.GetById: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error retrieving sale.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // GET: api/sales/salesperson/{salespersonId}
        [HttpGet("salesperson/{salespersonId}")]
        public IActionResult GetBySalesperson(int salespersonId)
        {
            try
            {
                var sales = _repo.GetBySalespersonId(salespersonId);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving sales by salesperson.", error = ex.Message });
            }
        }

        // POST: api/sales - Single endpoint for adding sales using stored procedure
        [HttpPost]
        public IActionResult Add([FromBody] BillRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Create SalesMaster from request with frontend-calculated total
                var salesMaster = new SalesMaster
                {
                    SalespersonId = request.SalespersonId,
                    Comments = request.Comments,
                    Total = request.Total // Use frontend-calculated total
                };

                // Generate complete bill using stored procedure
                int newSaleId = _repo.AddCompleteBill(salesMaster, request.Items);

                return Ok(new 
                { 
                    message = "Sale added successfully.",
                    saleId = newSaleId,
                    salesMaster = salesMaster
                });
            }
            catch (SqlException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error adding sale.", error = ex.Message });
            }
        }


        // PUT: api/sales/{id} - Update existing sale
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] BillRequest request)
        {
            try
            {
                // DEBUG: Log incoming request data
                Console.WriteLine($"DEBUG UPDATE: Updating sale ID {id}");
                Console.WriteLine($"DEBUG UPDATE: SalespersonId = {request.SalespersonId}");
                Console.WriteLine($"DEBUG UPDATE: Total = {request.Total}");
                Console.WriteLine($"DEBUG UPDATE: Comments = '{request.Comments}'");
                Console.WriteLine($"DEBUG UPDATE: Items count = {request.Items?.Count ?? 0}");
                
                if (request.Items != null)
                {
                    for (int i = 0; i < request.Items.Count; i++)
                    {
                        var item = request.Items[i];
                        Console.WriteLine($"  Item {i + 1}: ProductId={item.ProductId}, Name='{item.ProductName}', Price={item.RetailPrice}, Qty={item.Quantity}, Discount={item.Discount}");
                    }
                }

                var existing = _repo.GetById(id);
                if (existing == null)
                    return NotFound(new { message = "Sale not found." });

                // Create SalesMaster from request for update
                var updatedSale = new SalesMaster
                {
                    SaleId = id,
                    SalespersonId = request.SalespersonId,
                    Total = request.Total, // MISSING TOTAL - FIX!
                    Comments = request.Comments,
                    Details = request.Items // Use items from request
                };

                // Use enhanced update method that returns updated data
                var result = _repo.UpdateAndReturn(id, updatedSale);
                
                if (result != null)
                {
                    return Ok(new 
                    { 
                        message = "Sale updated successfully.",
                        salesMaster = result
                    });
                }
                else
                {
                    return StatusCode(500, new { message = "Failed to update sale." });
                }
            }
            catch (SqlException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating sale.", error = ex.Message });
            }
        }

        // DELETE: api/sales/{id} - Delete sale and return details
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                var deleteResult = _repo.DeleteWithDetails(id);
                
                if (!deleteResult.Success)
                    return NotFound(new { message = deleteResult.Message ?? "Sale not found." });

                return Ok(new 
                { 
                    message = deleteResult.Message,
                    deletedSale = new
                    {
                        saleId = deleteResult.DeletedSaleId,
                        salespersonId = deleteResult.SalespersonId,
                        salespersonName = deleteResult.SalespersonName,
                        total = deleteResult.DeletedTotal,
                        saleDate = deleteResult.DeletedSaleDate,
                        itemCount = deleteResult.DeletedItemCount
                    }
                });
            }
            catch (SqlException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting sale.", error = ex.Message });
            }
        }

        // Test endpoint to check if sale exists
        [HttpGet("{id}/exists")]
        public IActionResult CheckSaleExists(int id)
        {
            try
            {
                var exists = _repo.SaleExists(id);
                return Ok(new { saleId = id, exists = exists });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error checking sale existence.", error = ex.Message });
            }
        }

        // Test endpoint to check stored procedure
        [HttpGet("{id}/test")]
        public IActionResult TestGetSale(int id)
        {
            try
            {
                Console.WriteLine($"Testing sale retrieval for ID: {id}");
                
                // First check if sale exists
                var exists = _repo.SaleExists(id);
                if (!exists)
                {
                    return NotFound(new { message = $"Sale {id} does not exist in database" });
                }
                
                // Try to get the sale
                var sale = _repo.GetById(id);
                
                return Ok(new { 
                    message = "Test successful", 
                    saleExists = exists,
                    saleData = sale != null ? new {
                        saleId = sale.SaleId,
                        salespersonName = sale.SalespersonName,
                        detailsCount = sale.Details?.Count ?? 0,
                        total = sale.Total
                    } : null
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Test endpoint error: {ex.Message}");
                return StatusCode(500, new { 
                    message = "Test failed", 
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}

