using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace WebApplication2.Repository
{
    public class ConnectionHelper
    {
        private readonly IConfiguration _config;

        public ConnectionHelper(IConfiguration config)
        {
            _config = config;
        }

        public SqlConnection GetConnection()
        {
            return new SqlConnection(_config.GetConnectionString("DefaultConnection"));
        }
    }
}
