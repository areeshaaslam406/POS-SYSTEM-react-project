//using Microsoft.Data.SqlClient;
//using System.Data;
//using WebApplication2.Models;

//namespace WebApplication2.Repository
//{
//    public class SalesDetailRepository
//    {
//        private readonly ConnectionHelper _connectionHelper;

//        public SalesDetailRepository(ConnectionHelper connectionHelper)
//        {
//            _connectionHelper = connectionHelper;
//        }

//        public List<SalesDetail> GetBySaleId(int saleId)
//        {
//            var salesDetails = new List<SalesDetail>();
//            using var conn = _connectionHelper.GetConnection();
//            using var cmd = new SqlCommand("sp_GetSalesDetailsBySaleId", conn);
//            cmd.CommandType = CommandType.StoredProcedure;
//            cmd.Parameters.AddWithValue("@SaleId", saleId);
//            conn.Open();

//            using var reader = cmd.ExecuteReader();
//            while (reader.Read())
//            {
//                salesDetails.Add(new SalesDetail
//                {
//                    SalesDetailId = Convert.ToInt32(reader["SalesDetailId"]),
//                    SaleId = Convert.ToInt32(reader["SaleId"]),
//                    ProductId = Convert.ToInt32(reader["ProductId"]),
//                    RetailPrice = Convert.ToDecimal(reader["RetailPrice"]),
//                    Quantity = Convert.ToInt32(reader["Quantity"]),
//                    Discount = Convert.ToDecimal(reader["Discount"])
//                });
//            }

//            return salesDetails;
//        }

//        public SalesDetail GetById(int id)
//        {
//            using var conn = _connectionHelper.GetConnection();
//            using var cmd = new SqlCommand("sp_GetSalesDetailById", conn);
//            cmd.CommandType = CommandType.StoredProcedure;
//            cmd.Parameters.AddWithValue("@SalesDetailId", id);
//            conn.Open();

//            using var reader = cmd.ExecuteReader();
//            if (reader.Read())
//            {
//                return new SalesDetail
//                {
//                    SalesDetailId = Convert.ToInt32(reader["SalesDetailId"]),
//                    SaleId = Convert.ToInt32(reader["SaleId"]),
//                    ProductId = Convert.ToInt32(reader["ProductId"]),
//                    RetailPrice = Convert.ToDecimal(reader["RetailPrice"]),
//                    Quantity = Convert.ToInt32(reader["Quantity"]),
//                    Discount = Convert.ToDecimal(reader["Discount"])
//                };
//            }

//            return null;
//        }

//        public void Add(SalesDetail salesDetail)
//        {
//            using var conn = _connectionHelper.GetConnection();
//            using var cmd = new SqlCommand("sp_AddSalesDetail", conn);
//            cmd.CommandType = CommandType.StoredProcedure;
//            cmd.Parameters.AddWithValue("@SaleId", salesDetail.SaleId);
//            cmd.Parameters.AddWithValue("@ProductId", salesDetail.ProductId);
//            cmd.Parameters.AddWithValue("@RetailPrice", salesDetail.RetailPrice);
//            cmd.Parameters.AddWithValue("@Quantity", salesDetail.Quantity);
//            cmd.Parameters.AddWithValue("@Discount", salesDetail.Discount);
//            conn.Open();
//            cmd.ExecuteNonQuery();
//        }

//        public void Update(int id, SalesDetail updated)
//        {
//            using var conn = _connectionHelper.GetConnection();
//            using var cmd = new SqlCommand("sp_UpdateSalesDetail", conn);
//            cmd.CommandType = CommandType.StoredProcedure;
//            cmd.Parameters.AddWithValue("@SalesDetailId", id);
//            cmd.Parameters.AddWithValue("@RetailPrice", updated.RetailPrice);
//            cmd.Parameters.AddWithValue("@Quantity", updated.Quantity);
//            cmd.Parameters.AddWithValue("@Discount", updated.Discount);
//            conn.Open();
//            cmd.ExecuteNonQuery();
//        }

//        public bool Delete(int id)
//        {
//            using var conn = _connectionHelper.GetConnection();
//            using var cmd = new SqlCommand("sp_DeleteSalesDetail", conn);
//            cmd.CommandType = CommandType.StoredProcedure;
//            cmd.Parameters.AddWithValue("@SalesDetailId", id);
//            conn.Open();
//            return cmd.ExecuteNonQuery() > 0;
//        }
//    }
//}
