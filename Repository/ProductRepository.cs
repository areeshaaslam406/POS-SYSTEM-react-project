using Microsoft.Data.SqlClient;
using System.Data;
using WebApplication2.Models;

namespace WebApplication2.Repository
{
    public class ProductsRepository
    {
        private readonly ConnectionHelper _connectionHelper;

        public ProductsRepository(ConnectionHelper connectionHelper)
        {
            _connectionHelper = connectionHelper;
        }

        public List<Product> GetAll()
        {
            var products = new List<Product>();
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_GetAllProducts", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            conn.Open();

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                products.Add(new Product
                {
                    ProductId = Convert.ToInt32(reader["ProductId"]),
                    Code = reader["Code"].ToString(),
                    Name = reader["Name"].ToString(),
                    CostPrice = Convert.ToDecimal(reader["CostPrice"]),
                    RetailPrice = Convert.ToDecimal(reader["RetailPrice"]),
                    CreationDate = Convert.ToDateTime(reader["CreationDate"]),
                    UpdatedTime = reader["UpdatedTime"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(reader["UpdatedTime"])
                });
            }

            return products;
        }

        public Product GetById(int id)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_GetProductsById", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@ProductId", id);
            conn.Open();

            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return new Product
                {
                    ProductId = Convert.ToInt32(reader["ProductId"]),
                    Code = reader["Code"].ToString(),
                    Name = reader["Name"].ToString(),
                    CostPrice = Convert.ToDecimal(reader["CostPrice"]),
                    RetailPrice = Convert.ToDecimal(reader["RetailPrice"]),
                    CreationDate = Convert.ToDateTime(reader["CreationDate"]),
                    UpdatedTime = reader["UpdatedTime"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(reader["UpdatedTime"])
                };
            }

            return null;
        }

        public void Add(Product product)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_AddProduct", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@Code", product.Code);
            cmd.Parameters.AddWithValue("@Name", product.Name);
            cmd.Parameters.AddWithValue("@CostPrice", product.CostPrice);
            cmd.Parameters.AddWithValue("@RetailPrice", product.RetailPrice);
            conn.Open();
            cmd.ExecuteNonQuery();
        }

        public void Update(int id, Product updated)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_UpdateProduct", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@ProductId", id);
            cmd.Parameters.AddWithValue("@Name", updated.Name);
            cmd.Parameters.AddWithValue("@CostPrice", updated.CostPrice);
            cmd.Parameters.AddWithValue("@RetailPrice", updated.RetailPrice);
            conn.Open();
            cmd.ExecuteNonQuery();
        }

        public bool Delete(int id)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_DeleteProduct", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@ProductId", id);
            conn.Open();
            
            try
            {
                cmd.ExecuteNonQuery();
                return true; // Deletion successful
            }
            catch (SqlException ex)
            {
                // The stored procedure will throw an error if deletion is not allowed
                throw new InvalidOperationException(ex.Message);
            }
        }

        // Enhanced delete method that returns detailed result
        public DeleteProductResult DeleteWithDetails(int id)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_DeleteProduct", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@ProductId", id);
            conn.Open();
            
            try
            {
                using var reader = cmd.ExecuteReader();
                
                // If we get here and can read a result, deletion was successful
                if (reader.Read())
                {
                    return new DeleteProductResult
                    {
                        Success = true,
                        Message = reader["Message"]?.ToString() ?? "Product successfully deleted."
                    };
                }
                
                return new DeleteProductResult
                {
                    Success = true,
                    Message = "Product successfully deleted."
                };
            }
            catch (SqlException ex)
            {
                return new DeleteProductResult
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }
    }
}
