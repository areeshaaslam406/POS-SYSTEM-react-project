using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
namespace WebApplication2.Models
{
    public class SalesDetail
    {
        public int SalesDetailId { get; set; } // this is a pk

        [Required]
        public int SaleId { get; set; } // this is fk from the table salesMaster

        [Required]
        public int ProductId { get; set; } // fk from products table

        public string? ProductName { get; set; } // Product name for display purposes

        [Required]
        public decimal RetailPrice { get; set; }

        [Required]
        public int Quantity { get; set; }

        public decimal Discount { get; set; }
    }
}
