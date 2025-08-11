using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;




namespace WebApplication2.Models
{
    public class Salesperson
    {
        public int SalespersonID { get; set; } // this is the PK

        [Required]
        public string Name { get; set; }

        [Required]
        public string Code { get; set; } // THIS IS UNIQUE 

        
        public DateTime EnteredDate { get; set; }
        public DateTime? UpdatedTime { get; set; }
    }

    public class DeleteSalespersonResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }
}
