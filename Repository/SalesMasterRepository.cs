using Microsoft.Data.SqlClient;
using System.Data;
using WebApplication2.Models;

namespace WebApplication2.Repository
{
    public class SalesMasterRepository
    {
        private readonly ConnectionHelper _connectionHelper;

        public SalesMasterRepository(ConnectionHelper connectionHelper)
        {
            _connectionHelper = connectionHelper;
        }

        //public List<SalesMaster> GetAll()
        //{
        //    var salesMasters = new List<SalesMaster>();
        //    using var conn = _connectionHelper.GetConnection();
        //    using var cmd = new SqlCommand("sp_GetAllSalesMasters", conn);
        //    cmd.CommandType = CommandType.StoredProcedure;
        //    conn.Open();

        //    using var reader = cmd.ExecuteReader();
        //    while (reader.Read())
        //    {
        //        salesMasters.Add(new SalesMaster
        //        {
        //            SaleId = Convert.ToInt32(reader["SaleId"]),
        //            Total = Convert.ToDecimal(reader["Total"]),

        //            SaleDate = Convert.ToDateTime(reader["SaleDate"]),
        //            SalespersonId = Convert.ToInt32(reader["SalespersonId"]),
        //            Comments = reader["Comments"] == DBNull.Value ? null : reader["Comments"].ToString(),
        //            UpdatedTime = reader["UpdatedTime"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(reader["UpdatedTime"])
        //        });
        //    }

        //    return salesMasters;
        //}
        public List<SalesMaster> GetAll()
        {
            var salesMasters = new List<SalesMaster>();
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_GetAllSalesMasters", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            conn.Open();

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                salesMasters.Add(new SalesMaster
                {
                    SaleId = Convert.ToInt32(reader["SaleId"]),
                    SaleDate = Convert.ToDateTime(reader["AddedTime"]),
                    UpdatedTime = reader["UpdatedTime"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(reader["UpdatedTime"]),
                    SalespersonId = Convert.ToInt32(reader["SalespersonId"]), // Now this will work
                    SalespersonName = reader["Salesperson"].ToString(),
                    Items = reader["Items"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Items"]),
                    Total = reader["TotalAmount"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["TotalAmount"]),
                    Comments = reader["Comments"] == DBNull.Value ? null : reader["Comments"].ToString()
                });
            }

            return salesMasters;
        }


        //public SalesMaster GetById(int id)
        //{
        //    using var conn = _connectionHelper.GetConnection();
        //    using var cmd = new SqlCommand("sp_GetSalesMasterById", conn);
        //    cmd.CommandType = CommandType.StoredProcedure;
        //    cmd.Parameters.AddWithValue("@SaleId", id);
        //    conn.Open();

        //    using var reader = cmd.ExecuteReader();
        //    if (reader.Read())
        //    {
        //        return new SalesMaster
        //        {
        //            SaleId = Convert.ToInt32(reader["SaleId"]),
        //            Total = Convert.ToDecimal(reader["Total"]),
        //            SaleDate = Convert.ToDateTime(reader["SaleDate"]),
        //            SalespersonId = Convert.ToInt32(reader["SalespersonId"]),
        //            Comments = reader["Comments"] == DBNull.Value ? null : reader["Comments"].ToString(),
        //            UpdatedTime = reader["UpdatedTime"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(reader["UpdatedTime"])
        //        };
        //    }

        //    return null;
        //}
        //public SalesMaster GetById(int id)
        //{
        //    using var conn = _connectionHelper.GetConnection();
        //    using var cmd = new SqlCommand("sp_GetSalesMasterById", conn);
        //    cmd.CommandType = CommandType.StoredProcedure;
        //    cmd.Parameters.AddWithValue("@SaleId", id);
        //    conn.Open();

        //    using var reader = cmd.ExecuteReader();

        //    SalesMaster salesMaster = null;

        //    // First result set - Header info
        //    if (reader.Read())
        //    {
        //        salesMaster = new SalesMaster
        //        {
        //            SaleId = Convert.ToInt32(reader["SaleId"]),
        //            SaleDate = Convert.ToDateTime(reader["SaleDate"]),
        //            UpdatedTime = reader["UpdatedTime"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(reader["UpdatedTime"]),
        //            SalespersonName = reader["Salesperson"].ToString(),
        //            Comments = reader["Comments"] == DBNull.Value ? null : reader["Comments"].ToString()
        //        };
        //    }

        //    if (salesMaster == null) return null;

        //    // Move to second result set (sale items) - we'll skip this for now
        //    reader.NextResult();
        //    int itemCount = 0;
        //    while (reader.Read())
        //    {
        //        itemCount++; // Count items if needed
        //    }
        //    salesMaster.Items = itemCount;

        //    // Move to third result set (totals)
        //    reader.NextResult();
        //    if (reader.Read())
        //    {
        //        salesMaster.Total = reader["Total"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["Total"]);
        //    }

        //    return salesMaster;
        //}
        public SalesMaster GetById(int id)
        {
            try
            {
                using var conn = _connectionHelper.GetConnection();
                using var cmd = new SqlCommand("sp_GetSalesMasterById", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@SaleId", id);
                
                conn.Open();

                using var reader = cmd.ExecuteReader();

                SalesMaster salesMaster = null;

                // First result set - Header info
                if (reader.Read())
                {
                    salesMaster = new SalesMaster
                    {
                        SaleId = Convert.ToInt32(reader["SaleId"]),
                        SaleDate = Convert.ToDateTime(reader["SaleDate"]),
                        UpdatedTime = reader["UpdatedTime"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(reader["UpdatedTime"]),
                        SalespersonId = Convert.ToInt32(reader["SalespersonId"]),
                        SalespersonName = reader["Salesperson"]?.ToString() ?? "Unknown",
                        Comments = reader["Comments"] == DBNull.Value ? null : reader["Comments"]?.ToString()
                    };
                }

                if (salesMaster == null) 
                {
                    return null;
                }

                // Move to second result set (sale items) - populate the Details list
                if (reader.NextResult())
                {
                    var salesDetails = new List<SalesDetail>();
                    
                    while (reader.Read())
                    {
                        // Debug: Log what we're reading from database
                        var productId = Convert.ToInt32(reader["ProductId"]);
                        var productName = reader["ProductName"]?.ToString();
                        var quantity = Convert.ToInt32(reader["Quantity"]);
                        var retailPrice = Convert.ToDecimal(reader["RetailPrice"]);
                        
                        Console.WriteLine($"DEBUG: Reading item - ProductId: {productId}, ProductName: {productName}, Quantity: {quantity}, Price: {retailPrice:F2}");
                        
                        var detail = new SalesDetail
                        {
                            SalesDetailId = Convert.ToInt32(reader["SalesDetailId"]),
                            SaleId = id,
                            ProductId = productId,
                            ProductName = productName ?? $"Product {productId}",
                            RetailPrice = retailPrice,
                            Quantity = quantity,
                            Discount = reader["Discount"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["Discount"])
                        };
                        
                        salesDetails.Add(detail);
                    }
                    salesMaster.Details = salesDetails;
                    salesMaster.Items = salesDetails.Count;
                    
                    Console.WriteLine($"DEBUG: Total items loaded: {salesDetails.Count}");
                }

                // Move to third result set (totals)
                if (reader.NextResult() && reader.Read())
                {
                    salesMaster.Total = reader["Total"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["Total"]);
                }

                return salesMaster;
            }
            catch (SqlException sqlEx)
            {
                throw new Exception($"Database error while retrieving sale {id}: {sqlEx.Message}", sqlEx);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving sale {id}: {ex.Message}", ex);
            }
        }

        public List<SalesMaster> GetBySalespersonId(int salespersonId)
        {
            var salesMasters = new List<SalesMaster>();
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_GetSalesMastersBySalespersonId", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SalespersonId", salespersonId);
            conn.Open();

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                salesMasters.Add(new SalesMaster
                {
                    SaleId = Convert.ToInt32(reader["SaleId"]),
                    Total = Convert.ToDecimal(reader["Total"]),
                    SaleDate = Convert.ToDateTime(reader["SaleDate"]),
                    SalespersonId = Convert.ToInt32(reader["SalespersonId"]),
                    Comments = reader["Comments"] == DBNull.Value ? null : reader["Comments"].ToString(),
                    UpdatedTime = reader["UpdatedTime"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(reader["UpdatedTime"])
                });
            }

            return salesMasters;
        }

        //public void Add(SalesMaster salesMaster)
        //{
        //   using var conn = _connectionHelper.GetConnection();
        //   using var cmd = new SqlCommand("sp_AddSalesMaster", conn);
        //   cmd.CommandType = CommandType.StoredProcedure;
        //   cmd.Parameters.AddWithValue("@Total", salesMaster.Total);
        //   cmd.Parameters.AddWithValue("@SalespersonId", salesMaster.SalespersonId);
        //   cmd.Parameters.AddWithValue("@Comments", salesMaster.Comments ?? (object)DBNull.Value);
        //   conn.Open();
        //   cmd.ExecuteNonQuery();
        //}
        //public int Add(SalesMaster salesMaster)
        //{
        //   using var conn = _connectionHelper.GetConnection();
        //   using var cmd = new SqlCommand("sp_AddSalesMaster", conn);
        //   cmd.CommandType = CommandType.StoredProcedure;

        //   // Parameters matching the corrected stored procedure
        //   cmd.Parameters.AddWithValue("@SalespersonId", salesMaster.SalespersonId);
        //   cmd.Parameters.AddWithValue("@Comments", salesMaster.Comments ?? (object)DBNull.Value);
        //   cmd.Parameters.AddWithValue("@Total", salesMaster.Total);

        //   conn.Open();

        //   int newSaleId = 0;
        //   using var reader = cmd.ExecuteReader();

        //   if (reader.Read())
        //   {
        //       newSaleId = Convert.ToInt32(reader["NewSaleId"]);

        //       // Update the salesMaster object with returned data
        //       salesMaster.SaleId = newSaleId;
        //       salesMaster.Total = Convert.ToDecimal(reader["Total"]);
        //       salesMaster.SaleDate = Convert.ToDateTime(reader["SaleDate"]);
        //       salesMaster.SalespersonName = reader["SalespersonName"].ToString();
        //       salesMaster.Comments = reader["Comments"] == DBNull.Value ? null : reader["Comments"].ToString();
        //   }

        //   return newSaleId;
        //}

        // public int Add(SalesMaster salesMaster, List<SalesDetail> salesDetails = null)
        // {
        //     using var conn = _connectionHelper.GetConnection();
        //     using var cmd = new SqlCommand("sp_AddSalesMaster", conn);
        //     cmd.CommandType = CommandType.StoredProcedure;

        //     // Parameters
        //     cmd.Parameters.AddWithValue("@SalespersonId", salesMaster.SalespersonId);
        //     cmd.Parameters.AddWithValue("@Comments", salesMaster.Comments ?? (object)DBNull.Value);

        //     // Build sales items string if details provided
        //     string salesItemsString = "";
        //     if (salesDetails != null && salesDetails.Any())
        //     {
        //         var itemStrings = salesDetails.Select(detail =>
        //             $"{detail.ProductId}:{detail.RetailPrice}:{detail.Quantity}:{detail.Discount}");
        //         salesItemsString = string.Join("|", itemStrings);
        //     }

        //     cmd.Parameters.AddWithValue("@SalesItems", salesItemsString);

        //     conn.Open();

        //     int newSaleId = 0;
        //     using var reader = cmd.ExecuteReader();

        //     if (reader.Read())
        //     {
        //         newSaleId = Convert.ToInt32(reader["NewSaleId"]);

        //         // Update the salesMaster object with returned data
        //         salesMaster.SaleId = newSaleId;
        //         salesMaster.Total = Convert.ToDecimal(reader["Total"]);
        //         salesMaster.SaleDate = Convert.ToDateTime(reader["SaleDate"]);
        //         salesMaster.SalespersonName = reader["SalespersonName"].ToString();
        //         salesMaster.Comments = reader["Comments"] == DBNull.Value ? null : reader["Comments"].ToString();
        //         salesMaster.Items = Convert.ToInt32(reader["TotalItems"]);
        //     }

        //     return newSaleId;
        // }
        // Updated Add method for frontend-calculated totals and discount amounts
        public int AddCompleteBill(SalesMaster salesMaster, List<SalesDetail> salesDetails = null)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_AddSalesMaster", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            // Parameters
            cmd.Parameters.AddWithValue("@SalespersonId", salesMaster.SalespersonId);
            cmd.Parameters.AddWithValue("@Total", salesMaster.Total); // Frontend calculated total
            cmd.Parameters.AddWithValue("@Comments", salesMaster.Comments ?? (object)DBNull.Value);

            // Build sales items string if details provided - FORMAT: ProductId:RetailPrice:Quantity:DiscountAmount
            string salesItemsString = "";
            if (salesDetails != null && salesDetails.Any())
            {
                var itemStrings = salesDetails.Select(detail =>
                    $"{detail.ProductId}:{detail.RetailPrice}:{detail.Quantity}:{detail.Discount}");
                salesItemsString = string.Join("|", itemStrings);
            }

            cmd.Parameters.AddWithValue("@SalesItems", salesItemsString);

            // Debug: Log what we're sending to the stored procedure
            Console.WriteLine($"DEBUG SAVE: Calling sp_AddSalesMaster with SalespersonId: {salesMaster.SalespersonId}, Total: {salesMaster.Total}");
            Console.WriteLine($"DEBUG SAVE: SalesItems string: {salesItemsString}");

            conn.Open();

            int newSaleId = 0;
            using var reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                newSaleId = Convert.ToInt32(reader["NewSaleId"]);

                // Update the salesMaster object with returned data
                salesMaster.SaleId = newSaleId;
                salesMaster.Total = Convert.ToDecimal(reader["Total"]);
                salesMaster.SaleDate = Convert.ToDateTime(reader["SaleDate"]);
                salesMaster.SalespersonName = reader["SalespersonName"].ToString();
                salesMaster.Comments = reader["Comments"] == DBNull.Value ? null : reader["Comments"].ToString();
                salesMaster.Items = Convert.ToInt32(reader["TotalItems"]);
                salesMaster.UpdatedTime = null; // Set to null for new records
                
                Console.WriteLine($"DEBUG SAVE: Sale created with ID: {newSaleId}, Total items: {salesMaster.Items}");
            }

            return newSaleId;
        }

        // Keep original Add method for backward compatibility
        public int Add(SalesMaster salesMaster)
        {
            return AddCompleteBill(salesMaster, null);
        }

        // Simple Add method for testing without stored procedure
        public int AddSimple(SalesMaster salesMaster)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand(@"
                INSERT INTO SalesMaster (SalespersonId, Comments, Total, SaleDate) 
                OUTPUT INSERTED.SaleId
                VALUES (@SalespersonId, @Comments, @Total, GETDATE())", conn);
            
            cmd.Parameters.AddWithValue("@SalespersonId", salesMaster.SalespersonId);
            cmd.Parameters.AddWithValue("@Comments", salesMaster.Comments ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Total", salesMaster.Total);
            
            conn.Open();
            
            var result = cmd.ExecuteScalar();
            return Convert.ToInt32(result);
        }
        public void Update(int id, SalesMaster updated)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_UpdateSalesMaster", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SaleId", id);
            cmd.Parameters.AddWithValue("@SalespersonId", updated.SalespersonId);
            cmd.Parameters.AddWithValue("@Comments", updated.Comments ?? (object)DBNull.Value);
            
            // Build sales items string from Details if provided
            string salesItemsString = "";
            if (updated.Details != null && updated.Details.Any())
            {
                var itemStrings = updated.Details.Select(detail =>
                    $"{detail.ProductId}:{detail.RetailPrice}:{detail.Quantity}:{detail.Discount}");
                salesItemsString = string.Join("|", itemStrings);
            }
            
            cmd.Parameters.AddWithValue("@SalesItems", salesItemsString);
            
            conn.Open();
            cmd.ExecuteNonQuery();
        }

        // Enhanced Update method that returns updated data
        public SalesMaster UpdateAndReturn(int id, SalesMaster updated)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_UpdateSalesMaster", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SaleId", id);
            cmd.Parameters.AddWithValue("@SalespersonId", updated.SalespersonId);
            cmd.Parameters.AddWithValue("@Total", updated.Total); // MISSING TOTAL PARAMETER - FIX!
            cmd.Parameters.AddWithValue("@Comments", updated.Comments ?? (object)DBNull.Value);
            
            // Build sales items string from Details if provided
            string salesItemsString = "";
            if (updated.Details != null && updated.Details.Any())
            {
                var itemStrings = updated.Details.Select(detail =>
                    $"{detail.ProductId}:{detail.RetailPrice}:{detail.Quantity}:{detail.Discount}");
                salesItemsString = string.Join("|", itemStrings);
                
                // DEBUG: Log the sales items string being sent to stored procedure
                Console.WriteLine($"DEBUG REPO: Sales Items String = '{salesItemsString}'");
            }
            else
            {
                Console.WriteLine("DEBUG REPO: No sales items provided for update");
            }
            
            cmd.Parameters.AddWithValue("@SalesItems", salesItemsString);
            
            conn.Open();
            
            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return new SalesMaster
                {
                    SaleId = Convert.ToInt32(reader["SaleId"]),
                    Total = Convert.ToDecimal(reader["Total"]),
                    SaleDate = Convert.ToDateTime(reader["SaleDate"]),
                    UpdatedTime = reader["UpdatedTime"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(reader["UpdatedTime"]),
                    SalespersonId = updated.SalespersonId,
                    SalespersonName = reader["SalespersonName"].ToString(),
                    Comments = reader["Comments"] == DBNull.Value ? null : reader["Comments"].ToString(),
                    Items = Convert.ToInt32(reader["TotalItems"])
                };
            }
            
            return null;
        }

        public bool Delete(int id)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_DeleteSalesMaster", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SaleId", id);
            
            conn.Open();
            
            try
            {
                var rowsAffected = cmd.ExecuteNonQuery();
                return rowsAffected > 0;
            }
            catch
            {
                return false;
            }
        }

        // Enhanced Delete method that returns deletion details
        public DeleteResult DeleteWithDetails(int id)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_DeleteSalesMaster", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SaleId", id);
            
            conn.Open();
            
            try
            {
                using var reader = cmd.ExecuteReader();
                
                // Check if there are any results (which means deletion was successful)
                if (reader.HasRows && reader.Read())
                {
                    return new DeleteResult
                    {
                        Success = true,
                        DeletedSaleId = Convert.ToInt32(reader["DeletedSaleId"]),
                        SalespersonId = Convert.ToInt32(reader["SalespersonId"]),
                        SalespersonName = reader["SalespersonName"]?.ToString() ?? "",
                        DeletedTotal = Convert.ToDecimal(reader["DeletedTotal"]),
                        DeletedSaleDate = Convert.ToDateTime(reader["DeletedSaleDate"]),
                        DeletedItemCount = Convert.ToInt32(reader["DeletedItemCount"]),
                        Message = reader["Message"]?.ToString() ?? "Sale successfully deleted"
                    };
                }
                
                // If no results returned, it means the sale was not found
                return new DeleteResult { Success = false, Message = "Sale not found." };
            }
            catch (Exception ex)
            {
                // If there's an exception, the SP might have thrown an error (like sale not found)
                if (ex.Message.Contains("does not exist"))
                {
                    return new DeleteResult { Success = false, Message = "Sale not found." };
                }
                return new DeleteResult { Success = false, Message = $"Error deleting sale: {ex.Message}" };
            }
        }

        // Test method to check if sale exists
        public bool SaleExists(int id)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("SELECT COUNT(*) FROM SalesMasters WHERE SaleId = @SaleId", conn);
            cmd.Parameters.AddWithValue("@SaleId", id);
            
            conn.Open();
            var count = Convert.ToInt32(cmd.ExecuteScalar());
            return count > 0;
        }
    }
}
