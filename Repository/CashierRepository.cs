using Microsoft.Data.SqlClient;
using System.Data;
using WebApplication2.Models;

namespace WebApplication2.Repository
{
    public class SalespersonRepository
    {
        private readonly ConnectionHelper _connectionHelper;
        public SalespersonRepository(ConnectionHelper connectionHelper)
        {
            _connectionHelper = connectionHelper;
        }
        public List<Salesperson> GetAll()
        {
            var salespersons = new List<Salesperson>();
            using var conn = _connectionHelper.GetConnection();
            //using var cmd = new SqlCommand("cashier.sp_GetAllCashiers", conn);
            using var cmd = new SqlCommand("sp_GetAllSalespersons", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            conn.Open();

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                salespersons.Add(new Salesperson
                {
                    SalespersonID = Convert.ToInt32(reader["SalespersonID"]),
                    Name = reader["Name"].ToString(),
                    Code = reader["Code"].ToString(),
                    EnteredDate = Convert.ToDateTime(reader["EnteredDate"]),
                    UpdatedTime = reader["UpdatedTime"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(reader["UpdatedTime"])
                });
            }

            return salespersons;
        }

        public Salesperson GetById(int id)
        {
            Salesperson salesperson = null;
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_GetSalespersonById", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SalespersonID", id);
            conn.Open();

            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                salesperson = new Salesperson
                {
                    SalespersonID = Convert.ToInt32(reader["SalespersonID"]),
                    Name = reader["Name"].ToString(),
                    Code = reader["Code"].ToString(),
                    EnteredDate = Convert.ToDateTime(reader["EnteredDate"]),
                    UpdatedTime = reader["UpdatedTime"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(reader["UpdatedTime"])
                };
            }

            return salesperson;
        }

        public void Add(Salesperson salesperson)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_AddSalesperson", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@Name", salesperson.Name);
            cmd.Parameters.AddWithValue("@Code", salesperson.Code);
            conn.Open();
            cmd.ExecuteNonQuery();
        }

       
        public void UpdateName(int id, string newName)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_UpdateSalespersonName", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SalespersonID", id);
            cmd.Parameters.AddWithValue("@Name", newName);
            conn.Open();
            cmd.ExecuteNonQuery();
        }

        public bool Delete(int id)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_DeleteSalesperson", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SalespersonID", id);
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
        public DeleteSalespersonResult DeleteWithDetails(int id)
        {
            using var conn = _connectionHelper.GetConnection();
            using var cmd = new SqlCommand("sp_DeleteSalesperson", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SalespersonID", id);
            conn.Open();
            
            try
            {
                using var reader = cmd.ExecuteReader();
                
                // If we get here and can read a result, deletion was successful
                if (reader.Read())
                {
                    return new DeleteSalespersonResult
                    {
                        Success = true,
                        Message = reader["Message"]?.ToString() ?? "Salesperson successfully deleted."
                    };
                }
                
                return new DeleteSalespersonResult
                {
                    Success = true,
                    Message = "Salesperson successfully deleted."
                };
            }
            catch (SqlException ex)
            {
                return new DeleteSalespersonResult
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }
    }
}
