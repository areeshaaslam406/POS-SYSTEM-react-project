using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace WebApplication2.Models
{
    public class Product
    {
        public int ProductId { get; set; } // id 

        [Required]
        //[MaxLength(6, ErrorMessage = "Code cannot exceed 6 characters.")]
        public string Code { get; set; } // code

        [Required]
        //[MaxLength(100, ErrorMessage = "Product name cannot exceed 100 characters.")]
        public string Name { get; set; }

        [Required]
        //[Range(0, double.MaxValue, ErrorMessage = "Cost Price must be non-negative")]
        public decimal CostPrice { get; set; }

        [Required]
        //[Range(0, double.MaxValue, ErrorMessage = "Retail Price must be non-negative")]
        public decimal RetailPrice { get; set; }

        public DateTime CreationDate { get; set; }
        public DateTime? UpdatedTime { get; set; }
    }

    public class DeleteProductResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }
}
